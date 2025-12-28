const { app, BrowserWindow, ipcMain, shell, dialog } = require('electron');
const path = require('path');
const fs = require('fs-extra');
const axios = require('axios');
const m3u8Parser = require('m3u8-parser');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static');
const { URL } = require('url');
const { spawn } = require('child_process');

// Set ffmpeg path
ffmpeg.setFfmpegPath(ffmpegPath);

let mainWindow;
const historyPath = path.join(app.getPath('userData'), 'history.json');

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1000,
        height: 800,
        frame: true, // Restore default frame for standard OS window controls
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true,
        },
    });
    // Restore default frame for standard OS window controls
    mainWindow.setMenuBarVisibility(false);

    // Initial Load
    if (process.env.NODE_ENV === 'development' || !app.isPackaged) {
        mainWindow.loadURL('http://localhost:5173');
        mainWindow.webContents.openDevTools();
    } else {
        mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
    }
}

app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// --- Helper: History ---
async function addToHistory(item) {
    try {
        let history = [];
        if (await fs.pathExists(historyPath)) {
            history = await fs.readJson(historyPath);
        }
        // Add new item to top
        history.unshift({
            ...item,
            completedAt: new Date().toISOString()
        });
        // Limit history size (e.g., 50)
        if (history.length > 50) history = history.slice(0, 50);
        await fs.writeJson(historyPath, history);
    } catch (err) {
        console.error('Failed to save history:', err);
    }
}

// --- IPC Handlers ---

ipcMain.handle('check-env', async () => {
    return { ffmpegPath };
});

ipcMain.on('open-folder', (event, dir) => {
    shell.showItemInFolder(dir); // Selects the file
});

ipcMain.handle('select-directory', async (event) => {
    const result = await dialog.showOpenDialog(mainWindow, {
        properties: ['openDirectory']
    });
    if (result.canceled) {
        return null;
    } else {
        return result.filePaths[0];
    }
});

// History IPC
ipcMain.handle('get-history', async () => {
    if (await fs.pathExists(historyPath)) {
        return await fs.readJson(historyPath);
    }
    return [];
});

ipcMain.handle('clear-history', async () => {
    await fs.writeJson(historyPath, []);
    return true;
});

// Update & System IPC
ipcMain.handle('get-app-version', () => app.getVersion());

const UPDATE_SOURCES = [
    'https://cdn.jsdelivr.net/gh/su469843/M3U8-Downloader@main/chenglog/version.json',
    'https://cdn.staticaly.com/gh/su469843/M3U8-Downloader/main/chenglog/version.json',
    'https://raw.githubusercontent.com/su469843/M3U8-Downloader/main/chenglog/version.json'
];

ipcMain.handle('check-for-updates', async () => {
    const currentVersion = app.getVersion();

    for (const url of UPDATE_SOURCES) {
        try {
            const res = await axios.get(url, { timeout: 3000 });
            const remoteData = res.data;
            // Expected format: { version: "1.0.1", url: "http...", changelog: "..." }

            if (remoteData.version && remoteData.version !== currentVersion) {
                return {
                    hasUpdate: true,
                    ...remoteData
                };
            }
        } catch (e) {
            console.warn(`Update check failed for ${url}:`, e.message);
        }
    }
    return { hasUpdate: false };
});

ipcMain.handle('run-uninstaller', () => {
    // Attempt to find uninstaller. 
    // Usually in the same dir as the executable for NSIS builds named 'Uninstall M3U8 Downloader.exe'
    const appPath = path.dirname(app.getPath('exe'));
    const uninstallerName = 'Uninstall M3U8 Downloader.exe'; // Standard Electron Builder name
    const uninstallerPath = path.join(appPath, uninstallerName);

    if (fs.existsSync(uninstallerPath)) {
        spawn(uninstallerPath, { detached: true, stdio: 'ignore' });
        app.quit();
    } else {
        dialog.showErrorBox("卸载失败", "未找到卸载程序。可能是开发环境或文件已丢失。");
    }
});


// --- Download Manager Logic ---

class DownloadTask {
    constructor(id, url, fileName, savePath, sender) {
        this.id = id;
        this.url = url;
        this.fileName = fileName;
        this.savePath = savePath || app.getPath('downloads');
        this.sender = sender;
        this.tempDir = path.join(app.getPath('userData'), 'temp_downloads', String(id));
        this.downloadedSegments = 0;
        this.totalSegments = 0;
        this.downloadedBytes = 0;
        this.lastSpeedUpdate = Date.now();
        this.lastBytes = 0;
        this.isCancelled = false;
        this.isPaused = false;
        this.pausePromise = null;
        this.pauseResolver = null;
        this.batchResults = [];
    }

    pause() {
        this.isPaused = true;
        this.log('任务已暂停', 'warn');
        this.pausePromise = new Promise(resolve => {
            this.pauseResolver = resolve;
        });
    }

    resume() {
        if (this.isPaused && this.pauseResolver) {
            this.isPaused = false;
            this.log('任务已恢复', 'info');
            this.pauseResolver();
            this.pausePromise = null;
            this.pauseResolver = null;
        }
    }

    async checkPaused() {
        if (this.isPaused && this.pausePromise) {
            await this.pausePromise;
        }
    }

    cancel() {
        this.isCancelled = true;
        this.resume(); // Ensure it's not stuck in pause
        this.log('任务已手动取消', 'warn');
    }

    log(msg, type = 'info') {
        if (!this.sender.isDestroyed()) {
            this.sender.send('download-log', { id: this.id, text: msg, type });
        }
    }

    progress(phase, percent, speed = '') {
        if (!this.sender.isDestroyed()) {
            this.sender.send('download-progress', {
                id: this.id,
                phase,
                percent,
                current: this.downloadedSegments,
                total: this.totalSegments,
                speed
            });
        }
    }

    error(msg) {
        if (!this.sender.isDestroyed()) {
            this.sender.send('download-error', { id: this.id, message: msg });
        }
    }

    complete(filePath) {
        if (!this.sender.isDestroyed()) {
            this.sender.send('download-complete', { id: this.id, filePath });
        }
        // Save to history
        addToHistory({
            id: this.id,
            fileName: this.fileName,
            url: this.url,
            filePath,
            savePath: this.savePath
        });
    }

    updateFileName(newName) {
        if (newName && newName.trim()) {
            this.fileName = newName.trim();
            this.log(`文件名已更新为: ${this.fileName}`);
        }
    }

    async parseM3U8(data) {
        const parser = new m3u8Parser.Parser();
        parser.push(data);
        parser.end();
        return parser.manifest;
    }

    formatSpeed(bytesPerSec) {
        if (bytesPerSec < 1024) return bytesPerSec.toFixed(0) + ' B/s';
        else if (bytesPerSec < 1024 * 1024) return (bytesPerSec / 1024).toFixed(1) + ' KB/s';
        else return (bytesPerSec / (1024 * 1024)).toFixed(1) + ' MB/s';
    }

    async start() {
        try {
            this.log(`正在获取 M3U8: ${this.url}`);

            // 1. Fetch M3U8
            let m3u8Url = this.url;
            const response = await axios.get(m3u8Url);
            let manifest = await this.parseM3U8(response.data);

            if (!manifest.segments || manifest.segments.length === 0) {
                if (manifest.playlists && manifest.playlists.length > 0) {
                    const subUrl = new URL(manifest.playlists[0].uri, m3u8Url).toString();
                    this.log(`检测到主播放列表，自动选择第一个流: ${subUrl}`);
                    const subRes = await axios.get(subUrl);
                    manifest = await this.parseM3U8(subRes.data);
                    m3u8Url = subUrl;

                    if (!manifest.segments || manifest.segments.length === 0) {
                        throw new Error('无法解析视频分片。');
                    }
                } else {
                    throw new Error('无效的 M3U8 文件，未找到分片。');
                }
            }

            // Check Encryption
            const isEncrypted = manifest.segments.some(seg => seg.key && seg.key.method && seg.key.method !== 'NONE');
            if (isEncrypted) {
                throw new Error('不支持加密的视频流 (检测到 EXT-X-KEY)。');
            }

            this.totalSegments = manifest.segments.length;
            this.log(`解析成功，共 ${this.totalSegments} 个分片。准备下载...`);
            await fs.ensureDir(this.tempDir);

            // 2. Download Segments
            const segmentFiles = [];
            const getSegmentUrl = (segUri) => new URL(segUri, m3u8Url).toString();

            // Task queue
            const tasks = manifest.segments.map((seg, index) => async () => {
                const segUrl = getSegmentUrl(seg.uri);
                const fileName = `${index}.ts`;
                const filePath = path.join(this.tempDir, fileName);
                segmentFiles[index] = filePath;

                try {
                    const writer = fs.createWriteStream(filePath);
                    const response = await axios({
                        url: segUrl,
                        method: 'GET',
                        responseType: 'stream'
                    });

                    // Track bytes for speed calculation
                    response.data.on('data', (chunk) => {
                        this.downloadedBytes += chunk.length;
                    });

                    response.data.pipe(writer);

                    return new Promise((resolve, reject) => {
                        writer.on('finish', () => {
                            this.downloadedSegments++;

                            // Calculate speed roughly every 1s
                            const now = Date.now();
                            if (now - this.lastSpeedUpdate > 500) {
                                const diffBytes = this.downloadedBytes - this.lastBytes;
                                const diffTime = (now - this.lastSpeedUpdate) / 1000;
                                const speed = this.formatSpeed(diffBytes / diffTime);

                                this.lastBytes = this.downloadedBytes;
                                this.lastSpeedUpdate = now;

                                const percent = Math.round((this.downloadedSegments / this.totalSegments) * 100);
                                this.progress('downloading', percent, speed);
                            }

                            resolve();
                        });
                        writer.on('error', reject);
                    });
                } catch (err) {
                    this.log(`分片 ${index} 下载失败: ${err.message}`, 'error');
                    throw err;
                }
            });

            // Run batch
            const batchSize = 10;
            for (let i = 0; i < tasks.length; i += batchSize) {
                await this.checkPaused();
                if (this.isCancelled) {
                    this.error('下载已手动取消');
                    return;
                }
                const batch = tasks.slice(i, i + batchSize).map(t => t());
                await Promise.all(batch);
            }

            // Final progress update
            this.progress('downloading', 100, '0 KB/s');

            this.log('所有分片下载完成。开始合并...');
            this.progress('merging', 0);

            // 3. Merge
            const fileListPath = path.join(this.tempDir, 'files.txt');
            const fileContent = segmentFiles.map(f => `file '${f.replace(/\\/g, '/')}'`).join('\n');
            await fs.writeFile(fileListPath, fileContent);

            // Sanitize filename
            const safeName = this.fileName.replace(/[^a-z0-9\u4e00-\u9fa5_\-\.]/gi, '_');
            let outputFileName = `${safeName}.mp4`;

            // Avoid overwrite using provided save path
            let finalOutputPath = path.join(this.savePath, outputFileName);
            let counter = 1;
            while (await fs.pathExists(finalOutputPath)) {
                finalOutputPath = path.join(this.savePath, `${safeName}_${counter}.mp4`);
                counter++;
            }

            ffmpeg()
                .input(fileListPath)
                .inputOptions(['-f', 'concat', '-safe', '0'])
                .outputOptions('-c', 'copy')
                .output(finalOutputPath)
                .on('progress', (progress) => {
                    const percent = Math.round(progress.percent || 0);
                    this.progress('merging', percent);
                })
                .on('end', () => {
                    this.log(`合并完成! 文件已保存至: ${finalOutputPath}`, 'success');
                    this.complete(finalOutputPath);
                    fs.remove(this.tempDir).catch(console.error);
                })
                .on('error', (err) => {
                    this.error(`合并失败: ${err.message}`);
                })
                .run();

        } catch (err) {
            this.error(`错误: ${err.message}`);
        }
    }

    parseM3U8(content) {
        return new Promise((resolve) => {
            const parser = new m3u8Parser.Parser();
            parser.push(content);
            parser.end();
            resolve(parser.manifest);
        });
    }
}

const activeDownloads = new Map();

ipcMain.on('download-start', (event, { url, fileName, savePath }) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 5);
    const task = new DownloadTask(id, url, fileName, savePath, event.sender);
    activeDownloads.set(id, task);

    event.reply('download-started', { id, url, fileName });
    task.start();
});

ipcMain.on('download-rename', (event, { id, newName }) => {
    const task = activeDownloads.get(id);
    if (task) {
        task.updateFileName(newName);
    }
});

ipcMain.on('download-cancel', (event, id) => {
    const task = activeDownloads.get(id);
    if (task) {
        task.cancel();
    }
    activeDownloads.delete(id);
});

ipcMain.on('download-pause', (event, id) => {
    const task = activeDownloads.get(id);
    if (task) {
        task.pause();
    }
});

ipcMain.on('download-resume', (event, id) => {
    const task = activeDownloads.get(id);
    if (task) {
        task.resume();
    }
});

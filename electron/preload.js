const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    startDownload: (data) => ipcRenderer.send('download-start', data),
    renameDownload: (id, newName) => ipcRenderer.send('download-rename', { id, newName }),
    cancelDownload: (id) => ipcRenderer.send('download-cancel', id),
    pauseDownload: (id) => ipcRenderer.send('download-pause', id),
    resumeDownload: (id) => ipcRenderer.send('download-resume', id),
    selectDirectory: () => ipcRenderer.invoke('select-directory'),
    checkEnv: () => ipcRenderer.invoke('check-env'),

    // History
    getHistory: () => ipcRenderer.invoke('get-history'),
    clearHistory: () => ipcRenderer.invoke('clear-history'),

    // Updates & System
    getAppVersion: () => ipcRenderer.invoke('get-app-version'),
    checkForUpdates: (cdnUrls) => ipcRenderer.invoke('check-for-updates', cdnUrls),
    runUninstaller: () => ipcRenderer.invoke('run-uninstaller'),

    // Events
    onStarted: (callback) => ipcRenderer.on('download-started', (event, value) => callback(value)),
    onProgress: (callback) => ipcRenderer.on('download-progress', (event, value) => callback(value)),
    onLog: (callback) => ipcRenderer.on('download-log', (event, value) => callback(value)),
    onComplete: (callback) => ipcRenderer.on('download-complete', (event, value) => callback(value)),
    onError: (callback) => ipcRenderer.on('download-error', (event, value) => callback(value)),
    openFolder: (path) => ipcRenderer.send('open-folder', path)
});

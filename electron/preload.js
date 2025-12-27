const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    startDownload: (data) => ipcRenderer.send('download-start', data),
    renameDownload: (id, newName) => ipcRenderer.send('download-rename', { id, newName }),
    selectDirectory: () => ipcRenderer.invoke('select-directory'),
    checkEnv: () => ipcRenderer.invoke('check-env'),
    onStarted: (callback) => ipcRenderer.on('download-started', (event, value) => callback(value)),
    onProgress: (callback) => ipcRenderer.on('download-progress', (event, value) => callback(value)),
    onLog: (callback) => ipcRenderer.on('download-log', (event, value) => callback(value)),
    onComplete: (callback) => ipcRenderer.on('download-complete', (event, value) => callback(value)),
    onError: (callback) => ipcRenderer.on('download-error', (event, value) => callback(value)),
    openFolder: (path) => ipcRenderer.send('open-folder', path)
});

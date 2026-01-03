import io from 'socket.io-client';

const isElectron = window.electronAPI !== undefined;

let socket = null;

export const api = {
    startDownload: async (params) => {
        if (isElectron) return window.electronAPI.startDownload(params);

        const res = await fetch('/api/download/start', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(params)
        });
        return res.json();
    },

    pauseDownload: async (id) => {
        if (isElectron) return window.electronAPI.pauseDownload(id);

        const res = await fetch('/api/download/pause', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id })
        });
        return res.json();
    },

    resumeDownload: async (id) => {
        if (isElectron) return window.electronAPI.resumeDownload(id);

        const res = await fetch('/api/download/resume', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id })
        });
        return res.json();
    },

    cancelDownload: async (id) => {
        if (isElectron) return window.electronAPI.cancelDownload(id);

        const res = await fetch('/api/download/cancel', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id })
        });
        return res.json();
    },

    renameDownload: async (id, newName) => {
        if (isElectron) return window.electronAPI.renameDownload(id, newName);

        const res = await fetch('/api/download/rename', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, newName })
        });
        return res.json();
    },

    getHistory: async () => {
        if (isElectron) return window.electronAPI.getHistory();

        const res = await fetch('/api/history');
        return res.json();
    },

    clearHistory: async () => {
        if (isElectron) return window.electronAPI.clearHistory();

        const res = await fetch('/api/history/clear', { method: 'POST' });
        return res.json();
    },

    getAppVersion: async () => {
        if (isElectron) return window.electronAPI.getAppVersion();
        return "Browser Mode";
    },

    checkForUpdates: async () => {
        if (isElectron) return window.electronAPI.checkForUpdates();
        return { hasUpdate: false };
    },

    openFolder: async (path) => {
        if (isElectron) return window.electronAPI.openFolder(path);
        alert('浏览器环境下无法直接打开文件夹');
    },

    selectDirectory: async () => {
        if (isElectron) return window.electronAPI.selectDirectory();
        return null; // 浏览器环境使用服务器默认路径
    }
};

export const initSocket = (callbacks) => {
    if (isElectron) {
        window.electronAPI.onStarted(callbacks.onStarted);
        window.electronAPI.onLog(callbacks.onLog);
        window.electronAPI.onProgress(callbacks.onProgress);
        window.electronAPI.onComplete(callbacks.onComplete);
        window.electronAPI.onError(callbacks.onError);
    } else {
        if (!socket) {
            socket = io();
        }
        socket.on('download-started', callbacks.onStarted);
        socket.on('download-log', callbacks.onLog);
        socket.on('download-progress', callbacks.onProgress);
        socket.on('download-complete', callbacks.onComplete);
        socket.on('download-error', callbacks.onError);
    }
};

export const removeListeners = () => {
    if (isElectron) {
        window.electronAPI.removeAllListeners?.('download-started');
        window.electronAPI.removeAllListeners?.('download-log');
        window.electronAPI.removeAllListeners?.('download-progress');
        window.electronAPI.removeAllListeners?.('download-complete');
        window.electronAPI.removeAllListeners?.('download-error');
    } else if (socket) {
        socket.off('download-started');
        socket.off('download-log');
        socket.off('download-progress');
        socket.off('download-complete');
        socket.off('download-error');
    }
};

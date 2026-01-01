import React, { useState, useEffect, useRef } from 'react';

// --- Sidebar Components ---
function Sidebar({ activeTab, onTabChange }) {
    const menuItems = [
        { id: 'downloader', icon: '⬇️', label: '下载器' },
        { id: 'history', icon: '🕒', label: '历史记录' },
        { id: 'settings', icon: '⚙️', label: '设置 & 关于' }
    ];

    return (
        <div className="sidebar">
            <div className="sidebar-title">M3U8<br /><span style={{ fontSize: '0.6em', opacity: 0.7 }}>Downloader</span></div>
            <div className="sidebar-menu">
                {menuItems.map(item => (
                    <div
                        key={item.id}
                        className={`menu-item ${activeTab === item.id ? 'active' : ''}`}
                        onClick={() => onTabChange(item.id)}
                    >
                        <span className="menu-icon">{item.icon}</span>
                        <span className="menu-label">{item.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

// --- Main App ---

function App() {
    const [activeTab, setActiveTab] = useState('downloader');
    const [downloads, setDownloads] = useState([]);

    // Global Listeners
    useEffect(() => {
        if (!window.electronAPI) return;

        window.electronAPI.onStarted((data) => {
            setDownloads(prev => {
                if (prev.find(d => d.id === data.id)) return prev;
                return [...prev, {
                    id: data.id,
                    url: data.url,
                    title: data.fileName || 'Unknown',
                    status: '正在初始化...',
                    progress: 0,
                    speed: '0 KB/s',
                    logs: [],
                    phase: 'init'
                }];
            });
        });

        window.electronAPI.onLog((data) => {
            setDownloads(prev => prev.map(d => {
                if (d.id === data.id) {
                    return { ...d, logs: [...d.logs, { text: data.text, type: data.type, id: Date.now() + Math.random() }] };
                }
                return d;
            }));
        });

        window.electronAPI.onProgress((data) => {
            setDownloads(prev => prev.map(d => {
                if (d.id === data.id) {
                    let statusText = d.status;
                    if (data.phase === 'downloading') {
                        statusText = `下载中: ${data.current} / ${data.total}`;
                    } else if (data.phase === 'merging') {
                        statusText = `正在合并 (FFmpeg): ${data.percent}%`;
                    }
                    return {
                        ...d,
                        phase: data.phase,
                        progress: data.percent,
                        speed: data.speed,
                        status: statusText
                    };
                }
                return d;
            }));
        });

        window.electronAPI.onComplete((data) => {
            setDownloads(prev => prev.map(d => {
                if (d.id === data.id) {
                    return {
                        ...d,
                        status: '已完成!',
                        progress: 100,
                        phase: 'complete',
                        filePath: data.filePath
                    };
                }
                return d;
            }));
        });

        window.electronAPI.onError((data) => {
            setDownloads(prev => prev.map(d => {
                if (d.id === data.id) {
                    return { ...d, status: '错误: ' + data.message, phase: 'error' };
                }
                return d;
            }));
        });

        // Cleanup IPC listeners on unmount
        return () => {
            window.electronAPI.removeAllListeners?.('download-started');
            window.electronAPI.removeAllListeners?.('download-log');
            window.electronAPI.removeAllListeners?.('download-progress');
            window.electronAPI.removeAllListeners?.('download-complete');
            window.electronAPI.removeAllListeners?.('download-error');
        };
    }, []);

    const handleRename = (id, newName) => {
        setDownloads(prev => prev.map(d => {
            if (d.id === id) {
                return { ...d, title: newName };
            }
            return d;
        }));
        window.electronAPI.renameDownload(id, newName);
    };

    const handleCancel = (id) => {
        setDownloads(prev => prev.filter(d => d.id !== id));
        window.electronAPI.cancelDownload(id);
    };

    const handlePause = (id) => {
        setDownloads(prev => prev.map(d => {
            if (d.id === id) return { ...d, isPaused: true, status: '已暂停' };
            return d;
        }));
        window.electronAPI.pauseDownload(id);
    };

    const handleResume = (id) => {
        setDownloads(prev => prev.map(d => {
            if (d.id === id) return { ...d, isPaused: false, status: '恢复中...' };
            return d;
        }));
        window.electronAPI.resumeDownload(id);
    };

    const handleRetry = (item) => {
        // Remove the failed item
        setDownloads(prev => prev.filter(d => d.id !== item.id));
        // Start a new download with the same parameters
        window.electronAPI.startDownload({ url: item.url, fileName: item.title, savePath: item.savePath || '' });
    };

    return (
        <div className="app-container">
            <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
            <div className="main-content">
                {activeTab === 'downloader' && (
                    <DownloaderView
                        downloads={downloads}
                        onRename={handleRename}
                        onCancel={handleCancel}
                        onPause={handlePause}
                        onResume={handleResume}
                        onRetry={handleRetry}
                    />
                )}
                {activeTab === 'history' && (
                    <HistoryView />
                )}
                {activeTab === 'settings' && (
                    <SettingsView />
                )}
            </div>
        </div>
    );
}

// --- Views ---

function DownloaderView({ downloads, onRename, onCancel, onPause, onResume, onRetry }) {
    const [url, setUrl] = useState('');
    const [fileName, setFileName] = useState('');
    const [savePath, setSavePath] = useState('');

    const handleDownload = () => {
        if (!url) return;
        const finalName = fileName.trim() || `video_${Date.now()}`;
        window.electronAPI.startDownload({ url, fileName: finalName, savePath });
        setUrl('');
        setFileName('');
    };

    const handleSelectDirectory = async () => {
        const path = await window.electronAPI.selectDirectory();
        if (path) {
            setSavePath(path);
        }
    };

    return (
        <div className="view-container">
            <h2>新建任务</h2>
            <div className="card">
                <div className="input-row">
                    <div className="input-group" style={{ marginBottom: '1rem' }}>
                        <input
                            type="text"
                            placeholder="在此输入 M3U8 视频链接..."
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                        />
                    </div>
                </div>

                <div className="input-row control-row">
                    <input
                        type="text"
                        className="filename-input"
                        placeholder="文件名 (可选)"
                        value={fileName}
                        onChange={(e) => setFileName(e.target.value)}
                        style={{ flex: '1' }}
                    />

                    <button className="btn-secondary" onClick={handleSelectDirectory} title={savePath || "默认位置: 下载文件夹"}>
                        {savePath ? '📁 自定义位置' : '📁 默认位置'}
                    </button>

                    <button className="btn" onClick={handleDownload} disabled={!url}>
                        开始下载
                    </button>
                </div>
                {savePath && <div className="path-display">保存至: {savePath}</div>}
            </div>

            <div className="downloads-list">
                {downloads.length === 0 && <p style={{ textAlign: 'center', color: '#888' }}>暂无正在进行的任务</p>}
                {downloads.map(item => (
                    <DownloadItem
                        key={item.id}
                        item={item}
                        onRename={onRename}
                        onCancel={onCancel}
                        onPause={onPause}
                        onResume={onResume}
                        onRetry={onRetry}
                    />
                ))}
            </div>
        </div>
    );
}

function HistoryView() {
    const [history, setHistory] = useState([]);

    useEffect(() => {
        refreshHistory();
    }, []);

    const refreshHistory = async () => {
        if (window.electronAPI) {
            const list = await window.electronAPI.getHistory();
            setHistory(list);
        }
    };

    const clearHistory = async () => {
        if (confirm('确定要清空所有历史记录吗？')) {
            await window.electronAPI.clearHistory();
            refreshHistory();
        }
    };

    const openFolder = (path) => {
        window.electronAPI.openFolder(path);
    };

    return (
        <div className="view-container">
            <div className="view-header">
                <h2>历史记录</h2>
                <button className="btn-small" onClick={clearHistory}>清空历史</button>
            </div>

            <div className="history-list">
                {history.length === 0 && <p className="empty-text">暂无历史记录</p>}
                {history.map((item, index) => (
                    <div key={index} className="history-item">
                        <div className="history-icon">✅</div>
                        <div className="history-info">
                            <div className="history-title">{item.fileName || 'Unknown File'}</div>
                            <div className="history-path">{item.filePath}</div>
                            <div className="history-time">{new Date(item.completedAt).toLocaleString()}</div>
                        </div>
                        <button className="btn-small" onClick={() => openFolder(item.filePath)}>📂 打开</button>
                    </div>
                ))}
            </div>
        </div>
    );
}

function SettingsView() {
    const [appVersion, setAppVersion] = useState('Checking...');
    const [updateStatus, setUpdateStatus] = useState(null);

    useEffect(() => {
        window.electronAPI.getAppVersion().then(setAppVersion);
    }, []);

    const checkForUpdates = async () => {
        setUpdateStatus({ text: '正在检查更新...', type: 'info' });

        const result = await window.electronAPI.checkForUpdates();

        if (result.hasUpdate) {
            setUpdateStatus({
                text: `发现新版本 v${result.version} !`,
                type: 'success',
                changelog: result.changelog || '暂无更新日志',
                downloadUrl: result.url
            });
        } else {
            setUpdateStatus({ text: '当前已是最新版本。', type: 'info' });
        }
    };

    const handleUninstall = () => {
        if (confirm('确定要卸载本程序吗？应用将立即关闭并启动卸载程序。')) {
            window.electronAPI.runUninstaller();
        }
    };

    return (
        <div className="view-container">
            <h2>设置 & 关于</h2>

            <div className="card">
                <h3>关于应用</h3>
                <p>当前版本: <strong>v{appVersion}</strong></p>
                <div className="divider"></div>

                <h4>检查更新</h4>
                <p style={{ fontSize: '0.9rem', color: '#aaa', marginBottom: '1rem' }}>
                    应用将自动从官方源 (jsDelivr, GitHub) 检查最新版本。
                </p>
                <button className="btn" onClick={checkForUpdates}>
                    检查更新
                </button>

                {updateStatus && (
                    <div className={`update-box ${updateStatus.type}`}>
                        <div className="update-msg">{updateStatus.text}</div>
                        {updateStatus.downloadUrl && (
                            <>
                                <pre className="changelog">{updateStatus.changelog}</pre>
                                <a href={updateStatus.downloadUrl} target="_blank" rel="noopener noreferrer" className="download-link">点击下载新版本</a>
                            </>
                        )}
                    </div>
                )}
            </div>

            <div className="card" style={{ marginTop: '2rem', borderColor: 'rgba(255, 100, 100, 0.3)' }}>
                <h3 style={{ color: '#ff6b6b' }}>危险区域</h3>
                <p style={{ fontSize: '0.9rem', color: '#aaa' }}>需要移除应用？</p>
                <button className="btn-danger" onClick={handleUninstall}>卸载程序</button>
            </div>
        </div>
    );
}

// Reuse DownloadItem from previous code
function DownloadItem({ item, onRename, onCancel, onPause, onResume, onRetry }) {
    const [showLogs, setShowLogs] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState(item.title);
    const logsEndRef = useRef(null);

    useEffect(() => {
        if (showLogs) {
            logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [item.logs, showLogs]);

    const openFolder = () => {
        if (item.filePath && window.electronAPI) {
            window.electronAPI.openFolder(item.filePath);
        }
    };

    const saveName = () => {
        if (editName.trim() && editName !== item.title) {
            onRename(item.id, editName);
        }
        setIsEditing(false);
    };

    return (
        <div className={`download-item ${item.phase}`}>
            <div className="item-header">
                <div className="item-info">
                    <div className="item-title-row">
                        {isEditing ? (
                            <div className="edit-box">
                                <input
                                    type="text"
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    autoFocus
                                    onBlur={saveName}
                                    onKeyDown={(e) => e.key === 'Enter' && saveName()}
                                />
                            </div>
                        ) : (
                            <div className="item-title" title={item.title}>
                                <strong>{item.title}</strong>
                                {item.phase === 'downloading' && (
                                    <span className="edit-icon" onClick={() => setIsEditing(true)}> ✎</span>
                                )}
                            </div>
                        )}
                    </div>
                    <div className="item-url" title={item.url}>{item.url}</div>
                    <div className="item-meta">
                        <span className="status-badge">{item.status}</span>
                        {item.phase === 'downloading' && <span className="speed-badge">{item.speed}</span>}
                    </div>
                </div>
                <div className="item-btns">
                    {item.phase === 'complete' && (
                        <button className="btn-small p-2" onClick={openFolder}>📂</button>
                    )}
                    {(item.phase === 'downloading' || item.phase === 'error' || item.phase === 'merging') && (
                        <>
                            {item.phase === 'downloading' && (
                                <button
                                    className="btn-small p-2"
                                    onClick={() => item.isPaused ? onResume(item.id) : onPause(item.id)}
                                    title={item.isPaused ? "恢复" : "暂停"}
                                >
                                    {item.isPaused ? '▶️' : '⏸️'}
                                </button>
                            )}
                            {item.phase === 'error' && (
                                <button className="btn-small btn-retry p-2" onClick={() => onRetry(item)} title="重试">
                                    🔄
                                </button>
                            )}
                            <button className="btn-small btn-danger p-2" onClick={() => onCancel(item.id)} title="取消/移除">✕</button>
                        </>
                    )}
                    {item.phase === 'complete' && (
                        <button className="btn-small p-2" onClick={() => onCancel(item.id)} title="移除">✕</button>
                    )}
                </div>
            </div>

            <div className="progress-container-small">
                <div className="progress-bar-small" style={{ width: `${item.progress}%` }}></div>
            </div>

            <div className="item-actions">
                <div className="log-toggle" onClick={() => setShowLogs(!showLogs)}>
                    {showLogs ? '隐藏日志' : '显示日志'}
                </div>
            </div>

            {showLogs && (
                <div className="item-logs">
                    {item.logs.map(log => (
                        <div key={log.id} className={`log-entry log-${log.type}`}>&gt; {log.text}</div>
                    ))}
                    <div ref={logsEndRef} />
                </div>
            )}
        </div>
    );
}

export default App;

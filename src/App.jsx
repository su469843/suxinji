import React, { useState, useEffect, useRef } from 'react';

function App() {
    const [url, setUrl] = useState('');
    const [fileName, setFileName] = useState('');
    const [savePath, setSavePath] = useState(''); // Empty string means default
    const [downloads, setDownloads] = useState([]);

    const downloadsRef = useRef([]);
    downloadsRef.current = downloads;

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
                        statusText = '正在合并 (FFmpeg)...';
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

    }, []);

    const handleDownload = () => {
        if (!url) return;
        const finalName = fileName.trim() || `video_${Date.now()}`;
        // Pass savePath (if empty/null, backend will use default)
        window.electronAPI.startDownload({ url, fileName: finalName, savePath });
        setUrl('');
        setFileName('');
        // We probably want to keep the save path persistent, so don't clear it
    };

    const handleSelectDirectory = async () => {
        const path = await window.electronAPI.selectDirectory();
        if (path) {
            setSavePath(path);
        }
    };

    const handleRename = (id, newName) => {
        setDownloads(prev => prev.map(d => {
            if (d.id === id) {
                return { ...d, title: newName };
            }
            return d;
        }));
        window.electronAPI.renameDownload(id, newName);
    };

    return (
        <div className="container">
            <h1>M3U8 极速下载器 (多任务版)</h1>

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
                {downloads.length === 0 && <p style={{ textAlign: 'center', color: '#888' }}>暂无下载任务</p>}
                {downloads.map(item => (
                    <DownloadItem key={item.id} item={item} onRename={handleRename} />
                ))}
            </div>
        </div>
    );
}

function DownloadItem({ item, onRename }) {
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
                {item.phase === 'complete' && (
                    <button className="btn-small p-2" onClick={openFolder}>打开文件</button>
                )}
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

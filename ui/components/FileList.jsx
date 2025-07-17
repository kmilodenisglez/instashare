'use client';

import { useEffect, useState } from 'react';
import { api } from '../lib/api';

export default function FileList() {
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [renameId, setRenameId] = useState(null);
    const [newName, setNewName] = useState('');

    const fetchFiles = async () => {
        setLoading(true);
        try {
            const response = await api.getFiles();
            const data = await response.json();
            setFiles(data);
        } catch (error) {
            console.error('Failed to fetch files:', error);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchFiles();
    }, []);

    const handleRename = async (fileId) => {
        try {
            await api.renameFile(fileId, newName);
            setRenameId(null);
            setNewName('');
            fetchFiles();
        } catch (error) {
            console.error('Failed to rename file:', error);
        }
    };

    if (loading) return <div>Loading files...</div>;

    return (
        <div>
            <h3>Your Files</h3>
            <table className="files-table">
                <thead>
                <tr>
                    <th>Name</th>
                    <th>Status</th>
                    <th>Size (bytes)</th>
                    <th>Actions</th>
                </tr>
                </thead>
                <tbody>
                {files.map((file) => (
                    <tr key={file.id}>
                        <td className="name-column">
                            {renameId === file.id ? (
                                <div className="rename-controls">
                                    <input
                                        className="rename-input"
                                        value={newName}
                                        onChange={e => setNewName(e.target.value)}
                                        placeholder="New name"
                                    />
                                    <button className="save-btn" onClick={() => handleRename(file.id)}>Save</button>
                                    <button className="cancel-btn" onClick={() => setRenameId(null)}>Cancel</button>
                                </div>
                            ) : (
                                <span className="filename">{file.filename}</span>
                            )}
                        </td>
                        <td>
                            <span className={`status-badge status-${file.status}`}>
                                {file.status}
                            </span>
                        </td>
                        <td className="size-column">{file.size?.toLocaleString()}</td>
                        <td>
                            <div className="action-buttons">
                                <button 
                                    className="action-btn rename-btn" 
                                    onClick={() => setRenameId(file.id)}
                                >
                                    <svg className="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                    </svg>
                                    Rename
                                </button>
                                {file.status === 'zipped' && file.zip_ipfs_hash && (
                                    <button
                                        className="action-btn download-zip-btn"
                                        onClick={() => window.open(api.downloadZip(file.id), '_blank')}
                                    >
                                        <svg className="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        ZIP
                                    </button>
                                )}
                                <button
                                    className="action-btn download-original-btn"
                                    onClick={() => window.open(api.downloadFile(file.id), '_blank')}
                                >
                                    <svg className="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1" />
                                    </svg>
                                    Original
                                </button>
                            </div>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
            <button className="refresh-btn" onClick={fetchFiles} style={{marginTop: 16}}>
                Refresh Files
            </button>
            <style jsx>{`
                .files-table {
                    width: 100%;
                    border-collapse: collapse;
                    background: white;
                    border-radius: 8px;
                    overflow: hidden;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                    margin-bottom: 16px;
                }

                .files-table th {
                    background: #f8f9fa;
                    color: #495057;
                    font-weight: 600;
                    padding: 12px 16px;
                    text-align: left;
                    border-bottom: 2px solid #dee2e6;
                    font-size: 14px;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .files-table td {
                    padding: 12px 16px;
                    border-bottom: 1px solid #e9ecef;
                    color: #495057;
                    vertical-align: middle;
                }

                .files-table tr:hover {
                    background-color: #f8f9fa;
                }

                .files-table tr:last-child td {
                    border-bottom: none;
                }

                /* Name column - wider */
                .files-table th:first-child,
                .name-column {
                    width: 40%;
                    min-width: 200px;
                }

                .filename {
                    font-weight: 500;
                    color: #212529;
                }

                .rename-controls {
                    display: flex;
                    gap: 8px;
                    align-items: center;
                }

                .rename-input {
                    flex: 1;
                    padding: 6px 10px;
                    border: 1px solid #ced4da;
                    border-radius: 4px;
                    font-size: 14px;
                }

                .rename-input:focus {
                    outline: none;
                    border-color: #2bdcd2;
                    box-shadow: 0 0 0 2px rgba(43, 220, 210, 0.2);
                }

                .save-btn, .cancel-btn {
                    padding: 4px 12px;
                    border: none;
                    border-radius: 4px;
                    font-size: 12px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .save-btn {
                    background: #28a745;
                    color: white;
                }

                .save-btn:hover {
                    background: #218838;
                }

                .cancel-btn {
                    background: #6c757d;
                    color: white;
                }

                .cancel-btn:hover {
                    background: #5a6268;
                }

                /* Status column */
                .status-badge {
                    padding: 4px 12px;
                    border-radius: 12px;
                    font-size: 12px;
                    font-weight: 500;
                    text-transform: capitalize;
                }

                .status-pending {
                    background: #fff3cd;
                    color: #856404;
                }

                .status-processing {
                    background: #d1ecf1;
                    color: #0c5460;
                }

                .status-completed {
                    background: #d4edda;
                    color: #155724;
                }

                .status-failed {
                    background: #f8d7da;
                    color: #721c24;
                }

                .status-zipped {
                    background: #e2e3e5;
                    color: #383d41;
                }

                /* Size column */
                .size-column {
                    width: 15%;
                    text-align: right;
                    font-family: monospace;
                    font-size: 13px;
                }

                /* Actions column */
                .files-table th:last-child,
                .files-table td:last-child {
                    width: 20%;
                    text-align: center;
                }

                .action-buttons {
                    display: flex;
                    gap: 8px;
                    justify-content: center;
                    flex-wrap: wrap;
                }

                .action-btn {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    border: none;
                    border-radius: 6px;
                    padding: 8px 12px;
                    font-size: 13px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    text-decoration: none;
                    min-width: fit-content;
                }

                .btn-icon {
                    width: 16px;
                    height: 16px;
                    flex-shrink: 0;
                }

                .rename-btn {
                    background: #2bdcd2;
                    color: #171717;
                }

                .rename-btn:hover {
                    background: #24b5ab;
                    transform: translateY(-1px);
                    box-shadow: 0 2px 8px rgba(43, 220, 210, 0.3);
                }

                .download-zip-btn {
                    background: #4285f4;
                    color: white;
                }

                .download-zip-btn:hover {
                    background: #3367d6;
                    transform: translateY(-1px);
                    box-shadow: 0 2px 8px rgba(66, 133, 244, 0.3);
                }

                .download-original-btn {
                    background: #34a853;
                    color: white;
                }

                .download-original-btn:hover {
                    background: #2d8f47;
                    transform: translateY(-1px);
                    box-shadow: 0 2px 8px rgba(52, 168, 83, 0.3);
                }

                .refresh-btn {
                    background: #2bdcd2;
                    color: #171717;
                    border: none;
                    border-radius: 6px;
                    padding: 10px 20px;
                    font-size: 14px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                    box-shadow: 0 2px 4px rgba(43, 220, 210, 0.2);
                }

                .refresh-btn:hover {
                    background: #24b5ab;
                    transform: translateY(-1px);
                    box-shadow: 0 4px 8px rgba(43, 220, 210, 0.3);
                }

                /* Responsive design */
                @media (max-width: 768px) {
                    .files-table {
                        font-size: 14px;
                    }
                    
                    .files-table th,
                    .files-table td {
                        padding: 8px 12px;
                    }
                    
                    .rename-controls {
                        flex-direction: column;
                        gap: 4px;
                    }
                    
                    .size-column {
                        display: none;
                    }

                    .action-buttons {
                        flex-direction: column;
                        gap: 4px;
                    }

                    .action-btn {
                        padding: 6px 10px;
                        font-size: 12px;
                    }

                    .btn-icon {
                        width: 14px;
                        height: 14px;
                    }
                }
            `}</style>
        </div>
    );
}
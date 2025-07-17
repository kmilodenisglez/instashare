'use client';

import { useEffect, useState } from 'react';

export default function FileList() {
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [renameId, setRenameId] = useState(null);
    const [newName, setNewName] = useState('');

    const fetchFiles = async () => {
        setLoading(true);
        const res = await fetch('http://localhost:8000/api/v1/files', {
            credentials: 'include',
        });
        if (res.ok) {
            setFiles(await res.json());
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchFiles();
    }, []);

    const handleRename = async (fileId) => {
        const res = await fetch(`http://localhost:8000/api/v1/files/${fileId}?new_name=${encodeURIComponent(newName)}`, {
            method: 'PATCH',
            credentials: 'include',
        });
        if (res.ok) {
            setRenameId(null);
            setNewName('');
            fetchFiles();
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
                            <button className="action-btn" onClick={() => setRenameId(file.id)}>
                                Rename
                            </button>
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
                    width: 15%;
                    text-align: center;
                }

                .action-btn {
                    background: #2bdcd2;
                    color: #171717;
                    border: none;
                    border-radius: 4px;
                    padding: 6px 16px;
                    font-size: 13px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .action-btn:hover {
                    background: #24b5ab;
                    transform: translateY(-1px);
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
                }
            `}</style>
        </div>
    );
}
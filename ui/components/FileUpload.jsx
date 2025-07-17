'use client';

import { useState } from 'react';
import {api} from "../lib/api";

export default function FileUpload({ onUploadSuccess }) {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
        setError('');
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!file) return;
        setUploading(true);
        setError('');
        const formData = new FormData();
        formData.append('uploaded_file', file);

        const res = await api.uploadFile(formData);

        if (res.ok) {
            setFile(null);
            onUploadSuccess && onUploadSuccess();
        } else {
            setError('Upload failed. Are you logged in?');
        }
        setUploading(false);
    };

    return (
        <div className="file-upload-container">
            <form onSubmit={handleUpload} className="file-upload-form">
                <div className="file-input-wrapper">
                    <input 
                        type="file" 
                        onChange={handleFileChange}
                        className="file-input"
                        id="file-upload"
                    />
                    <label htmlFor="file-upload" className="file-input-label">
                        <svg className="upload-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <span className="file-input-text">
                            {file ? file.name : 'Choose file or drag & drop'}
                        </span>
                    </label>
                </div>
                
                <button 
                    type="submit" 
                    disabled={uploading || !file}
                    className="upload-button"
                >
                    {uploading ? (
                        <>
                            <div className="spinner"></div>
                            Uploading...
                        </>
                    ) : (
                        <>
                            <svg className="button-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                            </svg>
                            Upload File
                        </>
                    )}
                </button>
                
                {error && (
                    <div className="error-message">
                        <svg className="error-icon" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {error}
                    </div>
                )}
            </form>

            <style jsx>{`
                .file-upload-container {
                    background: white;
                    border-radius: 12px;
                    padding: 24px;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                    border: 1px solid #e9ecef;
                    margin-bottom: 24px;
                }

                .file-upload-form {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }

                .file-input-wrapper {
                    position: relative;
                }

                .file-input {
                    position: absolute;
                    opacity: 0;
                    width: 100%;
                    height: 100%;
                    cursor: pointer;
                }

                .file-input-label {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 32px 24px;
                    border: 2px dashed #cbd5e0;
                    border-radius: 8px;
                    background: #f8f9fa;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    min-height: 120px;
                }

                .file-input-label:hover {
                    border-color: #2bdcd2;
                    background: #f0fffe;
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(43, 220, 210, 0.15);
                }

                .file-input:focus + .file-input-label {
                    border-color: #2bdcd2;
                    background: #f0fffe;
                    outline: 2px solid rgba(43, 220, 210, 0.2);
                    outline-offset: 2px;
                }

                .upload-icon {
                    width: 32px;
                    height: 32px;
                    color: #6c757d;
                    margin-bottom: 8px;
                    transition: color 0.3s ease;
                }

                .file-input-label:hover .upload-icon {
                    color: #2bdcd2;
                }

                .file-input-text {
                    font-size: 16px;
                    font-weight: 500;
                    color: #495057;
                    text-align: center;
                    transition: color 0.3s ease;
                }

                .file-input-label:hover .file-input-text {
                    color: #2bdcd2;
                }

                .upload-button {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    background: #2bdcd2;
                    color: #171717;
                    border: none;
                    border-radius: 8px;
                    padding: 12px 24px;
                    font-size: 16px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    box-shadow: 0 2px 8px rgba(43, 220, 210, 0.2);
                    min-height: 48px;
                }

                .upload-button:hover:not(:disabled) {
                    background: #24b5ab;
                    transform: translateY(-2px);
                    box-shadow: 0 4px 16px rgba(43, 220, 210, 0.3);
                }

                .upload-button:active:not(:disabled) {
                    transform: translateY(0);
                    box-shadow: 0 2px 8px rgba(43, 220, 210, 0.2);
                }

                .upload-button:disabled {
                    background: #e9ecef;
                    color: #6c757d;
                    cursor: not-allowed;
                    transform: none;
                    box-shadow: none;
                }

                .button-icon {
                    width: 20px;
                    height: 20px;
                }

                .spinner {
                    width: 20px;
                    height: 20px;
                    border: 2px solid #6c757d;
                    border-top: 2px solid #171717;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                }

                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }

                .error-message {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 12px 16px;
                    background: #f8d7da;
                    color: #721c24;
                    border: 1px solid #f5c6cb;
                    border-radius: 6px;
                    font-size: 14px;
                    font-weight: 500;
                }

                .error-icon {
                    width: 20px;
                    height: 20px;
                    flex-shrink: 0;
                }

                /* Responsive design */
                @media (max-width: 768px) {
                    .file-upload-container {
                        padding: 16px;
                        margin-bottom: 16px;
                    }

                    .file-input-label {
                        padding: 24px 16px;
                        min-height: 100px;
                    }

                    .upload-icon {
                        width: 28px;
                        height: 28px;
                    }

                    .file-input-text {
                        font-size: 14px;
                    }

                    .upload-button {
                        padding: 10px 20px;
                        font-size: 14px;
                    }
                }

                /* Drag and drop states */
                .file-input-label.drag-over {
                    border-color: #2bdcd2;
                    background: #f0fffe;
                    transform: scale(1.02);
                }
            `}</style>
        </div>
    );
}
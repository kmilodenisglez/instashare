'use client';

import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import FileUpload from "../components/FileUpload";
import FileList from "../components/FileList";

export default function Page() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refresh, setRefresh] = useState(false);

    // Check authentication on mount
    useEffect(() => {
        async function checkAuth() {
            try {
                const response = await api.getUser();
                const data = await response.json();
                if (data.authenticated) {
                    setUser(data.user);
                } else {
                    setUser(null);
                }
            } catch (error) {
                console.error('Auth check failed:', error);
                setUser(null);
            }
            setLoading(false);
        }
        checkAuth();
    }, []);

    const handleLogin = () => {
        api.login();
    };

    const handleLogout = async () => {
        try {
            await api.logout();
            setUser(null);
            window.location.reload();
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    // Toggle refresh to force FileList to reload
    const handleUploadSuccess = () => setRefresh(r => !r);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[50vh]">
                <div className="text-lg">Loading...</div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] gap-6">
                <div className="text-center">
                    <h1 className="text-3xl font-bold mb-4">Welcome to Instashare DFS</h1>
                    <p className="text-lg mb-6">Please log in to access your files</p>
                    <button
                        onClick={handleLogin}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                    >
                        Login with Google
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-12 sm:gap-16">
            <section className="flex flex-col gap-4">
                <div className="flex justify-between items-center">
                    <h2>Upload Files</h2>
                    <div className="flex items-center gap-4">
                        <span>Welcome, {user.name || user.email}</span>
                        <button
                            onClick={handleLogout}
                            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition-colors"
                        >
                            Logout
                        </button>
                    </div>
                </div>
                <FileUpload onUploadSuccess={handleUploadSuccess}/>
                <FileList key={refresh}/>
            </section>
        </div>
    );
}
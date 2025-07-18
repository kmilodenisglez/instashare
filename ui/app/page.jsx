'use client';

import {  useState } from 'react';
import FileUpload from "../components/FileUpload";
import FileList from "../components/FileList";
import Link from 'next/link';
import { useAuth } from '../components/AuthContext';

export default function Page() {
    const { user, loading, logout } = useAuth();
    const [refresh, setRefresh] = useState(false);

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
                    <Link href="/auth/login">
                        <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors">
                            Login
                        </button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-12 sm:gap-16">
            <section className="flex flex-col gap-4">
                <div className="flex justify-between items-center">
                    <h2>Upload Files</h2>
                    {/*<div className="flex items-center gap-4">*/}
                    {/*    <span>Welcome, {user.name || user.email}</span>*/}
                    {/*    <button*/}
                    {/*        onClick={logout}*/}
                    {/*        className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition-colors"*/}
                    {/*    >*/}
                    {/*        Logout*/}
                    {/*    </button>*/}
                    {/*</div>*/}
                </div>
                <FileUpload onUploadSuccess={handleUploadSuccess}/>
                <FileList key={refresh}/>
            </section>
        </div>
    );
}
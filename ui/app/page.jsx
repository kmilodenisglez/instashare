'use client';

import FileUpload from "../components/FileUpload";
import FileList from "../components/FileList";
import {useState} from "react";

export default function Page() {
    const [refresh, setRefresh] = useState(false);

    // Toggle refresh to force FileList to reload
    const handleUploadSuccess = () => setRefresh(r => !r);
    
    return (
        <div className="flex flex-col gap-12 sm:gap-16">
            <section className="flex flex-col gap-4">
                <h2>Upload Files</h2>
                <FileUpload onUploadSuccess={handleUploadSuccess}/>
                <FileList key={refresh}/>
            </section>
        </div>
    );
}
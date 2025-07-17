import '../styles/globals.css';
import { Footer } from '../components/footer';
import { Header } from '../components/header';

export const metadata = {
    title: {
        template: '%s | Instashare DFS',
        default: 'Instashare DFS - Distributed File System'
    },
    description: 'A modern distributed file system with IPFS storage, file compression, and seamless sharing capabilities.',
    keywords: ['file sharing', 'distributed storage', 'IPFS', 'file compression', 'cloud storage'],
    authors: [{ name: 'Instashare Team' }],
    creator: 'Instashare',
    publisher: 'Instashare',
    robots: {
        index: true,
        follow: true,
    },
    openGraph: {
        type: 'website',
        locale: 'en_US',
        url: process.env.NEXT_PUBLIC_SITE_URL || 'https://instashare-dfs.netlify.app',
        siteName: 'Instashare DFS',
        title: 'Instashare DFS - Distributed File System',
        description: 'A modern distributed file system with IPFS storage, file compression, and seamless sharing capabilities.',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Instashare DFS - Distributed File System',
        description: 'A modern distributed file system with IPFS storage, file compression, and seamless sharing capabilities.',
    },
    icons: {
        icon: '/favicon.svg',
        shortcut: '/favicon.svg',
        apple: '/favicon.svg',
    },
};

export const viewport = {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    themeColor: '#2bdcd2',
};

// Backend API configuration
export const API_CONFIG = {
    BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
    ENDPOINTS: {
        // Authentication
        AUTH_LOGIN: '/auth/login',
        AUTH_LOGOUT: '/auth/logout',
        AUTH_USER: '/auth/user',
        
        // File operations
        FILES_LIST: '/files/',
        FILES_UPLOAD: '/files/upload',
        FILES_DOWNLOAD: '/files/{file_id}/download',
        FILES_DOWNLOAD_ZIP: '/files/{file_id}/download-zip',
        FILES_RENAME: '/files/{file_id}/rename',
        FILES_INFO: '/files/{file_id}',
        
        // Health check
        HEALTH: '/health',
        
        // API documentation
        DOCS: '/docs',
        REDOC: '/redoc',
    },
    TIMEOUT: 30000, // 30 seconds
    RETRY_ATTEMPTS: 3,
};

// Helper function to build API URLs
export const buildApiUrl = (endpoint, params = {}) => {
    let url = `${API_CONFIG.BASE_URL}${endpoint}`;
    
    // Replace path parameters
    Object.entries(params).forEach(([key, value]) => {
        url = url.replace(`{${key}}`, encodeURIComponent(value));
    });
    
    return url;
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <head>
                <link rel="icon" href="/favicon.svg" sizes="any" />
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <meta name="theme-color" content="#2bdcd2" />
                <meta name="msapplication-TileColor" content="#2bdcd2" />
            </head>
            <body className="antialiased text-white bg-blue-900">
                <div className="flex flex-col min-h-screen px-6 bg-noise sm:px-12">
                    <div className="flex flex-col w-full max-w-5xl mx-auto grow">
                        <Header />
                        <main className="grow">{children}</main>
                        <Footer />
                    </div>
                </div>
            </body>
        </html>
    );
}

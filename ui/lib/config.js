// Backend API configuration
export const API_CONFIG = {
    BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'https://web-production-23301.up.railway.app',
    ENDPOINTS: {
        // Authentication
        AUTH_LOGIN: '/auth/login',
        AUTH_LOGIN_LOCAL: '/auth/login',
        AUTH_REGISTER: '/auth/register',
        AUTH_LOGOUT: '/auth/logout',
        AUTH_USER: '/auth/me',
        
        // File operations
        FILES_LIST: '/api/v1/files/',
        FILES_UPLOAD: '/api/v1/files/upload',
        FILES_DOWNLOAD: '/api/v1/files/{file_id}/download',
        FILES_DOWNLOAD_ZIP: '/api/v1/files/{file_id}/download_zip',
        FILES_RENAME: '/api/v1/files/{file_id}/rename',
        FILES_INFO: '/api/v1/files/{file_id}',
        
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
    
    // Ensure params is an object
    if (!params || typeof params !== 'object') {
        params = {};
    }
    
    // Replace parameters in the route
    Object.entries(params).forEach(([key, value]) => {
        url = url.replace(`{${key}}`, encodeURIComponent(value));
    });
    // Add the remaining parameters as query strings
    const queryParams = Object.entries(params)
        .filter(([key]) => !endpoint.includes(`{${key}}`))
        .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
        .join('&');
    if (queryParams) {
        url += (url.includes('?') ? '&' : '?') + queryParams;
    }
    return url;
};
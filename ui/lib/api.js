import { API_CONFIG, buildApiUrl } from './config';

// API client with error handling and retries
class ApiClient {
    constructor() {
        this.baseURL = API_CONFIG.BASE_URL;
        this.timeout = API_CONFIG.TIMEOUT;
        this.retryAttempts = API_CONFIG.RETRY_ATTEMPTS;
    }

    async request(endpoint, options = {}) {
        const url = buildApiUrl(endpoint, options.params);
        const config = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            credentials: 'include', // Include cookies for session
            ...options,
        };

        // Remove Content-Type for FormData
        if (options.body instanceof FormData) {
            delete config.headers['Content-Type'];
        }

        let lastError;
        
        for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), this.timeout);
                
                const response = await fetch(url, {
                    ...config,
                    signal: controller.signal,
                });
                
                clearTimeout(timeoutId);
                
                if (!response.ok) {
                    // Intenta extraer el JSON de error
                    let errorData = {};
                    try {
                        errorData = await response.json();
                    } catch {}
                    const error = new Error(`HTTP ${response.status}: ${response.statusText}`);
                    error.status = response.status;
                    error.data = errorData;
                    throw error;
                }
                
                return response;
            } catch (error) {
                lastError = error;
                
                // Don't retry on client errors (4xx)
                if (error.message.includes('HTTP 4')) {
                    throw error;
                }
                
                // Wait before retry (exponential backoff)
                if (attempt < this.retryAttempts) {
                    await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
                }
            }
        }
        
        throw lastError;
    }

    // Convenience methods
    async get(endpoint, params = {}) {
        return this.request(endpoint, { params });
    }

    async post(endpoint, data, options = {}) {
        return this.request(endpoint, {
            method: 'POST',
            body: data instanceof FormData ? data : JSON.stringify(data),
            ...options,
        });
    }

    async put(endpoint, data, options = {}) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data),
            ...options,
        });
    }

    async delete(endpoint, options = {}) {
        return this.request(endpoint, {
            method: 'DELETE',
            ...options,
        });
    }
}

export const apiClient = new ApiClient();

// Specific API functions
export const api = {
    // Authentication
    login: () => window.location.href = buildApiUrl(API_CONFIG.ENDPOINTS.AUTH_LOGIN),
    logout: () => apiClient.post(API_CONFIG.ENDPOINTS.AUTH_LOGOUT),
    getUser: () => apiClient.get(API_CONFIG.ENDPOINTS.AUTH_USER),
    
    // Local authentication (new endpoints)
    loginLocal: async (email, password) => {
        const formData = new FormData();
        formData.append('email', email);
        formData.append('password', password);
        return apiClient.post(API_CONFIG.ENDPOINTS.AUTH_LOGIN_LOCAL || '/auth/login', formData);
    },
    
    register: async (email, password, name = '') => {
        const formData = new FormData();
        formData.append('email', email);
        formData.append('password', password);
        if (name) formData.append('name', name);
        return apiClient.post(API_CONFIG.ENDPOINTS.AUTH_REGISTER || '/auth/register', formData);
    },
    
    // Files
    getFiles: () => apiClient.get(API_CONFIG.ENDPOINTS.FILES_LIST),
    uploadFile: (formData) => apiClient.post(API_CONFIG.ENDPOINTS.FILES_UPLOAD, formData),
    downloadFile: (fileId) => buildApiUrl(API_CONFIG.ENDPOINTS.FILES_DOWNLOAD, { file_id: fileId }),
    downloadZip: (fileId) => buildApiUrl(API_CONFIG.ENDPOINTS.FILES_DOWNLOAD_ZIP, { file_id: fileId }),
    renameFile: (fileId, newName) =>
        apiClient.request(
            API_CONFIG.ENDPOINTS.FILES_RENAME.replace('{file_id}', fileId),
            {
                method: 'PATCH',
                params: { new_name: newName }
            }
        ),
    getFileInfo: (fileId) => apiClient.get(API_CONFIG.ENDPOINTS.FILES_INFO, { file_id: fileId }),
    
    // Health
    healthCheck: () => apiClient.get(API_CONFIG.ENDPOINTS.HEALTH),
};
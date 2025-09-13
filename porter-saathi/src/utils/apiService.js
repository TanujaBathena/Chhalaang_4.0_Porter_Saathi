// API Service for Porter Saathi Backend Integration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api/v1';

class ApiService {
    constructor() {
        this.token = localStorage.getItem('authToken');
    }

    // Set authentication token
    setToken(token) {
        this.token = token;
        if (token) {
            localStorage.setItem('authToken', token);
        } else {
            localStorage.removeItem('authToken');
        }
    }

    // Get authentication token
    getToken() {
        return this.token || localStorage.getItem('authToken');
    }

    // Clear authentication
    clearAuth() {
        this.token = null;
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
    }

    // Generic request method
    async request(endpoint, options = {}) {
        const url = `${API_BASE_URL}${endpoint}`;
        const token = this.getToken();

        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            ...options,
        };

        // Add authorization header if token exists
        if (token && !options.skipAuth) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        console.log('🌐 API Request:', {
            url,
            method: config.method || 'GET',
            headers: config.headers,
            body: config.body
        });

        try {
            const response = await fetch(url, config);
            
            // Handle non-JSON responses
            const contentType = response.headers.get('content-type');
            let data;
            
            if (contentType && contentType.includes('application/json')) {
                data = await response.json();
            } else {
                data = { message: await response.text() };
            }

            console.log('📡 API Response:', {
                status: response.status,
                statusText: response.statusText,
                data: data
            });

            if (!response.ok) {
                // Handle authentication errors
                if (response.status === 401) {
                    this.clearAuth();
                    throw new Error('Authentication failed. Please login again.');
                }
                throw new Error(data.error || data.message || `HTTP error! status: ${response.status}`);
            }

            return data;
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }

    // Authentication methods
    async sendOTP(mobile) {
        console.log('🔍 ApiService.sendOTP called with mobile:', mobile);
        console.log('🔍 Mobile type:', typeof mobile);
        console.log('🔍 Mobile length:', mobile?.length);
        
        const requestBody = { mobile };
        console.log('🔍 Request body:', requestBody);
        console.log('🔍 Stringified body:', JSON.stringify(requestBody));
        
        return this.request('/auth/send-otp', {
            method: 'POST',
            body: JSON.stringify(requestBody),
            skipAuth: true,
        });
    }

    async login(mobile, otp) {
        const response = await this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ mobile, otp }),
            skipAuth: true,
        });
        
        if (response.token) {
            this.setToken(response.token);
            localStorage.setItem('userData', JSON.stringify(response.user));
        }
        
        return response;
    }

    async signup(userData) {
        const response = await this.request('/auth/signup', {
            method: 'POST',
            body: JSON.stringify(userData),
            skipAuth: true,
        });
        
        if (response.token) {
            this.setToken(response.token);
            localStorage.setItem('userData', JSON.stringify(response.user));
        }
        
        return response;
    }

    // User methods
    async getUserProfile() {
        return this.request('/user/profile');
    }

    async updateUserProfile(userData) {
        return this.request('/user/profile', {
            method: 'PUT',
            body: JSON.stringify(userData),
        });
    }

    async uploadDocument(formData) {
        return this.request('/user/upload-document', {
            method: 'POST',
            headers: {}, // Let browser set Content-Type for FormData
            body: formData,
        });
    }

    // Earnings methods
    async getEarnings() {
        return this.request('/earnings/');
    }

    async getWeeklyEarnings() {
        return this.request('/earnings/weekly');
    }

    async addEarnings(earningsData) {
        return this.request('/earnings/', {
            method: 'POST',
            body: JSON.stringify(earningsData),
        });
    }

    // Tutorial methods
    async getTutorials() {
        return this.request('/tutorials', { skipAuth: true });
    }

    async getTutorialById(id) {
        return this.request(`/tutorials/${id}`, { skipAuth: true });
    }

    async getTutorialsByCategory(category) {
        return this.request(`/tutorials/category/${category}`, { skipAuth: true });
    }

    // Chat methods
    async sendChatMessage(message, sessionId, sessionType = 'general', language = 'en') {
        const url = sessionId ? `/chat/message?sessionId=${sessionId}` : '/chat/message';
        return this.request(url, {
            method: 'POST',
            body: JSON.stringify({ 
                message, 
                sessionType,
                language 
            }),
        });
    }

    async getChatHistory(sessionId) {
        return this.request(`/chat/history/${sessionId}`);
    }

    // Health check
    async healthCheck() {
        return this.request('/health', { skipAuth: true });
    }

    // Get stored user data
    getUserData() {
        const userData = localStorage.getItem('userData');
        return userData ? JSON.parse(userData) : null;
    }

    // Check if user is authenticated
    isAuthenticated() {
        return !!this.getToken();
    }
}

// Create and export a singleton instance
const apiService = new ApiService();
export default apiService; 
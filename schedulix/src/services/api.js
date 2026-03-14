// src/services/api.js
const API_BASE_URL = 'http://localhost:8080/api';
let currentToken = localStorage.getItem('token') || null;

// This function is exported so AuthContext can update the token on login/logout
export const setToken = (newToken) => {
    currentToken = newToken;
};

const request = async (endpoint, options = {}) => {
    const defaultHeaders = { 'Content-Type': 'application/json', ...options.headers };
    if (currentToken && !options.noAuth) {
        defaultHeaders['Authorization'] = `Bearer ${currentToken}`;
    }

    let body = options.body;
    if (body && !(body instanceof FormData)) {
        body = JSON.stringify(body);
    } else if (body instanceof FormData) {
        delete defaultHeaders['Content-Type'];
    }

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, { ...options, headers: defaultHeaders, body });

        if (response.status === 401 && currentToken) {
             console.error('API Unauthorized (401)');
             setToken(null);
             localStorage.removeItem('token');
             window.location.href = '/auth'; // Redirect to login
             throw new Error('Unauthorized');
        }
        if (response.status === 403) {
             console.error('API Forbidden (403)');
             const currentContentType = response.headers.get("content-type");
             if (!currentContentType || !currentContentType.includes("application/json")) {
                 throw new Error('Forbidden: You do not have permission.');
             }
             // If it is JSON, let the standard handler below parse and throw the proper error message
        }

        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
            const data = await response.json();
            if (!response.ok) {
                 throw new Error(data.message || `API Error: ${response.status}`);
            }
            return data;
        } else {
             const textData = await response.text();
             if (!response.ok) {
                  throw new Error(textData || `API Error: ${response.status}`);
             }
             return textData;
        }
    } catch (error) {
        console.error(`API call failed: ${options.method || 'GET'} ${endpoint}`, error);
        if (error.message.includes('Failed to fetch')) {
             throw new Error('Network Error: Could not connect to the backend. Is it running?');
        }
        throw error;
    }
};

// Define specific API functions
const apiService = {
    setToken,
    login: (username, password) => request('/auth/login', { method: 'POST', body: { username, password }, noAuth: true }),
    register: (username, password, role) => request('/auth/register', { method: 'POST', body: { username, password, role }, noAuth: true }),
    firstLoginReset: (username, currentPassword, newPassword) => request('/auth/first-login-reset', { method: 'POST', body: { username, currentPassword, newPassword }, noAuth: true }),
    
    // User Endpoints
    getCurrentUser: () => request('/users/me'),
    getFacultyList: () => request('/users/faculty'),
    updateProfileInfo: (profileData) => request('/users/me/profile', { method: 'PATCH', body: profileData }),
    // Image Endpoints
    uploadProfilePicture: (formData) => request('/users/me/profile-picture', { method: 'POST', body: formData }),

    // Admin Endpoints
    adminCreateUser: (userData) => request('/admin/create-user', { method: 'POST', body: userData }),

    removeProfilePicture: () => request('/users/me/profile-picture', {
        method: 'DELETE'
    }),
    
    // Announcement Endpoints
    getAnnouncements: () => request('/announcements/all'),
    createAnnouncement: (title, message) => request('/announcements/create', { 
        method: 'POST', 
        body: { title, message } 
    }),
    
    // --- THESE ARE THE NEW FUNCTIONS ---
    updateAnnouncement: (id, title, message) => request(`/announcements/${id}`, {
        method: 'PUT',
        body: { title, message }
    }),
    deleteAnnouncement: (id) => request(`/announcements/${id}`, {
        method: 'DELETE'
    }),
    // --- END OF NEW FUNCTIONS ---
    
    // Meeting Request Endpoints
    getMyStudentRequests: () => request('/meetings/my-requests'),
    sendMeetingRequest: (facultyName, topic, meetingDate, meetingTime) => request('/meetings/request', {
        method: 'POST',
        body: { facultyName, topic, meetingDate, meetingTime }
    }),
    deleteMeetingRequest: (requestId) => request(`/meetings/${requestId}`, {
        method: 'DELETE'
    }),
    getFacultyRequests: (type = 'pending') => request(`/faculty/meetings/${type}`),
    updateMeetingRequest: (requestId, action) => request(`/faculty/meetings/${requestId}?action=${action}`, { method: 'PATCH' }),
    
    // Timetable Endpoints
    uploadTimetable: (formData) => request('/timetable/upload', { method: 'POST', body: formData }),
    checkAvailability: (facultyId, day, time) => {
        const params = new URLSearchParams({ facultyId, day, time });
        return request(`/timetable/availability?${params.toString()}`);
    },


getNotifications: () => request('/notifications'),
    
    markNotificationAsRead: (id) => request(`/notifications/${id}/read`, {
        method: 'POST'
    })
};

export default apiService;
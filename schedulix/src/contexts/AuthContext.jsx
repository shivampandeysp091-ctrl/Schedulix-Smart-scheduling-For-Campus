// src/contexts/AuthContext.jsx - UPDATED with Notifications
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';
import apiService, { setToken as setApiToken } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(() => localStorage.getItem('token'));
    const [user, setUser] = useState(null); 
    const [loading, setLoading] = useState(true); 

    // --- 1. ADD NOTIFICATION STATE ---
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    // --- 2. ADD NOTIFICATION FETCHER ---
    const fetchNotifications = useCallback(async () => {
        // We use localStorage.getItem('token') instead of the 'token' state
        // to ensure polling works even during complex state updates.
        const currentToken = localStorage.getItem('token');
        if (!currentToken) return; // Don't fetch if logged out

        try {
            const data = await apiService.getNotifications();
            if (Array.isArray(data)) {
                setNotifications(data); // List of unread notifications
                setUnreadCount(data.length); // Count of unread
            }
        } catch (error) {
            // Don't show an error for polling, just log it
            console.error("Polling for notifications failed:", error);
        }
    }, []); // Empty dependency array

    // This function processes the token AND fetches the user profile
    const processToken = useCallback(async (currentToken) => {
        if (!currentToken) {
            setUser(null);
            setApiToken(null);
            setLoading(false);
            setNotifications([]); // Clear notifications on logout
            setUnreadCount(0);
            return;
        }
        try {
            const decoded = jwtDecode(currentToken);
            const currentTime = Date.now() / 1000;

            if (decoded.exp > currentTime) {
                // Token is valid
                setApiToken(currentToken);
                
                // Fetch the full user profile
                try {
                    const fullUserData = await apiService.getCurrentUser();
                    setUser(fullUserData); // Store the full user object
                    
                    // --- 3. FETCH NOTIFICATIONS AFTER USER IS LOADED ---
                    await fetchNotifications(); 

                } catch (apiError) {
                    console.error("Failed to fetch user data:", apiError);
                    // If /me fails, log out
                    localStorage.removeItem('token');
                    setToken(null);
                    setUser(null);
                    setApiToken(null);
                    setNotifications([]);
                    setUnreadCount(0);
                }
            } else {
                // Token expired
                console.warn("Token expired.");
                localStorage.removeItem('token');
                setToken(null);
                setUser(null);
                setApiToken(null);
                setNotifications([]);
                setUnreadCount(0);
            }
        } catch (error) {
            console.error("Failed to decode token:", error);
            localStorage.removeItem('token');
            setToken(null);
            setUser(null);
            setApiToken(null);
            setNotifications([]);
            setUnreadCount(0);
        } finally {
             setLoading(false);
        }
    }, [fetchNotifications]); // Add fetchNotifications as dependency

    // --- 4. ADD POLLING EFFECT (Runs only once) ---
    useEffect(() => {
        // This interval will run every 30 seconds
        const intervalId = setInterval(() => {
            console.log("Polling for notifications...");
            fetchNotifications();
        }, 30000); // 30 seconds

        // Clear the interval when the app unmounts
        return () => clearInterval(intervalId);
    }, [fetchNotifications]); // Run this effect when fetchNotifications function is created

    // This effect still runs when the token itself changes (login/logout)
    useEffect(() => {
        setLoading(true);
        processToken(token);
    }, [token, processToken]);

    const login = async (username, password) => {
        try {
            const response = await apiService.login(username, password);
            const newToken = response.token;
            localStorage.setItem('token', newToken);
            setToken(newToken); // This triggers the useEffect to process the token
            return response;
        } catch (error) {
             // Let the specific requirePasswordReset error bubble up cleanly
             if (error.message && error.message.includes('Password reset required')) {
                 throw { requirePasswordReset: true, username };
             }
             console.error("Login failed in context:", error);
             throw error;
        }
    };

     const register = async (username, password, role) => {
         try {
             const response = await apiService.register(username, password, role);
             return response;
         } catch (error) {
             console.error("Registration failed in context:", error);
             throw error;
         }
     };

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null); // This triggers useEffect to clear user and notifications
        apiService.setToken(null);
        console.log("User logged out.");
    };

    // --- 5. ADD markAsRead HELPER FUNCTION ---
    const markAsRead = (notificationId) => {
        // Instantly remove from UI for speed
        setNotifications(prev => prev.filter(n => n.id !== notificationId));
        setUnreadCount(prev => (prev > 0 ? prev - 1 : 0));
        
        // Tell the backend to mark as read
        apiService.markNotificationAsRead(notificationId).catch(err => {
            console.error("Failed to mark as read:", err);
            // If it fails, refetch to get the correct state
            fetchNotifications(); 
        });
    };

    // --- 6. EXPORT NEW VALUES ---
    const value = { 
        token, 
        user, 
        setUser, 
        loading, 
        login, 
        logout, 
        register,
        notifications,    // <-- ADD THIS
        unreadCount,      // <-- ADD THIS
        markAsRead        // <-- ADD THIS
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

// Hook to easily consume the context
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
import React, { createContext, useContext, useState, useEffect } from 'react';
import apiService from '../utils/apiService';

const UserContext = createContext();

export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
};

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    // Initialize user state from stored data
    useEffect(() => {
        const initializeUser = () => {
            if (apiService.isAuthenticated()) {
                const userData = apiService.getUserData();
                if (userData) {
                    setUser(userData);
                    setIsAuthenticated(true);
                }
            }
            setLoading(false);
        };

        initializeUser();
    }, []);

    const login = (userData) => {
        setUser(userData);
        setIsAuthenticated(true);
    };

    const logout = () => {
        apiService.clearAuth();
        setUser(null);
        setIsAuthenticated(false);
    };

    const updateUser = (userData) => {
        setUser(userData);
        localStorage.setItem('userData', JSON.stringify(userData));
    };

    const value = {
        user,
        isAuthenticated,
        loading,
        login,
        logout,
        updateUser
    };

    return (
        <UserContext.Provider value={value}>
            {children}
        </UserContext.Provider>
    );
}; 
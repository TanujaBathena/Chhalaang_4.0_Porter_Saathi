import { useState, useEffect } from 'react';
import apiService from '../utils/apiService';
import { MOCK_DATA } from '../data/mockData';

export const useEarnings = () => {
    const [earnings, setEarnings] = useState(MOCK_DATA.earnings);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Fetch earnings from backend with fallback to mock data
    const fetchEarnings = async () => {
        setLoading(true);
        setError(null);
        
        console.log('💰 Starting earnings fetch...');
        console.log('💰 Is authenticated:', apiService.isAuthenticated());
        
        try {
            console.log('🌐 Making API call to getEarnings...');
            const backendEarnings = await apiService.getEarnings();
            console.log('✅ Earnings data loaded:', backendEarnings);
            
            // Validate the response structure
            if (!backendEarnings || typeof backendEarnings !== 'object') {
                throw new Error('Invalid earnings data received from server');
            }
            
            setEarnings(backendEarnings);
            console.log('✅ Earnings state updated successfully');
        } catch (err) {
            console.warn('❌ Failed to fetch earnings from backend, using mock data:', err);
            console.error('❌ Earnings error details:', {
                message: err.message,
                stack: err.stack,
                name: err.name
            });
            
            setError(err.message);
            // Keep using mock data as fallback
            console.log('📦 Using mock earnings data as fallback');
            setEarnings(MOCK_DATA.earnings);
        } finally {
            setLoading(false);
            console.log('🏁 Earnings fetch completed');
        }
    };

    // Add new earnings entry
    const addEarnings = async (earningsData) => {
        setLoading(true);
        setError(null);
        
        try {
            const newEarning = await apiService.addEarnings(earningsData);
            // Refresh earnings after adding
            await fetchEarnings();
            return newEarning;
        } catch (err) {
            console.error('Failed to add earnings:', err);
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Initialize earnings on mount if user is authenticated
    useEffect(() => {
        if (apiService.isAuthenticated()) {
            fetchEarnings();
        }
    }, []);

    return {
        earnings,
        loading,
        error,
        fetchEarnings,
        addEarnings
    };
}; 
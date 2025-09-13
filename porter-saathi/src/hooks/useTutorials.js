import { useState, useEffect } from 'react';
import apiService from '../utils/apiService';
import { MOCK_DATA } from '../data/mockData';

export const useTutorials = () => {
    const [tutorials, setTutorials] = useState(MOCK_DATA.tutorials);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Fetch tutorials from backend with fallback to mock data
    const fetchTutorials = async () => {
        setLoading(true);
        setError(null);
        
        try {
            const backendTutorials = await apiService.getTutorials();
            
            // Transform backend data to match frontend structure if needed
            const transformedTutorials = backendTutorials.map(tutorial => ({
                id: tutorial.id,
                category: tutorial.category,
                title: tutorial.title,
                steps: tutorial.steps,
                // Add videos from mock data since backend doesn't have video data yet
                videos: MOCK_DATA.tutorials.find(t => t.category === tutorial.category)?.videos || []
            }));
            
            setTutorials(transformedTutorials);
        } catch (err) {
            console.warn('Failed to fetch tutorials from backend, using mock data:', err);
            setError(err.message);
            // Keep using mock data as fallback
            setTutorials(MOCK_DATA.tutorials);
        } finally {
            setLoading(false);
        }
    };

    // Get tutorial by ID
    const getTutorialById = async (id) => {
        try {
            const tutorial = await apiService.getTutorialById(id);
            return tutorial;
        } catch (err) {
            console.warn('Failed to fetch tutorial by ID from backend, using mock data:', err);
            return MOCK_DATA.tutorials.find(t => t.id === parseInt(id));
        }
    };

    // Get tutorials by category
    const getTutorialsByCategory = async (category) => {
        try {
            const categoryTutorials = await apiService.getTutorialsByCategory(category);
            return categoryTutorials;
        } catch (err) {
            console.warn('Failed to fetch tutorials by category from backend, using mock data:', err);
            return MOCK_DATA.tutorials.filter(t => t.category === category);
        }
    };

    // Initialize tutorials on mount
    useEffect(() => {
        fetchTutorials();
    }, []);

    return {
        tutorials,
        loading,
        error,
        fetchTutorials,
        getTutorialById,
        getTutorialsByCategory
    };
}; 
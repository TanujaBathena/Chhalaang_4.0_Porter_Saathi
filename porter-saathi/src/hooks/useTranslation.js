import { useCallback } from 'react';
import { translations } from '../data/translations';

// Custom hook for translation functionality
export const useTranslation = (language) => {
    const t = useCallback((key) => {
        if (!language) return '';
        const langKey = language.split('-')[0];
        return translations[key]?.[langKey] || translations[key]?.['en'];
    }, [language]);

    return { t };
}; 
import React from 'react';
import { translations } from '../data/translations';

const LanguageSelection = ({ onSelectLanguage }) => {
    const languages = [
        { code: 'hi-IN', name: 'हिंदी (Hindi)' },
        { code: 'en-IN', name: 'English' },
        { code: 'te-IN', name: 'తెలుగు (Telugu)' },
        { code: 'ta-IN', name: 'தமிழ் (Tamil)' },
    ];

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
            <h1 className="text-2xl font-bold text-blue-600 mb-2">Porter Saathi</h1>
            <h2 className="text-xl font-semibold mb-8 text-gray-700">{translations.chooseLanguage.hi}</h2>
            <div className="grid grid-cols-1 gap-4 w-full max-w-xs">
                {languages.map(lang => (
                    <button 
                        key={lang.code} 
                        onClick={() => onSelectLanguage(lang.code)} 
                        className="bg-white text-blue-600 font-bold py-4 px-6 rounded-lg shadow-md border-2 border-blue-500 hover:bg-blue-50 transition-transform transform hover:scale-105"
                    >
                        {lang.name}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default LanguageSelection; 
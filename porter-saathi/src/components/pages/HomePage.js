import React from 'react';
import { translations } from '../../data/translations';
import WeeklyProgress from '../WeeklyProgress';
import { useEarnings } from '../../hooks/useEarnings';

const HomePage = ({ aiResponse, isLoading, t, language, onListen, isListening }) => {
    const { earnings, loading: earningsLoading } = useEarnings();
    const { revenue = 0, expenses = 0, trips = 0 } = earnings?.today || {};
    const langKey = language?.split('-')[0] || 'en';
    
    // Debug logging
    console.log('🏠 HomePage props:', { 
        hasOnListen: !!onListen, 
        isListening, 
        isLoading,
        aiResponse: aiResponse ? 'present' : 'empty'
    });

    return (
        <div className="p-4 space-y-6">
            {/* Weekly Progress Component */}
            <WeeklyProgress t={t} language={language} />
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                <h2 className="text-lg font-semibold text-blue-800">{t('todaysEarnings')}</h2>
                {earningsLoading ? (
                    <div className="py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-2 text-gray-600">{t('loading')}</p>
                    </div>
                ) : (
                    <>
                        <p className="text-4xl font-bold text-green-600 mt-2">₹{revenue - expenses}</p>
                        <div className="flex justify-around mt-4 text-sm">
                            <div>
                                <p className="text-gray-500">{t('totalRevenue')}</p>
                                <p className="font-bold text-gray-800">₹{revenue}</p>
                            </div>
                            <div>
                                <p className="text-gray-500">{t('expenses')}</p>
                                <p className="font-bold text-gray-800">- ₹{expenses}</p>
                            </div>
                            <div>
                                <p className="text-gray-500">{t('trips')}</p>
                                <p className="font-bold text-gray-800">{trips}</p>
                            </div>
                        </div>
                    </>
                )}
            </div>
            
            <div className="bg-gray-100 border border-gray-300 rounded-lg p-4 min-h-[6rem] flex items-center justify-center">
                {isLoading ? (
                    <div className="text-center text-gray-500">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-2">{t('thinking')}</p>
                    </div>
                ) : (
                    <p className="text-center text-gray-700 font-medium">
                        {aiResponse || t('askAnything')}
                    </p>
                )}
            </div>
            
            {/* Central Voice Button */}
            <div className="flex flex-col items-center justify-center py-8">
                {!onListen && (
                    <div className="mb-2 text-xs text-red-500 bg-red-50 p-2 rounded">
                        Debug: onListen function not provided
                    </div>
                )}
                <button
                    onClick={onListen || (() => console.log('🎤 Voice button clicked but no onListen function'))}
                    className={`w-20 h-20 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 transform hover:scale-105 ${
                        isListening 
                            ? 'bg-red-500 animate-pulse shadow-red-200' 
                            : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200'
                    }`}
                    disabled={isLoading || !onListen}
                >
                    <svg 
                        className="w-10 h-10 text-white" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24" 
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth="2" 
                            d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 016 0v6a3 3 0 01-3 3z"
                        />
                    </svg>
                </button>
                
                <div className="text-center text-gray-500 mt-4">
                    <p className="font-medium">
                        {isListening ? t('listening') || 'सुन रहा हूं...' : t('clickMicAndSpeak') || 'माइक दबाएं और बोलें'}
                    </p>
                    <p className="text-sm mt-1">
                        {translations.exampleQuestion[langKey] || translations.exampleQuestion['en']}
                    </p>
                </div>
            </div>
            
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <h3 className="font-bold text-orange-800">{t('penaltyReward')}</h3>
                <div className="mt-2 text-sm text-gray-700 flex items-start">
                    <span className="text-lg mr-2">⚠️</span>
                    <p>{t('penaltyText')}</p>
                </div>
            </div>
        </div>
    );
};

export default HomePage; 

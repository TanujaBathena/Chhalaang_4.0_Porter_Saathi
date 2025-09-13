import React, { useState } from 'react';
import { MOCK_DATA } from '../../data/mockData';
import VideoList from '../VideoList';

const GuruPage = ({ onSelectTutorial, onStartChat, t, language }) => {
    const [showVideo, setShowVideo] = useState(null);
    const langKey = language.split('-')[0];
    
    return (
        <div className="p-4">
            <h2 className="text-xl font-bold mb-6">{t('guruTitle')}</h2>

            <div onClick={onStartChat} className="bg-blue-500 text-white p-4 rounded-lg shadow-lg mb-8 text-center cursor-pointer hover:bg-blue-600 transition-colors flex items-center justify-center">
                <svg className="w-8 h-8 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
                <h3 className="font-bold text-lg">{t('talkToGuru')}</h3>
            </div>

            <div className="space-y-4">
                {MOCK_DATA.tutorials.map(tutorial => (
                    <div key={tutorial.id} className="bg-white p-4 rounded-lg shadow-md border border-gray-200 cursor-pointer hover:shadow-lg transition-shadow">
                        <div className="flex items-center space-x-4">
                            {/* Icon */}
                            <div className="flex-shrink-0">
                                <p className="text-4xl">{tutorial.id === 1 ? '📜' : tutorial.id === 2 ? '🚗' : tutorial.id === 3 ? '🔒' : '😊'}</p>
                            </div>
                            
                            {/* Content */}
                            <div className="flex-grow" onClick={() => onSelectTutorial(tutorial)}>
                                <h3 className="font-semibold text-lg text-gray-800 mb-1">{tutorial.title[langKey] || tutorial.title['en']}</h3>
                                <p className="text-sm text-gray-600">{t('clickToViewSteps')}</p>
                            </div>
                            
                                                    {/* Video button */}
                        <div className="flex-shrink-0">
                            <button 
                                onClick={() => setShowVideo(tutorial)}
                                className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-600 transition-colors flex items-center"
                            >
                                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                                </svg>
                                {t('watchVideo')} ({tutorial.videos?.length || 0})
                            </button>
                        </div>
                        </div>
                    </div>
                ))}
            </div>
            
            {/* Video List Modal */}
            {showVideo && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <VideoList
                        videos={showVideo.videos}
                        tutorialTitle={showVideo.title[langKey] || showVideo.title.en}
                        onClose={() => setShowVideo(null)}
                        t={t}
                        language={language}
                    />
                </div>
            )}
        </div>
    );
};

export default GuruPage; 
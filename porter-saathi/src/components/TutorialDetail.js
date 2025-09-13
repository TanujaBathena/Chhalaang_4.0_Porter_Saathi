import React, { useEffect, useState } from 'react';
import { useVoiceInstructions } from '../hooks/useVoiceInstructions';

const TutorialDetail = ({ tutorial, onBack, speak, t, language }) => {
    const [selectedVideo, setSelectedVideo] = useState(null);
    const langKey = language.split('-')[0];
    const title = tutorial.title[langKey] || tutorial.title['en'];
    const steps = tutorial.steps[langKey] || tutorial.steps['en'];

    // Use voice instruction management hook
    const { speakOnce } = useVoiceInstructions(speak);

    useEffect(() => {
        speakOnce(`${title}. ${steps[0]}`);
    }, [tutorial, speakOnce, title, steps]);

    const handleStepClick = (stepIndex) => {
        // Play the corresponding video for this step
        const video = tutorial.videos?.[stepIndex];
        if (video) {
            setSelectedVideo(video);
        } else {
            // Fallback to speaking the step if no video available
            speak(steps[stepIndex]);
        }
    };

    return (
        <div className="p-4 animate-fade-in">
            <button onClick={onBack} className="flex items-center text-blue-600 font-semibold mb-4">
                <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                {t('goBack')}
            </button>
            <h2 className="text-2xl font-bold mb-4">{title}</h2>
            <ul className="space-y-3">
                {steps.map((step, index) => (
                    <li key={index} onClick={() => handleStepClick(index)} className="flex items-center bg-blue-50 p-4 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors">
                        <div className="flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full font-bold mr-4">{index + 1}</div>
                        <span className="flex-1 text-gray-800">{step}</span>
                        {tutorial.videos?.[index] && (
                            <div className="flex items-center text-red-500 ml-2">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                                </svg>
                            </div>
                        )}
                    </li>
                ))}
            </ul>
            
            {/* Inline Video Player */}
            {selectedVideo && (
                <div className="mt-6 bg-white rounded-lg shadow-lg overflow-hidden">
                    {/* Video Header */}
                    <div className="bg-blue-600 text-white p-3 flex justify-between items-center">
                        <h3 className="font-semibold text-sm">{selectedVideo.title[langKey] || selectedVideo.title.en}</h3>
                        <div className="flex items-center space-x-2">
                            <span className="text-xs bg-blue-500 px-2 py-1 rounded">{selectedVideo.videoDuration}</span>
                            <button 
                                onClick={() => setSelectedVideo(null)}
                                className="text-white hover:text-gray-200 transition-colors"
                                aria-label={t('close')}
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Video Container */}
                    <div className="relative bg-gray-900" style={{ aspectRatio: '16/9' }}>
                        <iframe
                            src={selectedVideo.videoUrl}
                            title={selectedVideo.title[langKey] || selectedVideo.title.en}
                            className="w-full h-full"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        />
                    </div>

                    {/* Video Info */}
                    <div className="p-3 bg-gray-50">
                        <div className="flex items-center justify-between text-sm text-gray-600">
                            <span>{t('instructionalVideo')}</span>
                            <button 
                                onClick={() => window.open(selectedVideo.videoUrl, '_blank')}
                                className="text-blue-600 hover:text-blue-800 transition-colors flex items-center"
                            >
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                                </svg>
                                {t('fullScreen')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TutorialDetail; 

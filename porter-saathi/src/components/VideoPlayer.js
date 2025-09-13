import React, { useState } from 'react';

const VideoPlayer = ({ videoUrl, title, duration, onClose, t }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);

    const handleIframeLoad = () => {
        setIsLoading(false);
    };

    const handleIframeError = () => {
        setIsLoading(false);
        setHasError(true);
    };

    return (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden max-w-md mx-auto">
            {/* Video Header */}
            <div className="bg-blue-600 text-white p-3 flex justify-between items-center">
                <h3 className="font-semibold text-sm truncate flex-1">{title}</h3>
                <div className="flex items-center space-x-2">
                    <span className="text-xs bg-blue-500 px-2 py-1 rounded">{duration}</span>
                    <button 
                        onClick={onClose}
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
                {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                            <p className="text-sm text-gray-600">{t('loadingVideo')}</p>
                        </div>
                    </div>
                )}

                {hasError ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                        <div className="text-center p-4">
                            <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                            <p className="text-sm text-gray-600">{t('videoError')}</p>
                            <button 
                                onClick={() => window.open(videoUrl, '_blank')}
                                className="mt-2 text-blue-600 text-sm underline"
                            >
                                {t('openInNewTab')}
                            </button>
                        </div>
                    </div>
                ) : (
                    <iframe
                        src={videoUrl}
                        title={title}
                        className="w-full h-full"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        onLoad={handleIframeLoad}
                        onError={handleIframeError}
                    />
                )}
            </div>

            {/* Video Controls/Info */}
            <div className="p-3 bg-gray-50">
                <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>{t('instructionalVideo')}</span>
                    <button 
                        onClick={() => window.open(videoUrl, '_blank')}
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
    );
};

export default VideoPlayer; 
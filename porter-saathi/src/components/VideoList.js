import React, { useState } from 'react';
import VideoPlayer from './VideoPlayer';

const VideoList = ({ videos, tutorialTitle, onClose, t, language }) => {
    const [selectedVideo, setSelectedVideo] = useState(null);
    const langKey = language ? language.split('-')[0] : 'en';

    if (selectedVideo) {
        return (
            <VideoPlayer
                videoUrl={selectedVideo.videoUrl}
                title={selectedVideo.title[langKey] || selectedVideo.title.en}
                duration={selectedVideo.videoDuration}
                onClose={() => setSelectedVideo(null)}
                t={t}
            />
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden max-w-md mx-auto">
            {/* Header */}
            <div className="bg-blue-600 text-white p-4 flex justify-between items-center">
                <h3 className="font-semibold text-lg">{tutorialTitle}</h3>
                <button 
                    onClick={onClose}
                    className="text-white hover:text-gray-200 transition-colors"
                    aria-label={t('close')}
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>
            </div>

            {/* Video List */}
            <div className="p-4">
                <p className="text-sm text-gray-600 mb-4">{t('selectVideoToWatch')}:</p>
                <div className="space-y-3">
                    {videos.map((video, index) => (
                        <div 
                            key={video.id}
                            onClick={() => setSelectedVideo(video)}
                            className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                        >
                            {/* Video Number */}
                            <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold text-sm">
                                {index + 1}
                            </div>
                            
                            {/* Video Thumbnail */}
                            <div className="flex-shrink-0 w-16 h-12 bg-gray-200 rounded flex items-center justify-center">
                                <svg className="w-6 h-6 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                                </svg>
                            </div>
                            
                            {/* Video Info */}
                            <div className="flex-1">
                                <h4 className="font-semibold text-sm text-gray-800 mb-1">
                                    {video.title[langKey] || video.title.en}
                                </h4>
                                <p className="text-xs text-gray-500">{video.videoDuration}</p>
                            </div>
                            
                            {/* Play Icon */}
                            <div className="flex-shrink-0 text-blue-600">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h8m-9-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                </svg>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            
            {/* Footer */}
            <div className="p-4 bg-gray-50 border-t">
                <p className="text-xs text-gray-500 text-center">
                    {videos.length} {t('videosAvailable')}
                </p>
            </div>
        </div>
    );
};

export default VideoList; 
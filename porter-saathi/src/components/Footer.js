import React from 'react';

const Footer = ({ currentPage, setPage, onListen, isListening, t }) => {
    const navItems = [
        { name: 'home', label: t('home'), icon: '🏠' },
        { name: 'guru', label: t('guru'), icon: '🎓' },
        { name: 'empowerment', label: t('empowerment'), icon: '💪' },
        { name: 'suraksha', label: t('suraksha'), icon: '🛡️' },
    ];

    return (
        <footer className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto bg-white border-t-2 border-gray-200 z-40">
            <div className="flex justify-around items-center h-20 relative overflow-visible">
                {currentPage !== 'guru-chat' && navItems.map((item, index) => (
                    <div key={item.name} className="flex flex-col items-center">
                        <button 
                            onClick={() => setPage(item.name)} 
                            className={`flex flex-col items-center justify-center transition-colors duration-200 ${
                                currentPage === item.name ? 'text-blue-600' : 'text-gray-500'
                            }`}
                        >
                            <span className="text-2xl">{item.icon}</span>
                            <span className="text-xs font-semibold">{item.label}</span>
                        </button>
                        
                        {/* Voice prompt button positioned above the middle tab (guru) */}
                        {index === 1 && (
                            <button 
                                onClick={onListen} 
                                className={`absolute -top-14 left-1/2 transform -translate-x-1/2 w-16 h-16 rounded-full flex items-center justify-center cursor-pointer shadow-xl transition-all duration-300 z-50 hover:scale-105 ${
                                    isListening 
                                        ? 'bg-red-500 animate-pulse shadow-red-300' 
                                        : 'bg-blue-600 hover:bg-blue-700 shadow-blue-300'
                                }`}
                                style={{ zIndex: 1000 }}
                            >
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path>
                                </svg>
                            </button>
                        )}
                    </div>
                ))}
                {currentPage === 'guru-chat' && <div className="w-full h-full"></div>}
            </div>
        </footer>
    );
};

export default Footer; 
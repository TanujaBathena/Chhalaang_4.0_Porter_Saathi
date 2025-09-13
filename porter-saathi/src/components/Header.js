import React from 'react';

const Header = ({ t, onLogout, onProfile, currentUser }) => {
    const hour = new Date().getHours();
    const greeting = hour < 12 ? "Suprabhat" : hour < 18 ? "Namaste" : "Shubh Ratri";
    
    return (
        <header className="flex items-center justify-between pb-4 border-b">
            <div>
                <h1 className="text-2xl font-bold text-blue-600">{t('appName')}</h1>
                <p className="text-gray-500">{greeting}, {t('greeting')}</p>
            </div>
            <div className="flex items-center space-x-3">
                <button
                    onClick={onLogout}
                    className="px-3 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-1"
                    title={t('logout')}
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                    </svg>
                    <span>{t('logout')}</span>
                </button>
                <button
                    onClick={onProfile}
                    className="w-12 h-12 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold text-xl hover:bg-orange-600 hover:scale-105 transition-all duration-200 shadow-md hover:shadow-lg"
                    title={`${currentUser?.name || 'User'} - View Profile`}
                >
                    {currentUser?.name?.charAt(0)?.toUpperCase() || 'U'}
                </button>
            </div>
        </header>
    );
};

export default Header;

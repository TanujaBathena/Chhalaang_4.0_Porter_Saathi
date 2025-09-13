import React, { useState, useEffect } from 'react';
import apiService from '../utils/apiService';

const WeeklyProgress = ({ t, language }) => {
    // State for weekly data - fetched from API
    const [weeklyData, setWeeklyData] = useState([
        { day: 'Mon', earnings: 1200, trips: 8, dayKey: 'monday' },
        { day: 'Tue', earnings: 1450, trips: 10, dayKey: 'tuesday' },
        { day: 'Wed', earnings: 980, trips: 6, dayKey: 'wednesday' },
        { day: 'Thu', earnings: 1650, trips: 12, dayKey: 'thursday' },
        { day: 'Fri', earnings: 1320, trips: 9, dayKey: 'friday' },
        { day: 'Sat', earnings: 1800, trips: 14, dayKey: 'saturday' },
        { day: 'Sun', earnings: 1250, trips: 8, dayKey: 'sunday' }
    ]);
    const [totalWeekEarnings, setTotalWeekEarnings] = useState(9650);
    const [avgDailyEarnings, setAvgDailyEarnings] = useState(1379);
    const [weeklyGrowth, setWeeklyGrowth] = useState('13.5');

    // Fetch real data from API
    useEffect(() => {
        const fetchWeeklyData = async () => {
            try {
                if (apiService.isAuthenticated()) {
                    const response = await apiService.getWeeklyEarnings();
                    
                    // Transform API data to match existing format
                    const transformedData = response.weeklyData.map(day => ({
                        day: day.dayName,
                        earnings: Math.round(day.netEarnings),
                        trips: day.trips,
                        dayKey: day.dayName.toLowerCase()
                    }));
                    
                    setWeeklyData(transformedData);
                    setTotalWeekEarnings(Math.round(response.currentWeek.netEarnings));
                    setAvgDailyEarnings(Math.round(response.currentWeek.netEarnings / 7));
                    setWeeklyGrowth(response.growthPercentage.toFixed(1));
                }
            } catch (error) {
                console.error('Failed to fetch weekly earnings, using fallback data:', error);
                // Keep existing fallback data
            }
        };

        fetchWeeklyData();
    }, []);

    const maxEarnings = Math.max(...weeklyData.map(d => d.earnings));

    // Day translations
    const dayTranslations = {
        monday: { en: 'Mon', hi: 'सोम', te: 'సోమ', ta: 'திங்' },
        tuesday: { en: 'Tue', hi: 'मंगल', te: 'మంగళ', ta: 'செவ்' },
        wednesday: { en: 'Wed', hi: 'बुध', te: 'బుధ', ta: 'புத' },
        thursday: { en: 'Thu', hi: 'गुरु', te: 'గురు', ta: 'வியா' },
        friday: { en: 'Fri', hi: 'शुक्र', te: 'శుక్ర', ta: 'வெள்' },
        saturday: { en: 'Sat', hi: 'शनि', te: 'శని', ta: 'சனி' },
        sunday: { en: 'Sun', hi: 'रवि', te: 'ఆది', ta: 'ஞாயி' }
    };

    const langKey = language?.split('-')[0] || 'en';

    return (
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4 mb-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-800">
                    {t('weeklyProgress') || 'Weekly Progress'}
                </h3>
                <div className="flex items-center">
                    <span className={`text-sm font-semibold ${weeklyGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {weeklyGrowth >= 0 ? '↗️' : '↘️'} {Math.abs(weeklyGrowth)}%
                    </span>
                </div>
            </div>

            {/* Weekly Stats Cards */}
            <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-blue-50 p-3 rounded-lg text-center">
                    <p className="text-xs text-gray-600">{t('weeklyTotal') || 'Weekly Total'}</p>
                    <p className="text-lg font-bold text-blue-600">₹{totalWeekEarnings.toLocaleString()}</p>
                </div>
                <div className="bg-green-50 p-3 rounded-lg text-center">
                    <p className="text-xs text-gray-600">{t('dailyAverage') || 'Daily Average'}</p>
                    <p className="text-lg font-bold text-green-600">₹{avgDailyEarnings.toLocaleString()}</p>
                </div>
            </div>

            {/* Bar Chart */}
            <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">{t('dailyEarnings') || 'Daily Earnings'}</p>
                <div className="flex items-end justify-between h-24 bg-gray-50 rounded-lg p-2">
                    {weeklyData.map((day, index) => {
                        const height = (day.earnings / maxEarnings) * 100;
                        const isToday = index === 6; // Assuming Sunday is today for demo
                        
                        return (
                            <div key={day.dayKey} className="flex flex-col items-center flex-1">
                                <div 
                                    className={`w-6 rounded-t transition-all duration-300 ${
                                        isToday ? 'bg-blue-500' : 'bg-gray-400'
                                    }`}
                                    style={{ height: `${height}%`, minHeight: '8px' }}
                                    title={`₹${day.earnings}`}
                                ></div>
                                <span className="text-xs text-gray-600 mt-1">
                                    {dayTranslations[day.dayKey]?.[langKey] || day.day}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Trip Count Indicators */}
            <div className="border-t pt-3">
                <p className="text-sm font-medium text-gray-700 mb-2">{t('tripsCompleted') || 'Trips Completed'}</p>
                <div className="flex justify-between items-center">
                    {weeklyData.map((day, index) => {
                        const isToday = index === 6;
                        return (
                            <div key={`trips-${day.dayKey}`} className="text-center">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                                    isToday ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
                                }`}>
                                    {day.trips}
                                </div>
                                <span className="text-xs text-gray-500 block mt-1">
                                    {dayTranslations[day.dayKey]?.[langKey] || day.day}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Performance Indicator */}
            <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-700">
                            {t('thisWeekPerformance') || 'This Week Performance'}
                        </p>
                        <p className="text-xs text-gray-600">
                            {weeklyGrowth >= 0 
                                ? (t('performanceUp') || 'Better than last week') 
                                : (t('performanceDown') || 'Lower than last week')
                            }
                        </p>
                    </div>
                    <div className="text-2xl">
                        {weeklyGrowth >= 5 ? '🚀' : weeklyGrowth >= 0 ? '📈' : weeklyGrowth >= -5 ? '📊' : '📉'}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WeeklyProgress; 
import React from 'react';

interface AchievementBadgeProps {
  title: string;
  description: string;
  image: string;
  earned: boolean;
  points: number;
}

export default function AchievementBadge({ title, description, image, earned, points }: AchievementBadgeProps) {
  return (
    <div className={`relative p-4 rounded-lg border-2 transition-all duration-300 ${
      earned 
        ? 'border-yellow-400 bg-yellow-50 shadow-lg' 
        : 'border-gray-200 bg-gray-50 opacity-60'
    }`}>
      <div className="text-center">
        <div className="relative inline-block mb-3">
          <img 
            src={image} 
            alt={title}
            className={`w-16 h-16 rounded-full ${earned ? '' : 'grayscale'}`}
          />
          {earned && (
            <div className="absolute -top-1 -right-1 bg-green-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
              ✓
            </div>
          )}
        </div>
        
        <h4 className={`font-bold text-sm mb-1 ${earned ? 'text-gray-800' : 'text-gray-500'}`}>
          {title}
        </h4>
        
        <p className={`text-xs mb-2 ${earned ? 'text-gray-600' : 'text-gray-400'}`}>
          {description}
        </p>
        
        <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
          earned 
            ? 'bg-yellow-200 text-yellow-800' 
            : 'bg-gray-200 text-gray-500'
        }`}>
          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          {points} pts
        </div>
      </div>
    </div>
  );
}
import React from 'react';
import { RefreshCw } from 'lucide-react';

interface PullToRefreshIndicatorProps {
  pullDistance: number;
  isRefreshing: boolean;
  canRefresh: boolean;
  threshold: number;
}

export const PullToRefreshIndicator: React.FC<PullToRefreshIndicatorProps> = ({
  pullDistance,
  isRefreshing,
  canRefresh,
  threshold
}) => {
  const progress = Math.min(pullDistance / threshold, 1);
  const opacity = Math.min(pullDistance / 30, 1);
  
  return (
    <div 
      className="fixed top-0 left-0 right-0 z-30 flex justify-center transition-all duration-200"
      style={{ 
        transform: `translateY(${Math.min(pullDistance - 60, 0)}px)`,
        opacity: opacity
      }}
    >
      <div className="bg-white rounded-full shadow-lg p-3 mt-4 border">
        <RefreshCw 
          className={`w-6 h-6 transition-all duration-200 ${
            isRefreshing 
              ? 'animate-spin text-blue-600' 
              : canRefresh 
                ? 'text-green-600 scale-110' 
                : 'text-gray-400'
          }`}
          style={{
            transform: `rotate(${progress * 180}deg)`
          }}
        />
      </div>
      
      {/* Progress indicator */}
      <div 
        className="absolute top-12 left-1/2 transform -translate-x-1/2 mt-2"
        style={{ opacity: opacity }}
      >
        <div className="w-12 h-1 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-200 ${
              canRefresh ? 'bg-green-500' : 'bg-blue-500'
            }`}
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
};
import React, { useState, useRef } from 'react';
import { Home, BookOpen, User, Settings, Menu, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useSwipeGestures } from '../hooks/useSwipeGestures';

interface MobileNavigationProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  isAuthenticated: boolean;
}

const tabs = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'subjects', label: 'Subjects', icon: BookOpen },
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export const MobileNavigation: React.FC<MobileNavigationProps> = ({
  currentTab,
  onTabChange,
  isAuthenticated
}) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLDivElement>(null);

  // Swipe gestures for tab navigation
  useSwipeGestures(navRef, {
    onSwipeLeft: () => {
      const currentIndex = tabs.findIndex(tab => tab.id === currentTab);
      if (currentIndex < tabs.length - 1) {
        onTabChange(tabs[currentIndex + 1].id);
      }
    },
    onSwipeRight: () => {
      const currentIndex = tabs.findIndex(tab => tab.id === currentTab);
      if (currentIndex > 0) {
        onTabChange(tabs[currentIndex - 1].id);
      }
    },
    threshold: 50
  });

  // Swipe to close drawer
  useSwipeGestures(drawerRef, {
    onSwipeLeft: () => setIsDrawerOpen(false),
    threshold: 100
  });

  if (!isAuthenticated) return null;

  return (
    <>
      {/* Bottom Tab Navigation */}
      <div 
        ref={navRef}
        className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 safe-area-bottom"
      >
        <div className="flex justify-around items-center py-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex flex-col items-center py-2 px-3 rounded-lg transition-all duration-200 touch-target ${
                  isActive 
                    ? 'text-blue-600 bg-blue-50 scale-105' 
                    : 'text-gray-500 hover:text-gray-700 active:scale-95'
                }`}
              >
                <Icon className={`w-5 h-5 mb-1 ${isActive ? 'animate-bounce-subtle' : ''}`} />
                <span className="text-xs font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Hamburger Menu Button */}
      <button
        onClick={() => setIsDrawerOpen(true)}
        className="fixed top-4 right-4 z-50 bg-white shadow-lg rounded-full p-3 touch-target md:hidden"
      >
        <Menu className="w-5 h-5 text-gray-600" />
      </button>

      {/* Slide-out Drawer */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50">
          <div 
            className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
            onClick={() => setIsDrawerOpen(false)}
          />
          <div 
            ref={drawerRef}
            className="absolute right-0 top-0 h-full w-80 max-w-[85vw] bg-white shadow-xl transform transition-transform duration-300 ease-out"
          >
            <div className="p-4 border-b">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-800">Menu</h2>
                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-2 rounded-lg hover:bg-gray-100 touch-target"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="p-4 space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = currentTab === tab.id;
                
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      onTabChange(tab.id);
                      setIsDrawerOpen(false);
                    }}
                    className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-all touch-target ${
                      isActive 
                        ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600' 
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{tab.label}</span>
                    {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
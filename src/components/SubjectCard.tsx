import React from 'react';

interface SubjectCardProps {
  title: string;
  description: string;
  image: string;
  lessons: number;
  completed: number;
  color: string;
  onClick: () => void;
}

export default function SubjectCard({ title, description, image, lessons, completed, color, onClick }: SubjectCardProps) {
  const progress = Math.round((completed / lessons) * 100);
  
  return (
    <div 
      onClick={onClick}
      className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1 overflow-hidden"
    >
      <div className="h-48 overflow-hidden">
        <img 
          src={image} 
          alt={title}
          className="w-full h-full object-cover"
        />
      </div>
      
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
        <p className="text-gray-600 text-sm mb-4">{description}</p>
        
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-gray-500">{lessons} lessons</span>
          <span className="text-sm font-medium text-gray-700">{completed}/{lessons}</span>
        </div>
        
        <div className={`${color} rounded-full h-2 mb-4`}>
          <div 
            className="bg-white rounded-full h-2 transition-all duration-500"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">{progress}% complete</span>
          <div className="flex items-center text-blue-600">
            <span className="text-sm font-medium mr-1">Continue</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
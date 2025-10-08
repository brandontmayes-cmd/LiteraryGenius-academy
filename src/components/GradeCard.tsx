import React from 'react';

interface GradeCardProps {
  grade: string;
  title: string;
  subjects: number;
  progress: number;
  color: string;
  onClick: () => void;
}

export default function GradeCard({ grade, title, subjects, progress, color, onClick }: GradeCardProps) {
  return (
    <div 
      onClick={onClick}
      className={`${color} rounded-xl p-6 cursor-pointer transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="text-white">
          <h3 className="text-2xl font-bold">{grade}</h3>
          <p className="text-white/80">{title}</p>
        </div>
        <div className="bg-white/20 rounded-full p-3">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
      </div>
      
      <div className="text-white/90 text-sm mb-3">
        {subjects} subjects available
      </div>
      
      <div className="bg-white/20 rounded-full h-2 mb-2">
        <div 
          className="bg-white rounded-full h-2 transition-all duration-500"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      
      <div className="text-white/80 text-xs">
        {progress}% completed
      </div>
    </div>
  );
}
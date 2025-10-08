import React from 'react';
import { ArrowRight, Play } from 'lucide-react';

interface LandingHeroProps {
  onGetStarted: () => void;
  isAuthenticated: boolean;
}

export function LandingHero({ onGetStarted, isAuthenticated }: LandingHeroProps) {
  return (
    <div className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 text-white overflow-hidden">
      <div className="absolute inset-0 bg-black/10"></div>
      <div className="relative max-w-7xl mx-auto px-4 py-20 md:py-28 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <h1 className="text-4xl md:text-6xl font-bold leading-tight">
              Transform Learning with Mobile-First Education
            </h1>
            <p className="text-xl md:text-2xl text-blue-100">
              Complete learning management platform with offline capabilities, AI-powered insights, and mobile optimization for students, teachers, and parents.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={onGetStarted}
                className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-all flex items-center justify-center gap-2 shadow-xl"
              >
                {isAuthenticated ? 'Go to Dashboard' : 'Get Started Free'}
                <ArrowRight className="w-5 h-5" />
              </button>
              <button className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white/10 transition-all flex items-center justify-center gap-2">
                <Play className="w-5 h-5" />
                Watch Demo
              </button>
            </div>
          </div>
          <div className="relative">
            <img 
              src="https://d64gsuwffb70l.cloudfront.net/68cafa1d5a414d406590e7bd_1759534463389_a0fc3451.webp"
              alt="Students learning"
              className="rounded-2xl shadow-2xl"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

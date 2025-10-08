import React from 'react';
import { Smartphone, Camera, Bell, Wifi, Zap, Users } from 'lucide-react';

const features = [
  {
    icon: Smartphone,
    title: 'Mobile-First Design',
    description: 'Optimized for smartphones and tablets with touch-friendly controls',
    image: 'https://d64gsuwffb70l.cloudfront.net/68cafa1d5a414d406590e7bd_1759534464194_27e46341.webp'
  },
  {
    icon: Camera,
    title: 'Camera Integration',
    description: 'Capture and submit assignments directly from your device camera',
    image: 'https://d64gsuwffb70l.cloudfront.net/68cafa1d5a414d406590e7bd_1759534470575_02993dde.webp'
  },
  {
    icon: Bell,
    title: 'Push Notifications',
    description: 'Stay updated with real-time alerts for grades and assignments',
    image: 'https://d64gsuwffb70l.cloudfront.net/68cafa1d5a414d406590e7bd_1759534472394_776aa5c5.webp'
  },
  {
    icon: Wifi,
    title: 'Offline Mode',
    description: 'Work without internet and sync automatically when online',
    image: 'https://d64gsuwffb70l.cloudfront.net/68cafa1d5a414d406590e7bd_1759534474266_2e82b29e.webp'
  },
  {
    icon: Zap,
    title: 'AI-Powered Learning',
    description: 'Personalized learning paths and intelligent tutoring assistance',
    image: 'https://d64gsuwffb70l.cloudfront.net/68cafa1d5a414d406590e7bd_1759534465015_84648345.webp'
  },
  {
    icon: Users,
    title: 'Multi-Role Support',
    description: 'Tailored experiences for students, teachers, and parents',
    image: 'https://d64gsuwffb70l.cloudfront.net/68cafa1d5a414d406590e7bd_1759534465744_8a370c11.webp'
  }
];

export function FeatureShowcase() {
  return (
    <div className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Everything You Need for Modern Learning
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            A comprehensive platform designed for the mobile generation
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="group bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100"
            >
              <div className="h-48 overflow-hidden">
                <img 
                  src={feature.image}
                  alt={feature.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              <div className="p-6">
                <feature.icon className="w-10 h-10 text-blue-600 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

import React from 'react';
import { TrendingUp, Users, BookOpen, Award } from 'lucide-react';

const stats = [
  { icon: Users, value: '50K+', label: 'Active Students' },
  { icon: BookOpen, value: '10K+', label: 'Courses Completed' },
  { icon: Award, value: '98%', label: 'Success Rate' },
  { icon: TrendingUp, value: '4.9/5', label: 'User Rating' }
];

export function StatsSection() {
  return (
    <div className="bg-gradient-to-r from-blue-600 to-purple-600 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center text-white">
              <stat.icon className="w-12 h-12 mx-auto mb-4 opacity-90" />
              <div className="text-4xl font-bold mb-2">{stat.value}</div>
              <div className="text-blue-100 text-lg">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

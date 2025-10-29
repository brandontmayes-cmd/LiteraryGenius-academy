import { Link } from 'react-router-dom';
import { ArrowLeft, Brain, BookOpen, BarChart, Users, Award, Zap, Shield, Globe } from 'lucide-react';

export default function Features() {
  const features = [
    { icon: Brain, title: 'AI-Powered Learning', desc: 'Adaptive learning paths personalized to each student' },
    { icon: BookOpen, title: 'Common Core Aligned', desc: 'Curriculum aligned with educational standards' },
    { icon: BarChart, title: 'Real-Time Analytics', desc: 'Track progress with detailed insights' },
    { icon: Users, title: 'Collaborative Tools', desc: 'Connect students, teachers, and parents' },
    { icon: Award, title: 'Gamification', desc: 'Earn badges and rewards for achievements' },
    { icon: Zap, title: 'Instant Feedback', desc: 'Get immediate feedback on assignments' },
    { icon: Shield, title: 'Secure Platform', desc: 'Enterprise-grade security and privacy' },
    { icon: Globe, title: 'Mobile Access', desc: 'Learn anywhere on any device' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <Link to="/" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-8">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>
        
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Platform Features</h1>
        <p className="text-xl text-gray-600 mb-12">Everything you need for successful learning</p>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, idx) => (
            <div key={idx} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition">
              <feature.icon className="w-12 h-12 text-blue-600 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 bg-blue-600 text-white rounded-lg p-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl mb-6">Join thousands of students already learning with us</p>
          <Link to="/" className="inline-block bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100">
            Start Free Trial
          </Link>
        </div>
      </div>
    </div>
  );
}

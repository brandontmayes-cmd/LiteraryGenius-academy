import { Link } from 'react-router-dom';
import { ArrowLeft, Brain, Trophy, BookOpen, Sparkles } from 'lucide-react';

export default function ForStudents() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <Link to="/" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-8">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>
        
        <h1 className="text-4xl font-bold text-gray-900 mb-4">For Students</h1>
        <p className="text-xl text-gray-600 mb-12">Learn at your own pace with AI-powered tools</p>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white rounded-lg shadow-sm p-8">
            <Brain className="w-12 h-12 text-blue-600 mb-4" />
            <h3 className="text-2xl font-semibold text-gray-900 mb-3">Personalized Learning</h3>
            <p className="text-gray-700">AI adapts to your learning style and pace, providing customized lessons just for you.</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-8">
            <Trophy className="w-12 h-12 text-blue-600 mb-4" />
            <h3 className="text-2xl font-semibold text-gray-900 mb-3">Earn Rewards</h3>
            <p className="text-gray-700">Complete lessons, earn badges, and compete with friends on the leaderboard.</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-8">
            <BookOpen className="w-12 h-12 text-blue-600 mb-4" />
            <h3 className="text-2xl font-semibold text-gray-900 mb-3">Interactive Lessons</h3>
            <p className="text-gray-700">Engage with multimedia content, quizzes, and hands-on activities.</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-8">
            <Sparkles className="w-12 h-12 text-blue-600 mb-4" />
            <h3 className="text-2xl font-semibold text-gray-900 mb-3">AI Tutor</h3>
            <p className="text-gray-700">Get instant help from your personal AI tutor available 24/7.</p>
          </div>
        </div>

        <div className="bg-blue-600 text-white rounded-lg p-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Start Learning Today</h2>
          <p className="text-xl mb-6">Join over 50,000 students improving their skills</p>
          <Link to="/" className="inline-block bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100">
            Create Student Account
          </Link>
        </div>
      </div>
    </div>
  );
}

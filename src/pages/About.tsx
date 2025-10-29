import { Link } from 'react-router-dom';
import { ArrowLeft, BookOpen, Users, Award, Target } from 'lucide-react';

export default function About() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <Link to="/" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-8">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>
        
        <h1 className="text-4xl font-bold text-gray-900 mb-4">About Literary Genius Academy</h1>
        <p className="text-xl text-gray-600 mb-12">Empowering learners worldwide with AI-driven education.</p>

        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Our Mission</h2>
          <p className="text-gray-700 text-lg">We're dedicated to transforming education through innovative technology, making high-quality learning accessible to students everywhere.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <BookOpen className="w-12 h-12 text-blue-600 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Comprehensive Curriculum</h3>
            <p className="text-gray-700">Aligned with Common Core standards and designed by education experts.</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <Users className="w-12 h-12 text-blue-600 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Collaborative Learning</h3>
            <p className="text-gray-700">Connect students, teachers, and parents in a unified platform.</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <Award className="w-12 h-12 text-blue-600 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Proven Results</h3>
            <p className="text-gray-700">Students show measurable improvement in reading and writing skills.</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <Target className="w-12 h-12 text-blue-600 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Personalized Paths</h3>
            <p className="text-gray-700">AI-powered adaptive learning tailored to each student's needs.</p>
          </div>
        </div>

        <div className="bg-blue-600 text-white rounded-lg p-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Join Our Community</h2>
          <p className="text-xl mb-6">Over 50,000 students learning with us</p>
          <Link to="/" className="inline-block bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100">
            Get Started Today
          </Link>
        </div>
      </div>
    </div>
  );
}

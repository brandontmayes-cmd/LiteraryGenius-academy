import { Link } from 'react-router-dom';
import { ArrowLeft, Users, ClipboardList, BarChart3, MessageSquare } from 'lucide-react';

export default function ForTeachers() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <Link to="/" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-8">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>
        
        <h1 className="text-4xl font-bold text-gray-900 mb-4">For Teachers</h1>
        <p className="text-xl text-gray-600 mb-12">Powerful tools to manage your classroom</p>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white rounded-lg shadow-sm p-8">
            <Users className="w-12 h-12 text-blue-600 mb-4" />
            <h3 className="text-2xl font-semibold text-gray-900 mb-3">Class Management</h3>
            <p className="text-gray-700">Easily organize students, track attendance, and manage multiple classes from one dashboard.</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-8">
            <ClipboardList className="w-12 h-12 text-blue-600 mb-4" />
            <h3 className="text-2xl font-semibold text-gray-900 mb-3">Assignment Creation</h3>
            <p className="text-gray-700">Create custom assignments with various question types and automated grading.</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-8">
            <BarChart3 className="w-12 h-12 text-blue-600 mb-4" />
            <h3 className="text-2xl font-semibold text-gray-900 mb-3">Progress Analytics</h3>
            <p className="text-gray-700">Monitor student progress with detailed analytics and identify areas for improvement.</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-8">
            <MessageSquare className="w-12 h-12 text-blue-600 mb-4" />
            <h3 className="text-2xl font-semibold text-gray-900 mb-3">Parent Communication</h3>
            <p className="text-gray-700">Keep parents informed with automated progress reports and messaging tools.</p>
          </div>
        </div>

        <div className="bg-blue-600 text-white rounded-lg p-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Start Teaching Today</h2>
          <p className="text-xl mb-6">Join thousands of educators using our platform</p>
          <Link to="/" className="inline-block bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100">
            Create Teacher Account
          </Link>
        </div>
      </div>
    </div>
  );
}

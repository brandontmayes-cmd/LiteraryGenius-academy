import { Link } from 'react-router-dom';
import { ArrowLeft, Clock } from 'lucide-react';

export default function ComingSoon() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center">
        <Link to="/" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-8">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>
        
        <div className="bg-white rounded-2xl shadow-xl p-12">
          <Clock className="w-20 h-20 text-blue-600 mx-auto mb-6" />
          <h1 className="text-5xl font-bold text-gray-900 mb-4">Coming Soon</h1>
          <p className="text-xl text-gray-600 mb-8">
            We're working hard to bring you something amazing. Stay tuned!
          </p>
          <div className="flex justify-center gap-4">
            <Link 
              to="/" 
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Return Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

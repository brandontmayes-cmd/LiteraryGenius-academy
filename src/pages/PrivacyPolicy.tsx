import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Link to="/" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-8">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>
        
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
        <p className="text-gray-600 mb-8">Last updated: January 2025</p>

        <div className="bg-white rounded-lg shadow-sm p-8 space-y-6">
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">1. Information We Collect</h2>
            <p className="text-gray-700 mb-3">We collect information you provide directly to us, including:</p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Name, email address, and account credentials</li>
              <li>Student grade level and educational progress</li>
              <li>Assignment submissions and quiz responses</li>
              <li>Usage data and analytics</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">2. How We Use Your Information</h2>
            <p className="text-gray-700">We use the information we collect to:</p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Provide, maintain, and improve our services</li>
              <li>Personalize your learning experience</li>
              <li>Send you educational content and updates</li>
              <li>Monitor and analyze usage patterns</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">3. Data Security</h2>
            <p className="text-gray-700">We implement appropriate security measures to protect your personal information from unauthorized access, alteration, or disclosure.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">4. Your Rights</h2>
            <p className="text-gray-700">You have the right to access, update, or delete your personal information at any time through your account settings.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">5. Contact Us</h2>
            <p className="text-gray-700">If you have questions about this Privacy Policy, contact us at privacy@literarygenius.com</p>
          </section>
        </div>
      </div>
    </div>
  );
}

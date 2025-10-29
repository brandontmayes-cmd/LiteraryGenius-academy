import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function CookiePolicy() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Link to="/" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-8">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>
        
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Cookie Policy</h1>
        <p className="text-gray-600 mb-8">Last updated: January 2025</p>

        <div className="bg-white rounded-lg shadow-sm p-8 space-y-6">
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">What Are Cookies?</h2>
            <p className="text-gray-700">Cookies are small text files stored on your device when you visit our website. They help us provide a better user experience.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">How We Use Cookies</h2>
            <p className="text-gray-700 mb-3">We use cookies for:</p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li><strong>Essential Cookies:</strong> Required for authentication and security</li>
              <li><strong>Performance Cookies:</strong> Help us understand how you use our site</li>
              <li><strong>Functionality Cookies:</strong> Remember your preferences</li>
              <li><strong>Analytics Cookies:</strong> Measure and improve our services</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">Managing Cookies</h2>
            <p className="text-gray-700">You can control cookies through your browser settings. Note that disabling certain cookies may affect site functionality.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">Third-Party Cookies</h2>
            <p className="text-gray-700">We may use third-party services that set cookies for analytics and advertising purposes.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">Contact Us</h2>
            <p className="text-gray-700">Questions about our Cookie Policy? Contact us at privacy@literarygenius.com</p>
          </section>
        </div>
      </div>
    </div>
  );
}

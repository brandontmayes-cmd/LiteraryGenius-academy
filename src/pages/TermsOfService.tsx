import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Link to="/" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-8">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>
        
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Terms of Service</h1>
        <p className="text-gray-600 mb-8">Last updated: January 2025</p>

        <div className="bg-white rounded-lg shadow-sm p-8 space-y-6">
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">1. Acceptance of Terms</h2>
            <p className="text-gray-700">By accessing and using Literary Genius Academy, you accept and agree to be bound by these Terms of Service.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">2. User Accounts</h2>
            <p className="text-gray-700 mb-3">When creating an account, you agree to:</p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Provide accurate and complete information</li>
              <li>Maintain the security of your account credentials</li>
              <li>Accept responsibility for all activities under your account</li>
              <li>Notify us immediately of any unauthorized use</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">3. Acceptable Use</h2>
            <p className="text-gray-700">You agree not to misuse our services, including but not limited to:</p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Violating any applicable laws or regulations</li>
              <li>Infringing on intellectual property rights</li>
              <li>Transmitting harmful or malicious content</li>
              <li>Attempting to gain unauthorized access</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">4. Intellectual Property</h2>
            <p className="text-gray-700">All content, features, and functionality are owned by Literary Genius Academy and protected by copyright and trademark laws.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">5. Termination</h2>
            <p className="text-gray-700">We reserve the right to terminate or suspend access to our services for violations of these terms.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">6. Contact</h2>
            <p className="text-gray-700">Questions about these Terms? Contact us at legal@literarygenius.com</p>
          </section>
        </div>
      </div>
    </div>
  );
}

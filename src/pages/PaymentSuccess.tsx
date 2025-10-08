import React, { useEffect } from 'react';
import { CheckCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useNavigate } from 'react-router-dom';

export default function PaymentSuccess() {
  const navigate = useNavigate();

  useEffect(() => {
    // Here you could verify the session with Stripe
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get('session_id');
    console.log('Payment successful, session:', sessionId);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="mb-6">
            <CheckCircle className="w-20 h-20 text-green-500 mx-auto" />
          </div>
          
          <h1 className="text-3xl font-bold mb-4">Payment Successful!</h1>
          <p className="text-gray-600 mb-8">
            Thank you for subscribing to Literary Genius Academy. 
            Your account has been upgraded and you now have access to all premium features.
          </p>
          
          <div className="space-y-3">
            <Button 
              onClick={() => navigate('/')}
              className="w-full"
            >
              Go to Dashboard
            </Button>
            <Button 
              onClick={() => navigate('/')}
              variant="outline"
              className="w-full"
            >
              View My Subscription
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
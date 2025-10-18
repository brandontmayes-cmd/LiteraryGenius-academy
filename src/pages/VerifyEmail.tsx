import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2, Mail, ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Button } from '../components/ui/button';

export default function VerifyEmail() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [verificationType, setVerificationType] = useState<string>('');
  const [countdown, setCountdown] = useState(3);
  const [resending, setResending] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        const type = hashParams.get('type');
        const error = hashParams.get('error');
        const errorDescription = hashParams.get('error_description');

        setVerificationType(type || 'unknown');

        if (error) {
          throw new Error(errorDescription || error);
        }

        if (!accessToken || !refreshToken) {
          throw new Error('Invalid or expired verification link');
        }

        const { data, error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        if (sessionError) throw sessionError;

        if (data.user) {
          await supabase
            .from('user_profiles')
            .update({ email_verified: true })
            .eq('user_id', data.user.id);

          setStatus('success');
          setMessage(getSuccessMessage(type || 'signup'));
        } else {
          throw new Error('Unable to verify email');
        }
      } catch (error: any) {
        setStatus('error');
        setMessage(error.message || 'Email verification failed');
      }
    };

    verifyEmail();
  }, []);

  useEffect(() => {
    if (status === 'success' && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (status === 'success' && countdown === 0) {
      navigate('/');
    }
  }, [status, countdown, navigate]);

  const getSuccessMessage = (type: string) => {
    switch (type) {
      case 'signup':
        return 'Your email has been verified! Welcome aboard.';
      case 'recovery':
        return 'Email verified! You can now reset your password.';
      case 'invite':
        return 'Email verified! Your account is now active.';
      case 'magiclink':
        return 'Email verified! Logging you in...';
      default:
        return 'Email verified successfully!';
    }
  };

  const handleResendVerification = async () => {
    setResending(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) {
        await supabase.auth.resend({
          type: 'signup',
          email: user.email,
        });
        setMessage('Verification email resent! Please check your inbox.');
      }
    } catch (error: any) {
      setMessage(error.message || 'Failed to resend verification email');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
        {status === 'loading' && (
          <div className="text-center">
            <div className="relative inline-block mb-6">
              <Mail className="w-16 h-16 text-blue-600" />
              <Loader2 className="w-8 h-8 text-blue-600 absolute -top-2 -right-2 animate-spin" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Verifying Email</h2>
            <p className="text-gray-600">Please wait while we verify your email address...</p>
            <div className="mt-6 flex justify-center">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        )}

        {status === 'success' && (
          <div className="text-center">
            <div className="relative inline-block mb-6">
              <CheckCircle className="w-20 h-20 text-green-600 animate-pulse" />
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-3">Email Verified!</h2>
            <p className="text-gray-600 mb-6">{message}</p>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-green-800">
                Redirecting to dashboard in <span className="font-bold text-lg">{countdown}</span> second{countdown !== 1 ? 's' : ''}...
              </p>
            </div>
            <Button onClick={() => navigate('/')} className="w-full group">
              Go to Dashboard Now
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        )}

        {status === 'error' && (
          <div className="text-center">
            <XCircle className="w-20 h-20 text-red-600 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-gray-800 mb-3">Verification Failed</h2>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-red-800">{message}</p>
            </div>
            
            <div className="space-y-3">
              <Button 
                onClick={handleResendVerification}
                disabled={resending}
                variant="outline"
                className="w-full"
              >
                {resending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Resending...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Resend Verification Email
                  </>
                )}
              </Button>
              
              <Button onClick={() => navigate('/')} className="w-full">
                Return to Home
              </Button>
            </div>

            <div className="mt-6 text-xs text-gray-500">
              <p>Common issues:</p>
              <ul className="mt-2 space-y-1 text-left">
                <li>• Link may have expired (valid for 24 hours)</li>
                <li>• Link can only be used once</li>
                <li>• Check if you're using the latest email</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

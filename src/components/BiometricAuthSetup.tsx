import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Fingerprint, CheckCircle, AlertCircle } from 'lucide-react';
import { useBiometricAuth } from '@/hooks/useBiometricAuth';
import { useAuth } from '@/contexts/AuthContext';

export const BiometricAuthSetup: React.FC = () => {
  const { isAvailable, isRegistered, register, authenticate } = useBiometricAuth();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleRegister = async () => {
    if (!user) return;
    setLoading(true);
    setMessage(null);
    
    try {
      await register(user.id, user.email || '');
      setMessage({ type: 'success', text: 'Biometric authentication enabled successfully!' });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to enable biometric auth' });
    } finally {
      setLoading(false);
    }
  };

  const handleTest = async () => {
    setLoading(true);
    setMessage(null);
    
    try {
      await authenticate();
      setMessage({ type: 'success', text: 'Biometric authentication successful!' });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Authentication failed' });
    } finally {
      setLoading(false);
    }
  };

  if (!isAvailable) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Biometric authentication is not available on this device.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Fingerprint className="h-5 w-5" />
          Biometric Authentication
        </CardTitle>
        <CardDescription>
          Use fingerprint or face recognition for quick login
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {message && (
          <Alert variant={message.type === 'error' ? 'destructive' : 'default'}>
            {message.type === 'success' ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
            <AlertDescription>{message.text}</AlertDescription>
          </Alert>
        )}
        
        {!isRegistered ? (
          <Button onClick={handleRegister} disabled={loading} className="w-full">
            {loading ? 'Setting up...' : 'Enable Biometric Login'}
          </Button>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-5 w-5" />
              <span>Biometric authentication is enabled</span>
            </div>
            <Button onClick={handleTest} disabled={loading} variant="outline" className="w-full">
              {loading ? 'Testing...' : 'Test Biometric Login'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

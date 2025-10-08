import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Mail, Smartphone, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';

type RecoveryStep = 'email' | 'method' | 'security-questions' | 'emergency-contact' | 'trusted-device' | 'reset-password' | 'complete';

export default function AccountRecoveryFlow({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState<RecoveryStep>('email');
  const [email, setEmail] = useState('');
  const [recoveryMethod, setRecoveryMethod] = useState<string>('');
  const [securityQuestions, setSecurityQuestions] = useState<any[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [emergencyContacts, setEmergencyContacts] = useState<any[]>([]);
  const [selectedContact, setSelectedContact] = useState<any>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [deviceFingerprint] = useState(() => {
    return `${navigator.userAgent}-${screen.width}x${screen.height}`;
  });

  const checkEmail = async () => {
    setLoading(true);
    setMessage(null);

    try {
      const { data: { users } } = await supabase.auth.admin.listUsers();
      const user = users.find(u => u.email === email);

      if (!user) {
        setMessage({ type: 'error', text: 'No account found with this email' });
        setLoading(false);
        return;
      }

      const [questionsRes, contactsRes] = await Promise.all([
        supabase.from('security_questions').select('*').eq('user_id', user.id),
        supabase.from('emergency_contacts').select('*').eq('user_id', user.id).eq('verified', true)
      ]);

      const hasQuestions = questionsRes.data && questionsRes.data.length >= 2;
      const hasContacts = contactsRes.data && contactsRes.data.length > 0;

      if (!hasQuestions && !hasContacts) {
        setMessage({ type: 'error', text: 'No recovery methods set up. Please contact support.' });
        setLoading(false);
        return;
      }

      if (hasQuestions) setSecurityQuestions(questionsRes.data || []);
      if (hasContacts) setEmergencyContacts(contactsRes.data || []);

      setStep('method');
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    }
    setLoading(false);
  };

  const verifySecurityQuestions = async () => {
    setLoading(true);
    const securityAnswers = Object.entries(answers).map(([questionId, answer]) => ({
      questionId,
      answer
    }));

    const { data } = await supabase.functions.invoke('account-recovery', {
      body: { action: 'verify-security-questions', email, securityAnswers }
    });

    if (data?.verified) {
      setMessage({ type: 'success', text: 'Identity verified!' });
      setStep('reset-password');
    } else {
      setMessage({ type: 'error', text: 'Incorrect answers. Please try again.' });
    }
    setLoading(false);
  };

  const sendVerificationCode = async () => {
    setLoading(true);
    const { data } = await supabase.functions.invoke('account-recovery', {
      body: { action: 'send-verification-code', contactId: selectedContact.id }
    });

    if (data?.codeSent) {
      setMessage({ type: 'success', text: 'Verification code sent!' });
    }
    setLoading(false);
  };

  const verifyCode = async () => {
    setLoading(true);
    const { data } = await supabase.functions.invoke('account-recovery', {
      body: { action: 'verify-code', contactId: selectedContact.id, verificationCode }
    });

    if (data?.verified) {
      setMessage({ type: 'success', text: 'Code verified!' });
      setStep('reset-password');
    } else {
      setMessage({ type: 'error', text: 'Invalid or expired code' });
    }
    setLoading(false);
  };

  const verifyTrustedDevice = async () => {
    setLoading(true);
    const { data } = await supabase.functions.invoke('account-recovery', {
      body: { action: 'verify-trusted-device', email, deviceFingerprint }
    });

    if (data?.verified) {
      setMessage({ type: 'success', text: 'Device verified!' });
      setStep('reset-password');
    } else {
      setMessage({ type: 'error', text: 'This device is not trusted' });
    }
    setLoading(false);
  };

  const resetPassword = async () => {
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match' });
      return;
    }

    if (newPassword.length < 8) {
      setMessage({ type: 'error', text: 'Password must be at least 8 characters' });
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) {
      setMessage({ type: 'error', text: error.message });
    } else {
      setStep('complete');
    }
    setLoading(false);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Account Recovery</CardTitle>
        <CardDescription>Recover access to your account through verified methods</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {message && (
          <Alert variant={message.type === 'error' ? 'destructive' : 'default'}>
            {message.type === 'success' ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
            <AlertDescription>{message.text}</AlertDescription>
          </Alert>
        )}

        {step === 'email' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Email Address</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
              />
            </div>
            <Button onClick={checkEmail} disabled={loading} className="w-full">
              Continue <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}

        {step === 'method' && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Choose a recovery method:</p>
            
            {securityQuestions.length >= 2 && (
              <Button
                variant="outline"
                className="w-full justify-start h-auto p-4"
                onClick={() => setStep('security-questions')}
              >
                <Shield className="mr-3 h-5 w-5" />
                <div className="text-left">
                  <p className="font-medium">Security Questions</p>
                  <p className="text-sm text-muted-foreground">Answer your security questions</p>
                </div>
              </Button>
            )}

            {emergencyContacts.length > 0 && (
              <Button
                variant="outline"
                className="w-full justify-start h-auto p-4"
                onClick={() => setStep('emergency-contact')}
              >
                <Mail className="mr-3 h-5 w-5" />
                <div className="text-left">
                  <p className="font-medium">Emergency Contact</p>
                  <p className="text-sm text-muted-foreground">Verify via email or SMS</p>
                </div>
              </Button>
            )}

            <Button
              variant="outline"
              className="w-full justify-start h-auto p-4"
              onClick={() => { setStep('trusted-device'); verifyTrustedDevice(); }}
            >
              <Smartphone className="mr-3 h-5 w-5" />
              <div className="text-left">
                <p className="font-medium">Trusted Device</p>
                <p className="text-sm text-muted-foreground">Verify this device is trusted</p>
              </div>
            </Button>
          </div>
        )}

        {step === 'security-questions' && (
          <div className="space-y-4">
            {securityQuestions.slice(0, 2).map((q) => (
              <div key={q.id} className="space-y-2">
                <Label>{q.question}</Label>
                <Input
                  type="text"
                  value={answers[q.id] || ''}
                  onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
                  placeholder="Your answer"
                />
              </div>
            ))}
            <Button onClick={verifySecurityQuestions} disabled={loading} className="w-full">
              Verify Answers
            </Button>
          </div>
        )}

        {step === 'emergency-contact' && (
          <div className="space-y-4">
            {!selectedContact ? (
              emergencyContacts.map((contact) => (
                <Button
                  key={contact.id}
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => { setSelectedContact(contact); sendVerificationCode(); }}
                >
                  {contact.contact_type === 'sms' ? <Smartphone className="mr-2 h-4 w-4" /> : <Mail className="mr-2 h-4 w-4" />}
                  {contact.contact_value}
                </Button>
              ))
            ) : (
              <>
                <div className="space-y-2">
                  <Label>Verification Code</Label>
                  <Input
                    type="text"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    placeholder="Enter 6-digit code"
                    maxLength={6}
                  />
                </div>
                <Button onClick={verifyCode} disabled={loading} className="w-full">
                  Verify Code
                </Button>
                <Button variant="outline" onClick={sendVerificationCode} disabled={loading} className="w-full">
                  Resend Code
                </Button>
              </>
            )}
          </div>
        )}

        {step === 'reset-password' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>New Password</Label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
              />
            </div>
            <div className="space-y-2">
              <Label>Confirm Password</Label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
              />
            </div>
            <Button onClick={resetPassword} disabled={loading} className="w-full">
              Reset Password
            </Button>
          </div>
        )}

        {step === 'complete' && (
          <div className="text-center space-y-4">
            <CheckCircle2 className="h-16 w-16 text-green-600 mx-auto" />
            <h3 className="text-xl font-semibold">Password Reset Complete!</h3>
            <p className="text-muted-foreground">You can now sign in with your new password.</p>
            <Button onClick={onClose} className="w-full">
              Return to Login
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
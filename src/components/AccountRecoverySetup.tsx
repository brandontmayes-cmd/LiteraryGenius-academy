import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Smartphone, Mail, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

const COMMON_QUESTIONS = [
  "What was the name of your first pet?",
  "What city were you born in?",
  "What is your mother's maiden name?",
  "What was the name of your elementary school?",
  "What is your favorite book?",
  "What was your childhood nickname?",
  "In what city did you meet your spouse?",
  "What is the name of your favorite teacher?"
];

export default function AccountRecoverySetup() {
  const { user } = useAuth();
  const [securityQuestions, setSecurityQuestions] = useState<any[]>([]);
  const [emergencyContacts, setEmergencyContacts] = useState<any[]>([]);
  const [trustedDevices, setTrustedDevices] = useState<any[]>([]);
  const [newQuestion, setNewQuestion] = useState('');
  const [newAnswer, setNewAnswer] = useState('');
  const [contactType, setContactType] = useState<'email' | 'sms'>('email');
  const [contactValue, setContactValue] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [verifyingContact, setVerifyingContact] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (user) {
      loadRecoveryMethods();
    }
  }, [user]);

  const loadRecoveryMethods = async () => {
    const [questionsRes, contactsRes, devicesRes] = await Promise.all([
      supabase.from('security_questions').select('*').eq('user_id', user?.id),
      supabase.from('emergency_contacts').select('*').eq('user_id', user?.id),
      supabase.from('trusted_devices').select('*').eq('user_id', user?.id).order('last_used', { ascending: false })
    ]);

    if (questionsRes.data) setSecurityQuestions(questionsRes.data);
    if (contactsRes.data) setEmergencyContacts(contactsRes.data);
    if (devicesRes.data) setTrustedDevices(devicesRes.data);
  };

  const addSecurityQuestion = async () => {
    if (!newQuestion || !newAnswer) {
      setMessage({ type: 'error', text: 'Please select a question and provide an answer' });
      return;
    }

    setLoading(true);
    const { error } = await supabase.from('security_questions').insert({
      user_id: user?.id,
      question: newQuestion,
      answer_hash: newAnswer.toLowerCase().trim()
    });

    if (error) {
      setMessage({ type: 'error', text: error.message });
    } else {
      setMessage({ type: 'success', text: 'Security question added successfully' });
      setNewQuestion('');
      setNewAnswer('');
      loadRecoveryMethods();
    }
    setLoading(false);
  };

  const deleteQuestion = async (id: string) => {
    await supabase.from('security_questions').delete().eq('id', id);
    loadRecoveryMethods();
  };

  const addEmergencyContact = async () => {
    if (!contactValue) {
      setMessage({ type: 'error', text: 'Please enter a contact value' });
      return;
    }

    setLoading(true);
    const { data, error } = await supabase.from('emergency_contacts').insert({
      user_id: user?.id,
      contact_type: contactType,
      contact_value: contactValue,
      verified: false
    }).select().single();

    if (error) {
      setMessage({ type: 'error', text: error.message });
    } else {
      setMessage({ type: 'success', text: 'Contact added. Please verify it.' });
      setContactValue('');
      setVerifyingContact(data.id);
      await sendVerificationCode(data.id);
      loadRecoveryMethods();
    }
    setLoading(false);
  };

  const sendVerificationCode = async (contactId: string) => {
    const { data } = await supabase.functions.invoke('account-recovery', {
      body: { action: 'send-verification-code', contactId }
    });
    if (data?.codeSent) {
      setMessage({ type: 'success', text: 'Verification code sent!' });
    }
  };

  const verifyContact = async (contactId: string) => {
    const { data } = await supabase.functions.invoke('account-recovery', {
      body: { action: 'verify-code', contactId, verificationCode }
    });

    if (data?.verified) {
      await supabase.from('emergency_contacts').update({ verified: true }).eq('id', contactId);
      setMessage({ type: 'success', text: 'Contact verified successfully!' });
      setVerifyingContact(null);
      setVerificationCode('');
      loadRecoveryMethods();
    } else {
      setMessage({ type: 'error', text: 'Invalid or expired code' });
    }
  };

  const deleteContact = async (id: string) => {
    await supabase.from('emergency_contacts').delete().eq('id', id);
    loadRecoveryMethods();
  };

  const deleteTrustedDevice = async (id: string) => {
    await supabase.from('trusted_devices').delete().eq('id', id);
    loadRecoveryMethods();
  };

  return (
    <div className="space-y-6">
      {message && (
        <Alert variant={message.type === 'error' ? 'destructive' : 'default'}>
          {message.type === 'success' ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Questions
          </CardTitle>
          <CardDescription>Set up security questions for account recovery</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Select Question</Label>
            <Select value={newQuestion} onValueChange={setNewQuestion}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a security question" />
              </SelectTrigger>
              <SelectContent>
                {COMMON_QUESTIONS.map((q) => (
                  <SelectItem key={q} value={q}>{q}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Your Answer</Label>
            <Input
              type="text"
              value={newAnswer}
              onChange={(e) => setNewAnswer(e.target.value)}
              placeholder="Enter your answer"
            />
          </div>
          <Button onClick={addSecurityQuestion} disabled={loading}>
            Add Security Question
          </Button>

          <div className="space-y-2 mt-4">
            {securityQuestions.map((q) => (
              <div key={q.id} className="flex items-center justify-between p-3 border rounded-lg">
                <span className="text-sm">{q.question}</span>
                <Button variant="ghost" size="sm" onClick={() => deleteQuestion(q.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Emergency Contacts
          </CardTitle>
          <CardDescription>Add backup email or phone for recovery</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Select value={contactType} onValueChange={(v: any) => setContactType(v)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="sms">SMS</SelectItem>
              </SelectContent>
            </Select>
            <Input
              type={contactType === 'email' ? 'email' : 'tel'}
              value={contactValue}
              onChange={(e) => setContactValue(e.target.value)}
              placeholder={contactType === 'email' ? 'backup@email.com' : '+1234567890'}
              className="flex-1"
            />
            <Button onClick={addEmergencyContact} disabled={loading}>Add</Button>
          </div>

          <div className="space-y-2">
            {emergencyContacts.map((contact) => (
              <div key={contact.id} className="p-3 border rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {contact.contact_type === 'sms' ? <Smartphone className="h-4 w-4" /> : <Mail className="h-4 w-4" />}
                    <span className="text-sm">{contact.contact_value}</span>
                    {contact.verified && <CheckCircle2 className="h-4 w-4 text-green-600" />}
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => deleteContact(contact.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                {!contact.verified && verifyingContact === contact.id && (
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      placeholder="Enter 6-digit code"
                      maxLength={6}
                    />
                    <Button size="sm" onClick={() => verifyContact(contact.id)}>Verify</Button>
                  </div>
                )}
                {!contact.verified && verifyingContact !== contact.id && (
                  <Button size="sm" variant="outline" onClick={() => { setVerifyingContact(contact.id); sendVerificationCode(contact.id); }}>
                    Send Code
                  </Button>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Trusted Devices ({trustedDevices.length})
          </CardTitle>
          <CardDescription>Devices you've marked as trusted for recovery</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {trustedDevices.map((device) => (
              <div key={device.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium text-sm">{device.device_name}</p>
                  <p className="text-xs text-muted-foreground">Last used: {new Date(device.last_used).toLocaleDateString()}</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => deleteTrustedDevice(device.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
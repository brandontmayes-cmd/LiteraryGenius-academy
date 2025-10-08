import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { UserPlus, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function ParentInvitationSystem() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    studentEmail: '',
    parentName: '',
    message: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Find student by email
      const { data: profiles, error: profileError } = await supabase
        .from('user_profiles')
        .select('user_id, email, full_name')
        .eq('email', formData.studentEmail)
        .eq('role', 'student')
        .single();

      if (profileError || !profiles) {
        throw new Error('Student not found with this email');
      }

      // Get parent profile
      const { data: parentProfile } = await supabase
        .from('user_profiles')
        .select('email, full_name')
        .eq('user_id', user?.id)
        .single();

      // Send access request
      const { error } = await supabase.functions.invoke('parent-portal-manager', {
        body: {
          action: 'request_access',
          parentId: user?.id,
          studentId: profiles.user_id,
          parentEmail: parentProfile?.email || user?.email,
          parentName: formData.parentName || parentProfile?.full_name,
          studentEmail: formData.studentEmail,
          message: formData.message
        }
      });

      if (error) throw error;

      toast({
        title: 'Request Sent',
        description: 'Access request sent to student. Awaiting approval.'
      });

      setFormData({ studentEmail: '', parentName: '', message: '' });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="h-5 w-5" />
          Request Student Access
        </CardTitle>
        <CardDescription>
          Send an access request to monitor your student's academic progress
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="studentEmail">Student Email Address</Label>
            <Input
              id="studentEmail"
              type="email"
              placeholder="student@school.edu"
              value={formData.studentEmail}
              onChange={(e) => setFormData({ ...formData, studentEmail: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="parentName">Your Name</Label>
            <Input
              id="parentName"
              placeholder="John Doe"
              value={formData.parentName}
              onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message (Optional)</Label>
            <Textarea
              id="message"
              placeholder="Hi, I'm your parent and would like to monitor your progress..."
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              rows={3}
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            <Send className="h-4 w-4 mr-2" />
            {loading ? 'Sending...' : 'Send Access Request'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

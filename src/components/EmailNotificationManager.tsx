import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Mail, Clock, CheckCircle, XCircle, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface EmailNotification {
  id: string;
  email: string;
  subject: string;
  template_name: string;
  status: 'pending' | 'scheduled' | 'sent' | 'failed';
  scheduled_for?: string;
  sent_at?: string;
  created_at: string;
}

export function EmailNotificationManager() {
  const [emails, setEmails] = useState<EmailNotification[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'sent'>('all');
  const { toast } = useToast();

  useEffect(() => {
    loadEmails();
    const subscription = supabase
      .channel('email_notifications')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'email_notifications' },
        () => loadEmails()
      )
      .subscribe();

    return () => { subscription.unsubscribe(); };
  }, [filter]);

  async function loadEmails() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    let query = supabase
      .from('email_notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50);

    if (filter !== 'all') {
      query = query.eq('status', filter === 'sent' ? 'sent' : 'pending');
    }

    const { data } = await query;
    setEmails(data || []);
  }

  async function resendEmail(emailId: string) {
    const { error } = await supabase
      .from('email_notifications')
      .update({ status: 'pending' })
      .eq('id', emailId);

    if (error) {
      toast({ title: 'Failed to resend email', variant: 'destructive' });
    } else {
      toast({ title: 'Email queued for resending' });
      loadEmails();
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed': return <XCircle className="h-4 w-4 text-red-600" />;
      case 'scheduled': return <Clock className="h-4 w-4 text-blue-600" />;
      default: return <Mail className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Mail className="h-6 w-6 text-[#1e3a5f]" />
          <h2 className="text-2xl font-bold text-[#1e3a5f]">Email Notifications</h2>
        </div>
        <div className="flex gap-2">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            onClick={() => setFilter('all')}
            size="sm"
          >
            All
          </Button>
          <Button
            variant={filter === 'pending' ? 'default' : 'outline'}
            onClick={() => setFilter('pending')}
            size="sm"
          >
            Pending
          </Button>
          <Button
            variant={filter === 'sent' ? 'default' : 'outline'}
            onClick={() => setFilter('sent')}
            size="sm"
          >
            Sent
          </Button>
        </div>
      </div>

      <ScrollArea className="h-[500px]">
        <div className="space-y-3">
          {emails.map((email) => (
            <Card key={email.id} className="p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {getStatusIcon(email.status)}
                    <Badge className={getStatusColor(email.status)}>
                      {email.status}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {email.template_name.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <p className="font-medium text-[#1e3a5f] mb-1">{email.subject}</p>
                  <p className="text-sm text-muted-foreground">To: {email.email}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {email.sent_at 
                      ? `Sent: ${new Date(email.sent_at).toLocaleString()}`
                      : email.scheduled_for
                      ? `Scheduled: ${new Date(email.scheduled_for).toLocaleString()}`
                      : `Created: ${new Date(email.created_at).toLocaleString()}`
                    }
                  </p>
                </div>
                {email.status === 'failed' && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => resendEmail(email.id)}
                  >
                    <Send className="h-4 w-4 mr-1" />
                    Resend
                  </Button>
                )}
              </div>
            </Card>
          ))}
          {emails.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Mail className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No email notifications found</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </Card>
  );
}

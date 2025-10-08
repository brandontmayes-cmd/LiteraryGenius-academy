import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { UserCheck, UserX, Clock, Shield, Mail } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AccessRequest {
  id: string;
  parent_email: string;
  parent_name: string;
  message: string;
  status: string;
  requested_at: string;
  parent_id: string;
}

export default function ParentAccessRequestManager() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [requests, setRequests] = useState<AccessRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadRequests();
    }
  }, [user]);

  const loadRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('parent_access_requests')
        .select('*')
        .eq('student_id', user?.id)
        .order('requested_at', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (request: AccessRequest) => {
    try {
      const { error } = await supabase.functions.invoke('parent-portal-manager', {
        body: {
          action: 'approve_request',
          requestId: request.id,
          parentId: request.parent_id,
          studentId: user?.id,
          accessLevel: 'full'
        }
      });

      if (error) throw error;

      toast({ title: 'Success', description: 'Parent access approved' });
      loadRequests();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const handleDeny = async (requestId: string) => {
    try {
      const { error } = await supabase.functions.invoke('parent-portal-manager', {
        body: { action: 'deny_request', requestId }
      });

      if (error) throw error;

      toast({ title: 'Success', description: 'Request denied' });
      loadRequests();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading requests...</div>;
  }

  const pendingRequests = requests.filter(r => r.status === 'pending');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Parent Access Requests</h2>
        <Badge variant="secondary">{pendingRequests.length} Pending</Badge>
      </div>

      {pendingRequests.length === 0 && (
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>No pending parent access requests</AlertDescription>
        </Alert>
      )}

      <div className="space-y-4">
        {requests.map((request) => (
          <Card key={request.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg">{request.parent_name}</CardTitle>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    {request.parent_email}
                  </div>
                </div>
                <Badge variant={
                  request.status === 'pending' ? 'default' :
                  request.status === 'approved' ? 'success' : 'destructive'
                }>
                  {request.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {request.message && (
                <p className="text-sm text-muted-foreground">{request.message}</p>
              )}
              
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                Requested {new Date(request.requested_at).toLocaleDateString()}
              </div>

              {request.status === 'pending' && (
                <div className="flex gap-2">
                  <Button onClick={() => handleApprove(request)} className="flex-1">
                    <UserCheck className="h-4 w-4 mr-2" />
                    Approve
                  </Button>
                  <Button 
                    onClick={() => handleDeny(request.id)} 
                    variant="outline" 
                    className="flex-1"
                  >
                    <UserX className="h-4 w-4 mr-2" />
                    Deny
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Laptop, Smartphone, Tablet, Monitor, AlertTriangle, MapPin, Clock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface Session {
  id: string;
  session_id: string;
  device_type: string;
  device_name: string;
  browser: string;
  os: string;
  ip_address: string;
  location: string;
  last_activity: string;
  is_current: boolean;
  created_at: string;
}

export function SessionManagement() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [revoking, setRevoking] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchSessions();
    }
  }, [user]);

  const fetchSessions = async () => {
    try {
      const { data, error } = await supabase
        .from('user_sessions')
        .select('*')
        .eq('user_id', user?.id)
        .order('last_activity', { ascending: false });

      if (error) throw error;
      setSessions(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const revokeSession = async (sessionId: string) => {
    setRevoking(sessionId);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const { error } = await supabase.functions.invoke('session-manager', {
        body: { action: 'revoke', sessionId },
        headers: { Authorization: `Bearer ${session?.access_token}` }
      });

      if (error) throw error;
      await fetchSessions();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setRevoking(null);
    }
  };

  const revokeAllSessions = async () => {
    setRevoking('all');
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const { error } = await supabase.functions.invoke('session-manager', {
        body: { action: 'revoke_all' },
        headers: { Authorization: `Bearer ${session?.access_token}` }
      });

      if (error) throw error;
      await fetchSessions();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setRevoking(null);
    }
  };

  const getDeviceIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'mobile': return <Smartphone className="h-5 w-5" />;
      case 'tablet': return <Tablet className="h-5 w-5" />;
      case 'desktop': return <Monitor className="h-5 w-5" />;
      default: return <Laptop className="h-5 w-5" />;
    }
  };

  const isSuspicious = (session: Session) => {
    const hoursSinceCreated = (Date.now() - new Date(session.created_at).getTime()) / (1000 * 60 * 60);
    return hoursSinceCreated < 1 && !session.is_current;
  };

  if (loading) {
    return <div className="text-center py-8">Loading sessions...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Active Sessions</h2>
          <p className="text-muted-foreground">Manage your account security across devices</p>
        </div>
        {sessions.length > 1 && (
          <Button 
            variant="destructive" 
            onClick={revokeAllSessions}
            disabled={revoking === 'all'}
          >
            Sign Out All Devices
          </Button>
        )}
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4">
        {sessions.map((session) => (
          <Card key={session.id} className={session.is_current ? 'border-primary' : ''}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {getDeviceIcon(session.device_type)}
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      {session.device_name || session.browser}
                      {session.is_current && (
                        <Badge variant="default">Current Session</Badge>
                      )}
                      {isSuspicious(session) && (
                        <Badge variant="destructive" className="flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          New
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription>
                      {session.browser} on {session.os}
                    </CardDescription>
                  </div>
                </div>
                {!session.is_current && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => revokeSession(session.session_id)}
                    disabled={revoking === session.session_id}
                  >
                    {revoking === session.session_id ? 'Revoking...' : 'Revoke'}
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{session.location || 'Unknown location'}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Monitor className="h-4 w-4" />
                  <span>IP: {session.ip_address || 'Unknown'}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>Last active: {new Date(session.last_activity).toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {sessions.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No active sessions found
          </CardContent>
        </Card>
      )}
    </div>
  );
}

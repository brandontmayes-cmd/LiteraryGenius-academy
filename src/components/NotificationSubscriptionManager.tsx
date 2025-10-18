import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Bell, Check, X, Smartphone } from 'lucide-react';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { supabase } from '@/lib/supabase';

export const NotificationSubscriptionManager: React.FC = () => {
  const { permission, subscription, requestPermission, subscribeToPush, sendTestNotification } = usePushNotifications();
  const [preferences, setPreferences] = useState({
    assignments: true,
    grades: true,
    messages: true,
    announcements: true,
    reminders: true
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();
      if (data) setPreferences(data.preferences || preferences);
    }
  };

  const savePreferences = async () => {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase
        .from('notification_preferences')
        .upsert({
          user_id: user.id,
          preferences,
          updated_at: new Date().toISOString()
        });
    }
    setSaving(false);
  };

  const getStatusBadge = () => {
    if (permission === 'granted') return <Badge className="bg-green-500"><Check className="h-3 w-3 mr-1" />Active</Badge>;
    if (permission === 'denied') return <Badge variant="destructive"><X className="h-3 w-3 mr-1" />Blocked</Badge>;
    return <Badge variant="secondary">Not Enabled</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5 text-[#1e3a5f]" />
            Push Notification Subscription
          </CardTitle>
          {getStatusBadge()}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {permission !== 'granted' && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-900 mb-3">Enable push notifications to receive real-time updates</p>
            <Button onClick={requestPermission} className="bg-[#1e3a5f] hover:bg-[#2a4f7a]">
              <Bell className="h-4 w-4 mr-2" />
              Enable Push Notifications
            </Button>
          </div>
        )}

        {permission === 'granted' && (
          <>
            <div className="space-y-3">
              <h4 className="font-medium">Notification Types</h4>
              {Object.entries(preferences).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-sm capitalize">{key}</span>
                  <Switch checked={value} onCheckedChange={(v) => setPreferences(p => ({ ...p, [key]: v }))} />
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Button onClick={savePreferences} disabled={saving} className="flex-1 bg-[#1e3a5f] hover:bg-[#2a4f7a]">
                {saving ? 'Saving...' : 'Save Preferences'}
              </Button>
              <Button onClick={sendTestNotification} variant="outline">Test</Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

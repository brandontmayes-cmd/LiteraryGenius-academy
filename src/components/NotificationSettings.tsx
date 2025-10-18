import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Bell, Mail, Smartphone, Settings } from 'lucide-react';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

export const NotificationSettings: React.FC = () => {
  const { permission, requestPermission, sendTestNotification } = usePushNotifications();
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    pushNotifications: permission === 'granted',
    emailNotifications: true,
    assignmentReminders: true,
    gradeUpdates: true,
    parentUpdates: true,
    systemAlerts: true
  });

  useEffect(() => {
    loadPreferences();
  }, []);

  async function loadPreferences() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (data) {
      setSettings({
        pushNotifications: data.push_notifications ?? true,
        emailNotifications: data.email_notifications ?? true,
        assignmentReminders: data.assignment_reminders ?? true,
        gradeUpdates: data.grade_updates ?? true,
        parentUpdates: data.parent_updates ?? true,
        systemAlerts: data.system_alerts ?? true
      });
    }
  }

  const handlePushToggle = async (enabled: boolean) => {
    if (enabled && permission !== 'granted') {
      const result = await requestPermission();
      setSettings(prev => ({ ...prev, pushNotifications: result === 'granted' }));
      await savePreferences({ pushNotifications: result === 'granted' });
    } else {
      setSettings(prev => ({ ...prev, pushNotifications: enabled }));
      await savePreferences({ pushNotifications: enabled });
    }
  };

  const handleSettingChange = async (key: keyof typeof settings, value: boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    await savePreferences({ [key]: value });
  };

  async function savePreferences(updates: Partial<typeof settings>) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const dbUpdates = {
      user_id: user.id,
      push_notifications: settings.pushNotifications,
      email_notifications: settings.emailNotifications,
      assignment_reminders: settings.assignmentReminders,
      grade_updates: settings.gradeUpdates,
      parent_updates: settings.parentUpdates,
      system_alerts: settings.systemAlerts,
      ...Object.fromEntries(
        Object.entries(updates).map(([k, v]) => [k.replace(/([A-Z])/g, '_$1').toLowerCase(), v])
      )
    };

    const { error } = await supabase
      .from('notification_preferences')
      .upsert(dbUpdates);

    if (error) {
      toast({ title: 'Failed to save preferences', variant: 'destructive' });
    } else {
      toast({ title: 'Preferences saved successfully' });
    }
  }


  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Notification Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Push Notifications */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Smartphone className="h-5 w-5 text-blue-600" />
              <div>
                <h3 className="font-medium">Push Notifications</h3>
                <p className="text-sm text-gray-600">
                  Receive instant notifications on your device
                </p>
              </div>
            </div>
            <Switch
              checked={settings.pushNotifications}
              onCheckedChange={handlePushToggle}
            />
          </div>

          {/* Email Notifications */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-green-600" />
              <div>
                <h3 className="font-medium">Email Notifications</h3>
                <p className="text-sm text-gray-600">
                  Receive updates via email
                </p>
              </div>
            </div>
            <Switch
              checked={settings.emailNotifications}
              onCheckedChange={(value) => handleSettingChange('emailNotifications', value)}
            />
          </div>

          {/* Notification Types */}
          <div className="border-t pt-4 space-y-4">
            <h4 className="font-medium text-gray-900">Notification Types</h4>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Assignment Reminders</span>
                <Switch
                  checked={settings.assignmentReminders}
                  onCheckedChange={(value) => handleSettingChange('assignmentReminders', value)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Grade Updates</span>
                <Switch
                  checked={settings.gradeUpdates}
                  onCheckedChange={(value) => handleSettingChange('gradeUpdates', value)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Parent Updates</span>
                <Switch
                  checked={settings.parentUpdates}
                  onCheckedChange={(value) => handleSettingChange('parentUpdates', value)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">System Alerts</span>
                <Switch
                  checked={settings.systemAlerts}
                  onCheckedChange={(value) => handleSettingChange('systemAlerts', value)}
                />
              </div>
            </div>
          </div>

          {/* Test Notification */}
          {permission === 'granted' && (
            <div className="border-t pt-4">
              <Button 
                onClick={sendTestNotification}
                variant="outline"
                className="w-full"
              >
                <Bell className="h-4 w-4 mr-2" />
                Send Test Notification
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
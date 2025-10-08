import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Bell, Mail, Smartphone, Settings } from 'lucide-react';
import { usePushNotifications } from '@/hooks/usePushNotifications';

export const NotificationSettings: React.FC = () => {
  const { permission, requestPermission, sendTestNotification } = usePushNotifications();
  const [settings, setSettings] = useState({
    pushNotifications: permission === 'granted',
    emailNotifications: true,
    assignmentReminders: true,
    gradeUpdates: true,
    parentUpdates: true,
    systemAlerts: true
  });

  const handlePushToggle = async (enabled: boolean) => {
    if (enabled && permission !== 'granted') {
      const result = await requestPermission();
      setSettings(prev => ({ ...prev, pushNotifications: result === 'granted' }));
    } else {
      setSettings(prev => ({ ...prev, pushNotifications: enabled }));
    }
  };

  const handleSettingChange = (key: keyof typeof settings, value: boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

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
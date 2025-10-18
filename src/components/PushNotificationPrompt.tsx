import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell, X } from 'lucide-react';
import { usePushNotifications } from '@/hooks/usePushNotifications';

interface PushNotificationPromptProps {
  userRole: 'student' | 'teacher' | 'parent';
}

export const PushNotificationPrompt: React.FC<PushNotificationPromptProps> = ({ userRole }) => {
  const { permission, requestPermission } = usePushNotifications();
  const [dismissed, setDismissed] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const isDismissed = localStorage.getItem('notification-prompt-dismissed');
    if (isDismissed) setDismissed(true);
  }, []);

  const handleEnable = async () => {
    setLoading(true);
    await requestPermission();
    setLoading(false);
    setDismissed(true);
  };

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem('notification-prompt-dismissed', 'true');
  };

  if (permission === 'granted' || dismissed || permission === 'denied') return null;

  const messages = {
    student: 'Get instant notifications for new assignments, grades, and teacher feedback!',
    teacher: 'Stay updated with assignment submissions, student questions, and parent messages!',
    parent: 'Receive real-time updates about your child\'s progress, grades, and school announcements!'
  };

  return (
    <Card className="bg-gradient-to-r from-[#1e3a5f] to-[#2a4f7a] text-white p-6 mb-6 relative">
      <button onClick={handleDismiss} className="absolute top-4 right-4 text-white/80 hover:text-white">
        <X className="h-5 w-5" />
      </button>
      <div className="flex items-start gap-4">
        <div className="bg-[#d4af37] p-3 rounded-full">
          <Bell className="h-6 w-6 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-bold mb-2">Enable Push Notifications</h3>
          <p className="text-white/90 mb-4">{messages[userRole]}</p>
          <Button onClick={handleEnable} disabled={loading} className="bg-[#d4af37] hover:bg-[#c49f2f] text-white">
            {loading ? 'Enabling...' : 'Enable Notifications'}
          </Button>
        </div>
      </div>
    </Card>
  );
};

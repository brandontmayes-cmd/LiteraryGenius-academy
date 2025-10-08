import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export const usePushNotifications = () => {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async () => {
    if ('Notification' in window) {
      const result = await Notification.requestPermission();
      setPermission(result);
      
      if (result === 'granted') {
        await subscribeToPush();
      }
      
      return result;
    }
    return 'denied';
  };

  const subscribeToPush = async () => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      try {
        const registration = await navigator.serviceWorker.ready;
        const sub = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(
            'BEl62iUYgUivxIkv69yViEuiBIa40HI80NMu11aKiLOAjhFrk0JxbVRAWVTOZBoySwVdyGDgR1gSG8SHGOcXfa8'
          )
        });
        
        setSubscription(sub);
        
        // Store subscription in database
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase
            .from('push_subscriptions')
            .upsert({
              user_id: user.id,
              subscription: JSON.stringify(sub),
              created_at: new Date().toISOString()
            });
        }
        
        return sub;
      } catch (error) {
        console.error('Error subscribing to push notifications:', error);
      }
    }
  };

  const sendTestNotification = async () => {
    if (permission === 'granted') {
      new Notification('Literary Genius Academy', {
        body: 'Test notification from Literary Genius!',
        icon: '/icon-192.png',
        badge: '/icon-192.png'
      });
    }
  };

  return {
    permission,
    subscription,
    requestPermission,
    subscribeToPush,
    sendTestNotification
  };
};

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
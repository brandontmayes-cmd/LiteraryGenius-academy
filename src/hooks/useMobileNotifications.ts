import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface MobileNotification {
  id: string;
  title: string;
  body: string;
  type: 'assignment' | 'grade' | 'announcement' | 'reminder';
  data?: any;
  timestamp: string;
  read: boolean;
}

export const useMobileNotifications = (userId: string) => {
  const [notifications, setNotifications] = useState<MobileNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    checkNotificationPermission();
    loadNotifications();
    subscribeToNotifications();
  }, [userId]);

  const checkNotificationPermission = async () => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const result = await Notification.requestPermission();
      setPermission(result);
      
      if (result === 'granted') {
        await registerServiceWorker();
      }
      
      return result;
    }
    return 'denied';
  };

  const registerServiceWorker = async () => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        
        // Subscribe to push notifications
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(
            'BEl62iUYgUivxIkv69yViEuiBIa40HI6YUfXDiYXQBdPQRBpQC7VPc6-Ym5Gg6Oj-kfJJGDvqxHPQqyVKHCvfYI'
          )
        });

        // Save subscription to database
        await supabase
          .from('push_subscriptions')
          .upsert({
            user_id: userId,
            subscription: JSON.stringify(subscription),
            created_at: new Date().toISOString()
          });

      } catch (error) {
        console.error('Service worker registration failed:', error);
      }
    }
  };

  const urlBase64ToUint8Array = (base64String: string) => {
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
  };

  const loadNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      if (data) {
        const formattedNotifications: MobileNotification[] = data.map(notification => ({
          id: notification.id,
          title: notification.title,
          body: notification.message,
          type: notification.type,
          data: notification.data,
          timestamp: notification.created_at,
          read: notification.read
        }));

        setNotifications(formattedNotifications);
        setUnreadCount(formattedNotifications.filter(n => !n.read).length);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const subscribeToNotifications = () => {
    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          const newNotification: MobileNotification = {
            id: payload.new.id,
            title: payload.new.title,
            body: payload.new.message,
            type: payload.new.type,
            data: payload.new.data,
            timestamp: payload.new.created_at,
            read: false
          };

          setNotifications(prev => [newNotification, ...prev]);
          setUnreadCount(prev => prev + 1);

          // Show browser notification if permission granted
          if (permission === 'granted') {
            showBrowserNotification(newNotification);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const showBrowserNotification = (notification: MobileNotification) => {
    if ('Notification' in window && permission === 'granted') {
      const browserNotification = new Notification(notification.title, {
        body: notification.body,
        icon: '/icon-192x192.png',
        badge: '/icon-192x192.png',
        tag: notification.id,
        data: notification.data,
        requireInteraction: notification.type === 'assignment'
      });

      browserNotification.onclick = () => {
        window.focus();
        browserNotification.close();
        // Handle notification click based on type
        handleNotificationClick(notification);
      };

      // Auto-close after 5 seconds for non-critical notifications
      if (notification.type !== 'assignment') {
        setTimeout(() => browserNotification.close(), 5000);
      }
    }
  };

  const handleNotificationClick = (notification: MobileNotification) => {
    // Mark as read
    markAsRead(notification.id);

    // Navigate based on notification type
    switch (notification.type) {
      case 'assignment':
        // Navigate to assignment
        window.location.href = `/assignments/${notification.data?.assignmentId}`;
        break;
      case 'grade':
        // Navigate to grades
        window.location.href = '/grades';
        break;
      case 'announcement':
        // Navigate to announcements
        window.location.href = '/announcements';
        break;
      default:
        // Navigate to dashboard
        window.location.href = '/dashboard';
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);

      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', userId)
        .eq('read', false);

      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const sendTestNotification = async () => {
    if (permission === 'granted') {
      const testNotification: MobileNotification = {
        id: 'test-' + Date.now(),
        title: 'Test Notification',
        body: 'This is a test notification from Literary Genius Academy',
        type: 'announcement',
        timestamp: new Date().toISOString(),
        read: false
      };
      
      showBrowserNotification(testNotification);
    }
  };

  return {
    notifications,
    unreadCount,
    permission,
    requestNotificationPermission,
    markAsRead,
    markAllAsRead,
    sendTestNotification,
    loadNotifications
  };
};
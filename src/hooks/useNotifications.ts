import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export interface Notification {
  id: string;
  recipient_id: string;
  sender_id?: string;
  type: 'assignment_submitted' | 'message_received' | 'grade_updated' | 'achievement_earned' | 'parent_request';
  title: string;
  message: string;
  data: Record<string, any>;
  read: boolean;
  created_at: string;
  updated_at: string;
}

export interface NotificationPreferences {
  id: string;
  user_id: string;
  email_enabled: boolean;
  push_enabled: boolean;
  assignment_submissions: boolean;
  parent_messages: boolean;
  grade_updates: boolean;
  achievements: boolean;
}

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user?.user) return;

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('recipient_id', user.user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      setNotifications(data || []);
      setUnreadCount(data?.filter(n => !n.read).length || 0);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch preferences
  const fetchPreferences = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user?.user) return;

      let { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', user.user.id)
        .single();

      if (error && error.code === 'PGRST116') {
        // Create default preferences if none exist
        const { data: newPrefs, error: insertError } = await supabase
          .from('notification_preferences')
          .insert({
            user_id: user.user.id,
            email_enabled: true,
            push_enabled: true,
            assignment_submissions: true,
            parent_messages: true,
            grade_updates: true,
            achievements: true
          })
          .select()
          .single();

        if (insertError) throw insertError;
        data = newPrefs;
      } else if (error) {
        throw error;
      }

      setPreferences(data);
    } catch (error) {
      console.error('Error fetching preferences:', error);
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);

      if (error) throw error;

      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user?.user) return;

      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('recipient_id', user.user.id)
        .eq('read', false);

      if (error) throw error;

      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  // Send notification
  const sendNotification = async (
    recipientId: string,
    type: Notification['type'],
    title: string,
    message: string,
    data: Record<string, any> = {},
    sendEmail: boolean = false
  ) => {
    try {
      const { data: user } = await supabase.auth.getUser();
      
      const { data, error } = await supabase.functions.invoke('send-notification', {
        body: {
          recipientId,
          senderId: user?.user?.id,
          type,
          title,
          message,
          data,
          sendEmail
        }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error sending notification:', error);
      throw error;
    }
  };

  // Update preferences
  const updatePreferences = async (updates: Partial<NotificationPreferences>) => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user?.user || !preferences) return;

      const { data, error } = await supabase
        .from('notification_preferences')
        .update(updates)
        .eq('user_id', user.user.id)
        .select()
        .single();

      if (error) throw error;
      setPreferences(data);
    } catch (error) {
      console.error('Error updating preferences:', error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    fetchPreferences();

    // Set up real-time subscription
    const { data: user } = supabase.auth.getUser();
    user.then(({ data: userData }) => {
      if (userData?.user) {
        const subscription = supabase
          .channel('notifications')
          .on('postgres_changes', 
            { 
              event: 'INSERT', 
              schema: 'public', 
              table: 'notifications',
              filter: `recipient_id=eq.${userData.user.id}`
            }, 
            (payload) => {
              setNotifications(prev => [payload.new as Notification, ...prev]);
              setUnreadCount(prev => prev + 1);
            }
          )
          .subscribe();

        return () => {
          subscription.unsubscribe();
        };
      }
    });
  }, []);

  return {
    notifications,
    preferences,
    loading,
    unreadCount,
    markAsRead,
    markAllAsRead,
    sendNotification,
    updatePreferences,
    refetch: fetchNotifications
  };
};
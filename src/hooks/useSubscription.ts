import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export interface Subscription {
  id: string;
  status: 'trial' | 'active' | 'past_due' | 'cancelled' | 'expired';
  planType: 'free_trial' | 'monthly' | 'yearly';
  trialEndDate?: string;
  subscriptionEndDate?: string;
  daysRemaining?: number;
  isActive: boolean;
}

export function useSubscription() {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchSubscription();
    }
  }, [user]);

  const fetchSubscription = async () => {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error) throw error;

      if (data) {
        const now = new Date();
        const endDate = data.status === 'trial' 
          ? new Date(data.trial_end_date)
          : new Date(data.subscription_end_date || '');
        
        const daysRemaining = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        
        const isActive = data.status === 'trial' 
          ? endDate > now
          : data.status === 'active' && (!data.subscription_end_date || endDate > now);

        setSubscription({
          id: data.id,
          status: data.status,
          planType: data.plan_type,
          trialEndDate: data.trial_end_date,
          subscriptionEndDate: data.subscription_end_date,
          daysRemaining: daysRemaining > 0 ? daysRemaining : 0,
          isActive,
        });
      }
    } catch (error) {
      console.error('Error fetching subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  return { subscription, loading, refetch: fetchSubscription };
}

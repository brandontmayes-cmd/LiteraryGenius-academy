import React, { useState } from 'react';
import { CreditCard, Calendar, AlertCircle, Loader2, ExternalLink, Settings } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from './ui/alert-dialog';

interface SubscriptionManagementProps {
  subscription?: {
    id: string;
    plan: string;
    status: string;
    currentPeriodEnd: string;
    cancelAtPeriodEnd: boolean;
  };
  userId?: string;
  stripeCustomerId?: string;
}

export function SubscriptionManagement({ subscription, userId, stripeCustomerId }: SubscriptionManagementProps) {
  const [loading, setLoading] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);

  const handleCancelSubscription = async () => {
    if (!subscription) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('stripe-subscription-manager', {
        body: { 
          action: 'cancel-subscription', 
          subscriptionId: subscription.id,
          userId
        }
      });

      if (error) throw error;
      toast.success('Subscription cancelled successfully');
      setTimeout(() => window.location.reload(), 1500);
    } catch (error: any) {
      console.error('Cancel error:', error);
      toast.error(error.message || 'Failed to cancel subscription');
    } finally {
      setLoading(false);
    }
  };

  const handleManageBilling = async () => {
    if (!stripeCustomerId) {
      toast.error('No customer ID found');
      return;
    }

    setPortalLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('stripe-subscription-manager', {
        body: {
          action: 'create-portal-session',
          customerId: stripeCustomerId
        }
      });

      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error: any) {
      console.error('Portal error:', error);
      toast.error(error.message || 'Failed to open billing portal');
    } finally {
      setPortalLoading(false);
    }
  };

  if (!subscription) {
    return (
      <Card className="p-6">
        <div className="text-center">
          <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Active Subscription</h3>
          <p className="text-gray-600 mb-4">Subscribe to unlock all premium features</p>
          <Button onClick={() => window.location.href = '/#pricing'}>
            View Plans
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Subscription Details</h3>
        {stripeCustomerId && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleManageBilling}
            disabled={portalLoading}
          >
            {portalLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Settings className="w-4 h-4 mr-2" />
                Manage Billing
              </>
            )}
          </Button>
        )}
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Plan</span>
          <span className="font-semibold capitalize">{subscription.plan}</span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Status</span>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            subscription.status === 'active' 
              ? 'bg-green-100 text-green-800' 
              : subscription.status === 'past_due'
              ? 'bg-red-100 text-red-800'
              : subscription.status === 'trialing'
              ? 'bg-blue-100 text-blue-800'
              : 'bg-gray-100 text-gray-800'
          }`}>
            {subscription.status}
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-gray-600">
            {subscription.cancelAtPeriodEnd ? 'Ends on' : 'Renews on'}
          </span>
          <span className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
          </span>
        </div>

        {subscription.cancelAtPeriodEnd && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-orange-800">
              Your subscription will be cancelled at the end of the current billing period.
            </p>
          </div>
        )}

        {subscription.status === 'past_due' && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-red-800 mb-2">
                Your payment failed. Please update your payment method to continue your subscription.
              </p>
              <Button
                size="sm"
                variant="outline"
                onClick={handleManageBilling}
                disabled={portalLoading}
              >
                Update Payment Method
              </Button>
            </div>
          </div>
        )}

        <div className="pt-4 border-t space-y-2">
          {!subscription.cancelAtPeriodEnd && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="w-full" disabled={loading}>
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Cancel Subscription'}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Cancel Subscription?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to cancel your subscription? You'll lose access to premium features at the end of your billing period on {new Date(subscription.currentPeriodEnd).toLocaleDateString()}.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Keep Subscription</AlertDialogCancel>
                  <AlertDialogAction onClick={handleCancelSubscription} className="bg-red-600 hover:bg-red-700">
                    Yes, Cancel
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>
    </Card>
  );
}

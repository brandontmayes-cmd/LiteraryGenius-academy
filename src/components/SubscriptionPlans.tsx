import React, { useState } from 'react';
import { Check, Loader2, Clock } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

const plans = [
  {
    name: 'Basic',
    price: 19,
    interval: 'month',
    priceId: 'price_1SGRGlIvvCopH055Na9ZbWRq',
    trial: '7-day free trial',
    features: ['Core learning tools', '5 assignments/month', 'Progress tracking', 'Email support', 'Mobile access']
  },
  {
    name: 'Premium',
    price: 29,
    interval: 'month',
    priceId: 'price_1SGRHlIvvCopH055HzakgTuq',
    popular: true,
    trial: '7-day free trial',
    features: ['Everything in Basic', 'Unlimited AI tutoring', 'Unlimited assignments', 'Advanced analytics', 'Priority support']
  },
  {
    name: 'Enterprise',
    price: 49,
    interval: 'month',
    priceId: 'price_1SGRIdIvvCopH055OJ3n5AfH',
    trial: '7-day free trial',
    features: ['Everything in Premium', 'Admin dashboard', 'Custom curriculum', 'Dedicated support', 'API access']
  }
];

export function SubscriptionPlans() {
  const [loading, setLoading] = useState<string | null>(null);

  const handleSubscribe = async (priceId: string) => {
    setLoading(priceId);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please sign in to subscribe');
        return;
      }

      const { data, error } = await supabase.functions.invoke('stripe-subscription-manager', {
        body: { action: 'create-checkout-session', priceId, userId: user.id, email: user.email }
      });

      if (error) throw error;
      if (data?.url) window.location.href = data.url;
    } catch (error) {
      toast.error('Failed to start checkout');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Choose Your Plan</h2>
          <p className="text-gray-600 mb-4">Start with a 7-day free trial, no credit card required</p>
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full">
            <Clock className="w-4 h-4" />
            <span className="font-medium">7 days free, then ${plans[0].price}/month</span>
          </div>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <Card key={plan.priceId} className={`p-8 relative ${plan.popular ? 'border-blue-500 border-2' : ''}`}>
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-500 text-white px-4 py-1 rounded-full text-sm">
                  Most Popular
                </div>
              )}
              
              <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
              <div className="mb-2">
                <span className="text-4xl font-bold">${plan.price}</span>
                <span className="text-gray-600">/{plan.interval}</span>
              </div>
              <p className="text-sm text-green-600 mb-6">{plan.trial}</p>
              
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <Button 
                onClick={() => handleSubscribe(plan.priceId)}
                disabled={loading === plan.priceId}
                className="w-full"
              >
                {loading === plan.priceId ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing...</>
                ) : 'Start Free Trial'}
              </Button>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

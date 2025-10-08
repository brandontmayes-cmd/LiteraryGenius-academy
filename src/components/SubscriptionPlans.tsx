import React, { useState } from 'react';
import { Check, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

const plans = [
  {
    name: 'Basic',
    price: 19,
    interval: 'month',
    priceId: 'price_1SFNsgIvvCopH055YMXO77K0', // LiteraryGenius Basic - $19/month
    features: [
      'Core learning tools',
      '5 assignments per month',
      'Basic progress tracking',
      'Email support',
      'Mobile app access'
    ]
  },
  {
    name: 'Premium',
    price: 29,
    interval: 'month',
    priceId: 'price_1SFNvwIvvCopH055m8u5LrQg', // LiteraryGenius Premium - $29/month
    popular: true,
    features: [
      'Everything in Basic',
      'Unlimited AI tutoring',
      'Unlimited assignments',
      'Advanced analytics',
      'Priority support',
      'Custom learning paths'
    ]
  },
  {
    name: 'Enterprise',
    price: 49,
    interval: 'month',
    priceId: 'price_1SFNxZIvvCopH055Kem1Y1OV', // LiteraryGenius Enterprise - $49/month
    features: [
      'Everything in Premium',
      'Admin dashboard',
      'Custom curriculum',
      'Dedicated support',
      'API access',
      'White-label options'
    ]
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
        body: { action: 'create-checkout', priceId, userId: user.id }
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
          <p className="text-gray-600">Select the perfect plan for your learning journey</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">

          {plans.map((plan) => (
            <Card key={plan.priceId} className={`p-8 relative ${plan.popular ? 'border-blue-500 border-2' : ''}`}>
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-500 text-white px-4 py-1 rounded-full text-sm">
                  Most Popular
                </div>
              )}
              
              <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold">${plan.price}</span>
                <span className="text-gray-600">/{plan.interval}</span>
              </div>
              
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-green-500" />
                    <span>{feature}</span>
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
                ) : 'Subscribe Now'}
              </Button>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
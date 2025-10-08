import { useSubscription } from '@/hooks/useSubscription';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Lock, Clock, CreditCard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SubscriptionGateProps {
  children: React.ReactNode;
  feature?: string;
}

export function SubscriptionGate({ children, feature }: SubscriptionGateProps) {
  const { user } = useAuth();
  const { subscription, loading } = useSubscription();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <Card className="p-8 text-center max-w-md mx-auto mt-12">
        <Lock className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
        <h2 className="text-2xl font-bold mb-2">Sign In Required</h2>
        <p className="text-muted-foreground mb-6">
          Please sign in to access {feature || 'this feature'}.
        </p>
        <Button onClick={() => navigate('/')}>Sign In</Button>
      </Card>
    );
  }

  if (!subscription?.isActive) {
    const isExpired = subscription?.status === 'expired' || subscription?.status === 'cancelled';
    
    return (
      <Card className="p-8 text-center max-w-md mx-auto mt-12">
        <CreditCard className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
        <h2 className="text-2xl font-bold mb-2">
          {isExpired ? 'Subscription Expired' : 'Upgrade Required'}
        </h2>
        <p className="text-muted-foreground mb-6">
          {isExpired 
            ? 'Your subscription has expired. Renew to continue accessing all features.'
            : 'Upgrade to a paid plan to access this feature.'}
        </p>
        <Button onClick={() => navigate('/subscription')}>
          View Plans
        </Button>
      </Card>
    );
  }

  // Show trial warning if less than 3 days remaining
  if (subscription.status === 'trial' && subscription.daysRemaining && subscription.daysRemaining <= 3) {
    return (
      <div>
        <Card className="p-4 mb-6 bg-yellow-50 border-yellow-200">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-yellow-600" />
            <div className="flex-1">
              <p className="font-medium text-yellow-900">
                {subscription.daysRemaining} day{subscription.daysRemaining !== 1 ? 's' : ''} left in your free trial
              </p>
              <p className="text-sm text-yellow-700">
                Subscribe now to continue accessing all features
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={() => navigate('/subscription')}>
              Subscribe
            </Button>
          </div>
        </Card>
        {children}
      </div>
    );
  }

  return <>{children}</>;
}

import { Link } from 'react-router-dom';
import { ArrowLeft, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Pricing() {
  const plans = [
    {
      name: 'Free',
      price: '$0',
      features: ['5 lessons per month', 'Basic progress tracking', 'Community support', 'Mobile access']
    },
    {
      name: 'Student',
      price: '$9.99',
      popular: true,
      features: ['Unlimited lessons', 'AI tutor access', 'Detailed analytics', 'Priority support', 'All question types']
    },
    {
      name: 'Teacher',
      price: '$29.99',
      features: ['Up to 100 students', 'Class management', 'Assignment creation', 'Grading tools', 'Parent communication']
    },
    {
      name: 'School',
      price: 'Custom',
      features: ['Unlimited students', 'Admin dashboard', 'Custom curriculum', 'Dedicated support', 'Training included']
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <Link to="/" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-8">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>
        
        <h1 className="text-4xl font-bold text-gray-900 mb-4 text-center">Simple, Transparent Pricing</h1>
        <p className="text-xl text-gray-600 mb-12 text-center">Choose the plan that's right for you</p>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan, idx) => (
            <div key={idx} className={`bg-white rounded-lg shadow-sm p-6 ${plan.popular ? 'ring-2 ring-blue-600' : ''}`}>
              {plan.popular && <span className="bg-blue-600 text-white text-xs px-3 py-1 rounded-full">Most Popular</span>}
              <h3 className="text-2xl font-bold text-gray-900 mt-4">{plan.name}</h3>
              <div className="text-4xl font-bold text-gray-900 my-4">{plan.price}<span className="text-lg text-gray-600">/mo</span></div>
              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start">
                    <Check className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
              <Button className="w-full" variant={plan.popular ? 'default' : 'outline'}>
                Get Started
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

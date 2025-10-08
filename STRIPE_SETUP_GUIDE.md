# Stripe Integration Setup Guide

## 🎯 Overview
Your LiteraryGenius Academy now has a complete Stripe subscription system with webhook support!

## 📋 Prerequisites
- Stripe account (get one at https://stripe.com)
- Stripe Secret Key already configured in Supabase

## 🔧 Setup Steps

### 1. Create Stripe Products & Prices

Go to Stripe Dashboard → Products and create:

**Basic Plan** ($19/month)
- Price ID: `price_basic_monthly_19`
- Features: Core learning tools, 5 assignments/month

**Premium Plan** ($29/month) ⭐ RECOMMENDED
- Price ID: `price_premium_monthly_29`
- Features: Everything + AI Tutor, unlimited assignments, advanced analytics

**Enterprise Plan** ($49/month)
- Price ID: `price_enterprise_monthly_49`
- Features: Everything + priority support, custom curriculum, admin dashboard

### 2. Configure Stripe Webhooks

1. Go to Stripe Dashboard → Developers → Webhooks
2. Click "Add endpoint"
3. Enter webhook URL:
   ```
   https://ukiftslybaexlikgmodr.supabase.co/functions/v1/stripe-subscription-manager
   ```

4. Select these events:
   - ✅ `checkout.session.completed`
   - ✅ `customer.subscription.created`
   - ✅ `customer.subscription.updated`
   - ✅ `customer.subscription.deleted`
   - ✅ `invoice.payment_succeeded`
   - ✅ `invoice.payment_failed`

5. Copy the webhook signing secret (starts with `whsec_`)
6. Add to Supabase secrets:
   ```bash
   STRIPE_WEBHOOK_SECRET=whsec_your_secret_here
   ```

### 3. Update Price IDs in Code

Edit `src/components/SubscriptionPlans.tsx` and update the price IDs:

```typescript
const plans = [
  {
    name: 'Basic',
    price: 19,
    priceId: 'price_basic_monthly_19', // Your actual Stripe price ID
    // ...
  },
  {
    name: 'Premium',
    price: 29,
    priceId: 'price_premium_monthly_29', // Your actual Stripe price ID
    // ...
  },
  // ...
];
```

## 🧪 Testing

### Test Mode
1. Use Stripe test mode keys
2. Test card: `4242 4242 4242 4242`
3. Any future expiry date
4. Any 3-digit CVC

### Test Webhooks Locally
```bash
stripe listen --forward-to https://ukiftslybaexlikgmodr.supabase.co/functions/v1/stripe-subscription-manager
```

## 📊 Available Actions

The edge function supports these actions:

### Create Checkout Session
```typescript
const { data } = await supabase.functions.invoke('stripe-subscription-manager', {
  body: {
    action: 'create-checkout',
    priceId: 'price_premium_monthly_29',
    userId: user.id,
    customerId: user.stripe_customer_id // optional
  }
});
// Redirect to: data.url
```

### Cancel Subscription
```typescript
await supabase.functions.invoke('stripe-subscription-manager', {
  body: {
    action: 'cancel-subscription',
    subscriptionId: user.stripe_subscription_id,
    userId: user.id
  }
});
```

### Update Subscription (Change Plan)
```typescript
await supabase.functions.invoke('stripe-subscription-manager', {
  body: {
    action: 'update-subscription',
    subscriptionId: user.stripe_subscription_id,
    newPriceId: 'price_enterprise_monthly_49'
  }
});
```

### Create Customer Portal Session
```typescript
const { data } = await supabase.functions.invoke('stripe-subscription-manager', {
  body: {
    action: 'create-portal-session',
    customerId: user.stripe_customer_id
  }
});
// Redirect to: data.url (manage billing, cancel, update payment method)
```

### Get Subscription Details
```typescript
const { data } = await supabase.functions.invoke('stripe-subscription-manager', {
  body: {
    action: 'get-subscription',
    subscriptionId: user.stripe_subscription_id
  }
});
```

## 🔒 Security Features

✅ CORS headers configured
✅ Webhook signature verification
✅ Environment variables for API keys
✅ Database updates via service role
✅ Error handling and logging

## 📈 Database Schema

User profiles now include:
- `stripe_customer_id` - Stripe customer ID
- `stripe_subscription_id` - Active subscription ID
- `subscription_status` - free, active, past_due, canceled, trialing
- `subscription_tier` - free, basic, premium, enterprise
- `subscription_start_date` - When subscription started
- `subscription_end_date` - When subscription ends/ended

## 🚀 Go Live Checklist

- [ ] Switch to live Stripe API keys
- [ ] Update webhook endpoint to production URL
- [ ] Test complete payment flow
- [ ] Test subscription cancellation
- [ ] Test webhook events
- [ ] Set up Stripe email notifications
- [ ] Configure Stripe billing portal settings
- [ ] Add terms of service and privacy policy links

## 💰 Pricing Recommendation

Based on Time4Learning ($29.95-$39.95/month), your pricing is competitive:
- **Basic $19/mo** - Entry level (below competitor)
- **Premium $29/mo** - Sweet spot (matches competitor) ⭐
- **Enterprise $49/mo** - Premium tier (above competitor)

## 📞 Support

If you encounter issues:
1. Check Stripe Dashboard → Logs
2. Check Supabase Edge Function logs
3. Verify webhook events are being received
4. Test with Stripe CLI for local debugging

## 🎉 You're Ready!

Your subscription system is now fully functional with:
- ✅ Checkout sessions
- ✅ Subscription management
- ✅ Webhook handling
- ✅ Customer portal
- ✅ Database synchronization
- ✅ Plan upgrades/downgrades

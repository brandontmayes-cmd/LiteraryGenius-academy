# Stripe Webhook Configuration

## 🎯 Quick Setup

### Step 1: Get Your Webhook URL
```
https://ukiftslybaexlikgmodr.supabase.co/functions/v1/stripe-subscription-manager
```

### Step 2: Configure in Stripe Dashboard

1. Go to: https://dashboard.stripe.com/webhooks
2. Click **"Add endpoint"**
3. Paste the URL above
4. Select **"Latest API version"**

### Step 3: Select Events

Check these events (critical for subscription management):

**Checkout Events:**
- ✅ `checkout.session.completed`

**Subscription Events:**
- ✅ `customer.subscription.created`
- ✅ `customer.subscription.updated`
- ✅ `customer.subscription.deleted`

**Payment Events:**
- ✅ `invoice.payment_succeeded`
- ✅ `invoice.payment_failed`

### Step 4: Save & Test

1. Click **"Add endpoint"**
2. Copy the **Signing secret** (starts with `whsec_`)
3. Test with "Send test webhook" button

## 🧪 Testing Webhooks

### Test in Stripe Dashboard
1. Go to your webhook endpoint
2. Click "Send test webhook"
3. Select event type
4. Click "Send test webhook"

### Test with Stripe CLI
```bash
# Install Stripe CLI
brew install stripe/stripe-brew/stripe

# Login
stripe login

# Forward webhooks to your endpoint
stripe listen --forward-to https://ukiftslybaexlikgmodr.supabase.co/functions/v1/stripe-subscription-manager

# Trigger test events
stripe trigger checkout.session.completed
stripe trigger customer.subscription.updated
```

## 📊 What Each Event Does

| Event | Action |
|-------|--------|
| `checkout.session.completed` | Creates subscription, updates user profile with customer ID |
| `customer.subscription.updated` | Updates subscription status (active, past_due, etc.) |
| `customer.subscription.deleted` | Cancels subscription, downgrades to free tier |
| `invoice.payment_succeeded` | Confirms successful payment, keeps subscription active |
| `invoice.payment_failed` | Marks subscription as past_due, notifies user |

## 🔍 Debugging

### Check Webhook Logs
1. Stripe Dashboard → Developers → Webhooks
2. Click your endpoint
3. View "Attempts" tab

### Check Supabase Logs
1. Supabase Dashboard → Edge Functions
2. Select `stripe-subscription-manager`
3. View logs

### Common Issues

**Webhook not receiving events:**
- Verify URL is correct
- Check endpoint is enabled
- Ensure events are selected

**Events failing:**
- Check Supabase function logs
- Verify STRIPE_SECRET_KEY is set
- Ensure user_profiles table has Stripe columns

## ✅ Verification Checklist

- [ ] Webhook endpoint added in Stripe
- [ ] All 6 events selected
- [ ] Endpoint shows "Enabled" status
- [ ] Test webhook sent successfully
- [ ] Supabase logs show webhook received
- [ ] Database updated after test event

## 🚀 Production Checklist

- [ ] Switch to live Stripe keys
- [ ] Update webhook URL if domain changed
- [ ] Re-add webhook in live mode
- [ ] Test complete subscription flow
- [ ] Monitor webhook attempts for 24 hours
- [ ] Set up Stripe email notifications

Your webhook is now ready to handle subscription events automatically! 🎉

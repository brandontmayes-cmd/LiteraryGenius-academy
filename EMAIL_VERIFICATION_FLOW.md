# Email Verification Flow Documentation

## Overview
This document explains the complete email verification flow in your application, from user signup to successful verification.

## Flow Diagram

```
User Signs Up
    ↓
Supabase Sends Verification Email
    ↓
User Clicks Link in Email
    ↓
Redirected to /verify-email
    ↓
Token Validated & Session Created
    ↓
User Profile Updated (email_verified: true)
    ↓
Redirected to Dashboard
```

## Components Involved

### 1. AuthModal (`src/components/auth/AuthModal.tsx`)
- Handles user registration
- Shows "Verify Your Email" message after signup
- Provides "Resend verification email" button
- Displays the email address where verification was sent

### 2. VerifyEmail Page (`src/pages/VerifyEmail.tsx`)
- Handles the verification link from email
- Extracts and validates the token from URL hash
- Creates user session with Supabase
- Updates user profile with email_verified flag
- Shows success/error states with animations
- Auto-redirects after 3 seconds
- Provides manual "Go to Dashboard" button
- Offers resend functionality on error

### 3. AuthContext (`src/contexts/AuthContext.tsx`)
- Manages authentication state
- Provides `resendVerificationEmail()` function
- Handles OAuth providers (Google, GitHub)

## URL Parameters

When user clicks the verification link, Supabase redirects to:
```
https://yourdomain.com/verify-email#access_token=xxx&refresh_token=xxx&type=signup
```

### Hash Parameters:
- `access_token`: JWT token for authentication
- `refresh_token`: Token for session refresh
- `type`: Type of verification (signup, recovery, invite, magiclink)
- `error`: Error code if verification failed
- `error_description`: Human-readable error message

## Verification States

### Loading State
- Shows spinning loader
- Displays "Verifying Email" message
- Animated dots indicator

### Success State
- Green checkmark icon with pulse animation
- Success message based on verification type
- Countdown timer (3 seconds)
- "Go to Dashboard Now" button
- Auto-redirect after countdown

### Error State
- Red X icon
- Error message in highlighted box
- "Resend Verification Email" button
- "Return to Home" button
- Common issues troubleshooting list

## Error Handling

### Common Errors:
1. **Invalid or expired verification link**
   - Link is only valid for 24 hours
   - Link can only be used once
   
2. **Missing tokens**
   - access_token or refresh_token not in URL
   
3. **Session creation failed**
   - Supabase unable to create session
   
4. **Database update failed**
   - Unable to update user_profiles table

## Resend Functionality

Users can resend verification email if:
- Original link expired
- Email wasn't received
- Link was already used

**Implementation:**
```typescript
const handleResendVerification = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (user?.email) {
    await supabase.auth.resend({
      type: 'signup',
      email: user.email,
    });
  }
};
```

## Supabase Configuration Required

### 1. Enable Email Provider
See `EMAIL_AUTH_SETUP.md` for detailed instructions

### 2. Set Redirect URLs
In Supabase Dashboard → Authentication → URL Configuration:
- Site URL: `https://yourdomain.com`
- Redirect URLs: `https://yourdomain.com/verify-email`

### 3. Email Templates
Customize in Supabase Dashboard → Authentication → Email Templates
- Confirm signup template
- Magic link template
- Change email address template

## Testing the Flow

### Local Development:
1. Start your dev server: `npm run dev`
2. Sign up with a test email
3. Check your email inbox
4. Click the verification link
5. Should redirect to `http://localhost:5173/verify-email`

### Production:
1. Ensure Site URL is set correctly in Supabase
2. Add production domain to Redirect URLs
3. Test with real email address
4. Verify email templates are branded correctly

## Troubleshooting

### Email Not Received
- Check spam/junk folder
- Verify email provider settings in Supabase
- Check Supabase logs for delivery status
- Consider using custom SMTP for production

### Verification Link Not Working
- Check if link expired (24-hour limit)
- Verify redirect URLs in Supabase match exactly
- Check browser console for errors
- Ensure user hasn't already verified

### Redirect Not Working
- Verify Site URL in Supabase settings
- Check that /verify-email route exists in App.tsx
- Ensure no ad blockers interfering
- Check network tab for redirect chain

## Security Considerations

1. **Token Expiration**: Links expire after 24 hours
2. **One-Time Use**: Each link can only be used once
3. **Secure Hash**: Tokens passed in URL hash (not sent to server)
4. **Session Creation**: Only valid tokens can create sessions
5. **Database Verification**: email_verified flag prevents unauthorized access

## Customization Options

### Change Countdown Duration
In `VerifyEmail.tsx`, modify:
```typescript
const [countdown, setCountdown] = useState(3); // Change to desired seconds
```

### Customize Success Messages
Modify `getSuccessMessage()` function in `VerifyEmail.tsx`

### Change Redirect Destination
Modify the navigate call:
```typescript
navigate('/dashboard'); // Instead of '/'
```

### Styling
All components use Tailwind CSS and can be customized by modifying class names.

## Related Files
- `src/pages/VerifyEmail.tsx` - Main verification page
- `src/components/auth/AuthModal.tsx` - Registration modal
- `src/contexts/AuthContext.tsx` - Auth state management
- `EMAIL_AUTH_SETUP.md` - Supabase email configuration
- `GOOGLE_AUTH_SETUP.md` - OAuth provider setup

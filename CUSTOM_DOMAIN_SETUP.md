# Custom Domain Setup Guide

## Overview
This guide covers complete custom domain configuration for Literary Genius Academy, including DNS setup for popular providers, SSL certificates, and troubleshooting.

---

## Quick Start Checklist

- [ ] Purchase domain from registrar
- [ ] Configure DNS records
- [ ] Add domain to Vercel
- [ ] Verify SSL certificate
- [ ] Test HTTPS redirect
- [ ] Update Supabase URLs
- [ ] Test OAuth flows

---

## Step 1: Choose Your Domain

### Recommended Registrars
1. **Namecheap** - Best value, easy DNS management
2. **GoDaddy** - Popular, good support
3. **Cloudflare** - Free DNS, excellent performance
4. **Google Domains** - Simple interface
5. **Porkbun** - Budget-friendly

### Domain Suggestions
- `literarygenius.com`
- `literarygenius.academy`
- `literarygeniusapp.com`
- `yourbrand.education`

---

## Step 2: Add Domain to Vercel

### Via Vercel Dashboard

1. Go to your project → **Settings** → **Domains**
2. Enter your domain: `yourdomain.com`
3. Click **Add**
4. Vercel will provide DNS records to configure

### Recommended Configuration

```
Primary Domain: www.yourdomain.com
Redirect: yourdomain.com → www.yourdomain.com
```

**OR**

```
Primary Domain: yourdomain.com
Redirect: www.yourdomain.com → yourdomain.com
```

---

## Step 3: DNS Configuration by Provider

### Option A: Namecheap

#### For Apex Domain (yourdomain.com)

1. Login to Namecheap
2. Go to **Domain List** → Click **Manage**
3. Go to **Advanced DNS** tab
4. Add these records:

```
Type: A Record
Host: @
Value: 76.76.21.21
TTL: Automatic

Type: CNAME Record
Host: www
Value: cname.vercel-dns.com.
TTL: Automatic
```

#### For Subdomain (app.yourdomain.com)

```
Type: CNAME Record
Host: app
Value: cname.vercel-dns.com.
TTL: Automatic
```

**Important:** Remove any existing A or CNAME records for @ and www

---

### Option B: GoDaddy

#### Configuration Steps

1. Login to GoDaddy
2. Go to **My Products** → **Domains**
3. Click **DNS** next to your domain
4. Add these records:

```
Type: A
Name: @
Value: 76.76.21.21
TTL: 600 seconds

Type: CNAME
Name: www
Value: cname.vercel-dns.com
TTL: 1 Hour
```

#### Remove Default Records

- Delete default **A record** pointing to GoDaddy parking page
- Delete default **CNAME** for www if exists
- Keep **MX records** if you use email

---

### Option C: Cloudflare (Recommended for Performance)

#### Initial Setup

1. Add site to Cloudflare (if not already)
2. Update nameservers at registrar to Cloudflare's
3. Wait for nameserver propagation (2-48 hours)

#### DNS Records

1. Go to **DNS** → **Records**
2. Add these records:

```
Type: A
Name: @
IPv4 address: 76.76.21.21
Proxy status: Proxied (orange cloud)
TTL: Auto

Type: CNAME
Name: www
Target: cname.vercel-dns.com
Proxy status: Proxied (orange cloud)
TTL: Auto
```

#### Cloudflare SSL/TLS Settings

1. Go to **SSL/TLS** → **Overview**
2. Set encryption mode to **Full (strict)**
3. Go to **Edge Certificates**
4. Enable:
   - Always Use HTTPS ✓
   - Automatic HTTPS Rewrites ✓
   - Minimum TLS Version: 1.2

#### Page Rules for HTTPS Redirect

1. Go to **Rules** → **Page Rules**
2. Create rule:
```
URL: http://*yourdomain.com/*
Setting: Always Use HTTPS
```

---

### Option D: Google Domains

#### DNS Configuration

1. Go to **My Domains** → Select domain
2. Click **DNS** in left sidebar
3. Scroll to **Custom resource records**
4. Add these records:

```
Name: @
Type: A
TTL: 1H
Data: 76.76.21.21

Name: www
Type: CNAME
TTL: 1H
Data: cname.vercel-dns.com.
```

---

### Option E: Using Vercel Nameservers (Easiest)

#### Benefits
- Automatic DNS management
- Fastest propagation
- No manual DNS configuration

#### Setup Steps

1. In Vercel project → **Domains**
2. Add your domain
3. Select **Use Vercel Nameservers**
4. Vercel provides nameservers:
```
ns1.vercel-dns.com
ns2.vercel-dns.com
```

5. Update at your registrar:
   - Go to domain settings
   - Find **Nameservers** section
   - Change to **Custom Nameservers**
   - Enter Vercel's nameservers
   - Save changes

6. Wait 24-48 hours for propagation

---

## Step 4: SSL Certificate Verification

### Automatic SSL (Vercel)

Vercel automatically provisions SSL certificates via Let's Encrypt.

#### Verification Steps

1. Go to Vercel project → **Domains**
2. Check domain status:
   - ✓ **Valid Configuration** - DNS correct
   - ⏳ **Pending** - Waiting for DNS propagation
   - ⚠️ **Invalid Configuration** - DNS issue

3. Once valid, SSL certificate issued automatically (1-5 minutes)

### Check SSL Certificate

```bash
# Command line check
openssl s_client -connect yourdomain.com:443 -servername yourdomain.com

# Or visit
https://www.ssllabs.com/ssltest/analyze.html?d=yourdomain.com
```

### Expected Result
- Certificate issuer: Let's Encrypt
- Valid for: 90 days (auto-renewed)
- Grade A or A+ on SSL Labs

---

## Step 5: HTTPS Redirect Configuration

### Vercel Automatic Redirect

Vercel automatically redirects HTTP → HTTPS. No configuration needed!

### Verify Redirect

```bash
curl -I http://yourdomain.com
```

Expected response:
```
HTTP/1.1 308 Permanent Redirect
Location: https://yourdomain.com/
```

### Force HTTPS in Code (Optional)

Add to `vercel.json`:

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Strict-Transport-Security",
          "value": "max-age=63072000; includeSubDomains; preload"
        }
      ]
    }
  ]
}
```

---

## Step 6: Update Supabase Configuration

### Critical: Update OAuth Redirect URLs

1. Go to Supabase Dashboard
2. Navigate to **Authentication** → **URL Configuration**

3. Update **Site URL**:
```
https://yourdomain.com
```

4. Update **Redirect URLs** (add all):
```
https://yourdomain.com/**
https://yourdomain.com/auth/callback
https://www.yourdomain.com/**
https://www.yourdomain.com/auth/callback
```

5. Update OAuth Provider Settings:
   - **Google OAuth**: Add `https://yourdomain.com` to authorized origins
   - **GitHub OAuth**: Update callback URL to your domain

### Update Environment Variables

Update in Vercel:
```
VITE_APP_URL=https://yourdomain.com
```

Redeploy after changes:
```bash
vercel --prod
```

---

## Step 7: DNS Propagation & Troubleshooting

### Check DNS Propagation

**Online Tools:**
- https://www.whatsmydns.net/
- https://dnschecker.org/
- https://www.dnswatch.info/

**Command Line:**
```bash
# Check A record
dig yourdomain.com +short

# Check CNAME record
dig www.yourdomain.com +short

# Check from specific DNS server
dig @8.8.8.8 yourdomain.com
```

### Expected Results

```bash
# Apex domain
$ dig yourdomain.com +short
76.76.21.21

# WWW subdomain
$ dig www.yourdomain.com +short
cname.vercel-dns.com.
76.76.21.21
```

---

## Common Issues & Solutions

### Issue 1: DNS Not Propagating

**Symptoms:** Domain doesn't resolve after 24 hours

**Solutions:**
1. Verify DNS records are correct (no typos)
2. Check TTL isn't too high (should be 300-3600 seconds)
3. Clear local DNS cache:
```bash
# Windows
ipconfig /flushdns

# macOS
sudo dscacheutil -flushcache; sudo killall -HUP mDNSResponder

# Linux
sudo systemd-resolve --flush-caches
```

4. Try different DNS server:
```bash
# Use Google DNS
nslookup yourdomain.com 8.8.8.8
```

---

### Issue 2: SSL Certificate Not Issued

**Symptoms:** "Not Secure" warning in browser

**Solutions:**
1. Verify DNS is fully propagated (use whatsmydns.net)
2. Check Vercel domain status shows "Valid Configuration"
3. Wait 5-10 minutes after DNS validation
4. Try removing and re-adding domain in Vercel
5. Check for CAA records blocking Let's Encrypt:
```bash
dig yourdomain.com CAA
```

If CAA records exist, add:
```
Type: CAA
Name: @
Value: 0 issue "letsencrypt.org"
```

---

### Issue 3: Mixed Content Warnings

**Symptoms:** Some resources load over HTTP

**Solutions:**
1. Update all asset URLs to use HTTPS
2. Use protocol-relative URLs: `//example.com/image.jpg`
3. Add CSP header in `vercel.json`:
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Content-Security-Policy",
          "value": "upgrade-insecure-requests"
        }
      ]
    }
  ]
}
```

---

### Issue 4: OAuth Not Working After Domain Change

**Symptoms:** Login redirects fail

**Solutions:**
1. Update Supabase Site URL (Step 6 above)
2. Update OAuth provider authorized URLs:
   - **Google**: Console → Credentials → Authorized origins
   - **GitHub**: Settings → OAuth Apps → Update callback
3. Clear browser cookies and try again
4. Verify redirect URLs include new domain

---

### Issue 5: WWW vs Non-WWW Issues

**Symptoms:** One version works, other doesn't

**Solutions:**
1. Ensure both records exist in DNS
2. Configure redirect in Vercel:
   - Go to Domains
   - Click domain → Settings
   - Choose redirect direction
3. Test both versions:
```bash
curl -I http://yourdomain.com
curl -I http://www.yourdomain.com
```

---

### Issue 6: Cloudflare 525 Error

**Symptoms:** "SSL Handshake Failed"

**Solutions:**
1. Change SSL/TLS mode to **Full** (not Full Strict)
2. Wait for Vercel SSL to fully provision
3. Temporarily disable Cloudflare proxy (gray cloud)
4. Re-enable after Vercel SSL is confirmed

---

## Advanced Configuration

### Subdomain Setup (app.yourdomain.com)

```
Type: CNAME
Host: app
Value: cname.vercel-dns.com.
```

Then add in Vercel Domains section.

### Email Configuration

Keep MX records for email:
```
Type: MX
Priority: 10
Value: mail.yourdomain.com
```

### WWW Redirect

Vercel handles automatically. Verify in project settings.

---

## Performance Optimization

### Enable Cloudflare (Optional)

Benefits:
- Global CDN
- DDoS protection
- Additional caching
- Analytics

Setup: Use Cloudflare DNS with proxied records (orange cloud)

### Verify Performance

```bash
# Test global latency
curl -w "@curl-format.txt" -o /dev/null -s https://yourdomain.com

# Check headers
curl -I https://yourdomain.com
```

Look for:
- `x-vercel-cache: HIT`
- `cf-cache-status: HIT` (if using Cloudflare)

---

## Final Verification Checklist

- [ ] Domain resolves to Vercel (dig command)
- [ ] HTTPS works without warnings
- [ ] HTTP redirects to HTTPS
- [ ] WWW redirects properly
- [ ] SSL certificate valid (A+ grade)
- [ ] OAuth login works
- [ ] Parent portal invites work
- [ ] Email notifications use correct domain
- [ ] PWA installs with correct domain
- [ ] All pages load correctly
- [ ] Service worker registers

---

## Monitoring & Maintenance

### SSL Certificate Renewal

Automatic via Let's Encrypt. Vercel handles renewal every 60 days.

### DNS Health Checks

Monitor with:
- UptimeRobot (free)
- Pingdom
- StatusCake

### Domain Expiration

Set reminders 30 days before expiration.

---

## Support Resources

- **Vercel Docs**: https://vercel.com/docs/concepts/projects/domains
- **Cloudflare Docs**: https://developers.cloudflare.com/dns/
- **Let's Encrypt**: https://letsencrypt.org/docs/

---

## Need Help?

Common commands for troubleshooting:

```bash
# Full DNS check
dig yourdomain.com ANY

# Trace DNS resolution
dig yourdomain.com +trace

# Check SSL
openssl s_client -connect yourdomain.com:443

# Test HTTP/HTTPS
curl -IL http://yourdomain.com
curl -IL https://yourdomain.com
```

Your Literary Genius Academy is now ready for production with a custom domain! 🚀

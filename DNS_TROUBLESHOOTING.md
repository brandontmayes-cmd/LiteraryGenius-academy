# DNS Troubleshooting Guide

## Quick Diagnostic Commands

### Check Current DNS Status

```bash
# Check if domain resolves
ping yourdomain.com

# Check A record
dig yourdomain.com A +short

# Check CNAME record
dig www.yourdomain.com CNAME +short

# Check all DNS records
dig yourdomain.com ANY

# Check from specific DNS server (Google)
dig @8.8.8.8 yourdomain.com

# Check from specific DNS server (Cloudflare)
dig @1.1.1.1 yourdomain.com

# Trace DNS path
dig yourdomain.com +trace

# Check nameservers
dig yourdomain.com NS +short
```

---

## Issue: Domain Not Resolving

### Symptoms
- "This site can't be reached"
- "DNS_PROBE_FINISHED_NXDOMAIN"
- "Server not found"

### Diagnosis

```bash
# Check if DNS records exist
dig yourdomain.com

# Expected output should show:
# ANSWER SECTION with IP address
```

### Solutions

#### 1. Verify DNS Records Are Set
- Login to DNS provider
- Confirm A record exists: `@ → 76.76.21.21`
- Confirm CNAME exists: `www → cname.vercel-dns.com`

#### 2. Check Propagation Status
Visit: https://www.whatsmydns.net/#A/yourdomain.com

- Green checkmarks = propagated
- Red X = not propagated
- Wait 2-48 hours for full propagation

#### 3. Clear Local DNS Cache

**Windows:**
```cmd
ipconfig /flushdns
ipconfig /registerdns
```

**macOS:**
```bash
sudo dscacheutil -flushcache
sudo killall -HUP mDNSResponder
```

**Linux:**
```bash
sudo systemd-resolve --flush-caches
sudo service network-manager restart
```

**Browser Cache:**
- Chrome: `chrome://net-internals/#dns` → Clear host cache
- Firefox: Close and restart browser

#### 4. Try Different DNS Server

**Change to Google DNS (8.8.8.8):**

**Windows:**
1. Control Panel → Network and Sharing
2. Change adapter settings
3. Right-click connection → Properties
4. Select IPv4 → Properties
5. Use: 8.8.8.8 and 8.8.4.4

**macOS:**
1. System Preferences → Network
2. Select connection → Advanced
3. DNS tab → Add 8.8.8.8

**Linux:**
```bash
sudo nano /etc/resolv.conf
# Add: nameserver 8.8.8.8
```

---

## Issue: DNS Propagation Taking Too Long

### Normal Timeframes
- **Typical**: 2-8 hours
- **Maximum**: 48 hours
- **Nameserver changes**: 24-72 hours

### Speed Up Propagation

#### 1. Lower TTL Before Changes
Before updating DNS:
```
Set TTL to 300 seconds (5 minutes)
Wait for old TTL to expire
Make DNS changes
Increase TTL back to 3600 after propagation
```

#### 2. Check TTL Status
```bash
dig yourdomain.com | grep TTL
```

#### 3. Verify at Authoritative Nameserver
```bash
# Find authoritative nameserver
dig yourdomain.com NS +short

# Query it directly
dig @ns1.yourprovider.com yourdomain.com
```

If authoritative server shows correct records, just wait for propagation.

---

## Issue: SSL Certificate Not Issued

### Symptoms
- "Not Secure" in browser
- "NET::ERR_CERT_COMMON_NAME_INVALID"
- "Your connection is not private"

### Diagnosis

```bash
# Check SSL certificate
openssl s_client -connect yourdomain.com:443 -servername yourdomain.com

# Check certificate details
echo | openssl s_client -connect yourdomain.com:443 2>/dev/null | openssl x509 -noout -dates
```

### Solutions

#### 1. Verify DNS is Fully Propagated
SSL won't issue until DNS is confirmed worldwide.

```bash
# Check multiple locations
curl -I https://www.whatsmydns.net/api/check?server=world&type=A&query=yourdomain.com
```

#### 2. Check Vercel Domain Status
- Go to Vercel → Project → Domains
- Status should be "Valid Configuration"
- If "Invalid Configuration", check DNS records

#### 3. Wait for Certificate Issuance
After DNS validates:
- Let's Encrypt takes 1-10 minutes
- Check Vercel dashboard for status
- Refresh page after 5 minutes

#### 4. Check CAA Records
```bash
dig yourdomain.com CAA
```

If CAA records exist and don't include Let's Encrypt:

**Add CAA Record:**
```
Type: CAA
Name: @
Flags: 0
Tag: issue
Value: letsencrypt.org
```

#### 5. Remove and Re-add Domain
In Vercel:
1. Remove domain
2. Wait 5 minutes
3. Re-add domain
4. Wait for SSL provisioning

---

## Issue: Cloudflare 525 SSL Handshake Failed

### Cause
Cloudflare can't validate SSL with origin server (Vercel).

### Solutions

#### 1. Change SSL/TLS Mode
Cloudflare Dashboard → SSL/TLS → Overview:
- Change from "Full (strict)" to "Full"
- Wait 5 minutes
- Test site

#### 2. Temporarily Disable Proxy
- Go to DNS records
- Click orange cloud (make it gray)
- Wait for Vercel SSL to provision
- Re-enable proxy (orange cloud)

#### 3. Check Vercel SSL Status
Ensure Vercel shows valid SSL before enabling Cloudflare proxy.

---

## Issue: Mixed Content Warnings

### Symptoms
- Padlock icon with warning
- "This page includes resources loaded over HTTP"
- Some images/scripts don't load

### Diagnosis

**Browser Console:**
```
Mixed Content: The page at 'https://yourdomain.com' was loaded over HTTPS, 
but requested an insecure resource 'http://example.com/image.jpg'
```

### Solutions

#### 1. Update All URLs to HTTPS
Search codebase for `http://`:
```bash
grep -r "http://" src/
```

Replace with `https://` or protocol-relative `//`

#### 2. Add Content Security Policy
In `vercel.json`:
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

#### 3. Check External Resources
- Supabase URLs (should be HTTPS)
- CDN links (should be HTTPS)
- API endpoints (should be HTTPS)

---

## Issue: WWW Not Working

### Symptoms
- `www.yourdomain.com` doesn't resolve
- Only apex domain works

### Solutions

#### 1. Add WWW CNAME Record
```
Type: CNAME
Host: www
Value: cname.vercel-dns.com.
TTL: 3600
```

#### 2. Add WWW to Vercel
- Vercel → Domains
- Add `www.yourdomain.com`
- Configure redirect

#### 3. Verify WWW DNS
```bash
dig www.yourdomain.com CNAME +short
# Should return: cname.vercel-dns.com
```

---

## Issue: Redirect Loop

### Symptoms
- "Too many redirects"
- "ERR_TOO_MANY_REDIRECTS"
- Page keeps reloading

### Causes
- Conflicting redirect rules
- Cloudflare + Vercel both redirecting
- Incorrect SSL mode

### Solutions

#### 1. Check Cloudflare SSL Mode
Set to "Full" or "Full (strict)", not "Flexible"

#### 2. Disable Cloudflare Page Rules
Temporarily disable all page rules to test.

#### 3. Check Vercel Configuration
Remove custom redirect rules in `vercel.json` (Vercel handles automatically)

#### 4. Clear Browser Data
- Clear cookies for domain
- Clear cache
- Try incognito mode

---

## Issue: Email Stops Working After DNS Change

### Cause
Accidentally deleted MX records when updating DNS.

### Solutions

#### 1. Check MX Records
```bash
dig yourdomain.com MX +short
```

#### 2. Restore MX Records
Add back email provider's MX records:

**Google Workspace:**
```
Type: MX, Priority: 1, Value: aspmx.l.google.com.
Type: MX, Priority: 5, Value: alt1.aspmx.l.google.com.
Type: MX, Priority: 5, Value: alt2.aspmx.l.google.com.
Type: MX, Priority: 10, Value: alt3.aspmx.l.google.com.
Type: MX, Priority: 10, Value: alt4.aspmx.l.google.com.
```

**Microsoft 365:**
```
Type: MX, Priority: 0, Value: yourdomain-com.mail.protection.outlook.com.
```

#### 3. Add SPF Record
```
Type: TXT
Name: @
Value: v=spf1 include:_spf.google.com ~all
```

---

## Issue: Subdomain Not Working

### Symptoms
- `app.yourdomain.com` doesn't resolve
- Works on main domain only

### Solutions

#### 1. Add Subdomain CNAME
```
Type: CNAME
Host: app
Value: cname.vercel-dns.com.
TTL: 3600
```

#### 2. Add to Vercel
- Vercel → Domains
- Add `app.yourdomain.com`

#### 3. Verify Subdomain DNS
```bash
dig app.yourdomain.com CNAME +short
```

---

## Issue: Old Site Still Showing

### Symptoms
- Changes not visible
- Old content appears
- Cached version loads

### Solutions

#### 1. Check DNS Points to Vercel
```bash
dig yourdomain.com +short
# Should show: 76.76.21.21
```

#### 2. Clear CDN Cache
If using Cloudflare:
- Dashboard → Caching
- Purge Everything

#### 3. Hard Refresh Browser
- Windows: `Ctrl + F5`
- Mac: `Cmd + Shift + R`

#### 4. Check Vercel Deployment
- Ensure latest build is deployed
- Check deployment URL directly

---

## Diagnostic Tools

### Online Tools
- **DNS Propagation**: https://www.whatsmydns.net/
- **DNS Checker**: https://dnschecker.org/
- **SSL Test**: https://www.ssllabs.com/ssltest/
- **Security Headers**: https://securityheaders.com/
- **DNS Lookup**: https://mxtoolbox.com/

### Command Line Tools
```bash
# Complete DNS check
nslookup yourdomain.com

# Detailed DNS info
host -a yourdomain.com

# Check HTTP headers
curl -I https://yourdomain.com

# Check SSL certificate
openssl s_client -connect yourdomain.com:443 -servername yourdomain.com < /dev/null

# Test redirect
curl -L http://yourdomain.com
```

---

## Prevention Checklist

Before making DNS changes:

- [ ] Lower TTL to 300 seconds
- [ ] Document current DNS records
- [ ] Backup MX records
- [ ] Note current nameservers
- [ ] Test in staging first
- [ ] Have rollback plan ready
- [ ] Schedule during low-traffic period

---

## Emergency Rollback

If something goes wrong:

1. **Revert DNS Records**
   - Restore previous A/CNAME records
   - Wait for propagation

2. **Contact Support**
   - Vercel: https://vercel.com/support
   - Cloudflare: https://support.cloudflare.com/

3. **Use Vercel Deployment URL**
   - Access via: `your-project.vercel.app`
   - Works immediately while DNS resolves

---

## Getting Help

### Information to Provide

When asking for help, include:

```bash
# DNS records
dig yourdomain.com ANY

# Nameservers
dig yourdomain.com NS +short

# Trace route
dig yourdomain.com +trace

# SSL info
echo | openssl s_client -connect yourdomain.com:443 2>/dev/null | openssl x509 -noout -text

# Headers
curl -I https://yourdomain.com
```

### Support Channels
- Vercel Discord: https://vercel.com/discord
- Cloudflare Community: https://community.cloudflare.com/
- DNS Provider Support

---

Your domain issues will be resolved! 🎯

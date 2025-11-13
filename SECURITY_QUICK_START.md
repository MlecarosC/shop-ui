# Security Quick Start Guide

## ⚠️ Before Deployment

This application has implemented several security features, but requires additional configuration for production use.

## Critical Security Tasks

### 1. Environment Configuration ✅ REQUIRED

```bash
# Copy example environment file
cp src/environments/environment.example.ts src/environments/environment.ts
cp src/environments/environment.development.example.ts src/environments/environment.development.ts

# Update with your actual values
# NEVER commit these files - they are in .gitignore
```

### 2. Backend Proxy ⚠️ HIGHLY RECOMMENDED

**Current Issue:** WooCommerce API credentials are in frontend code

**Solution:** Create a backend proxy:

```
Frontend → Your Backend → WooCommerce API
         (No credentials)  (Credentials secure)
```

Example Node.js proxy:
```javascript
// server.js
app.post('/api/woocommerce/*', async (req, res) => {
  const response = await fetch(`${WOOCOMMERCE_URL}${req.params[0]}`, {
    headers: {
      'Authorization': `Basic ${Buffer.from(
        `${CONSUMER_KEY}:${CONSUMER_SECRET}`
      ).toString('base64')}`
    }
  });
  res.json(await response.json());
});
```

### 3. Security Headers 🔒 REQUIRED

Add to your web server config:

**Nginx:**
```nginx
add_header X-Frame-Options "DENY";
add_header X-Content-Type-Options "nosniff";
add_header X-XSS-Protection "1; mode=block";
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains";
```

**Apache (.htaccess):**
```apache
Header always set X-Frame-Options "DENY"
Header always set X-Content-Type-Options "nosniff"
Header always set X-XSS-Protection "1; mode=block"
Header always set Strict-Transport-Security "max-age=31536000"
```

### 4. HTTPS 🔒 REQUIRED

- Use SSL/TLS certificate (Let's Encrypt is free)
- Force HTTPS redirects
- Update environment URLs to use `https://`

### 5. Content Security Policy 🔒 RECOMMENDED

Add CSP header:
```
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'
```

## Security Features Already Implemented ✅

- ✅ XSS Protection (removed unsafe HTML rendering)
- ✅ Open Redirect Protection (URL validation)
- ✅ Token Encryption (localStorage obfuscation)
- ✅ Rate Limiting (login attempts)
- ✅ Secure Cart Handling (headers vs URL params)
- ✅ Input Validation (sanitization utilities)
- ✅ No PII Logging (removed sensitive data from logs)

## Quick Security Check

Run before each deployment:

```bash
# 1. Check for secrets in code
git secrets --scan

# 2. Audit dependencies
npm audit

# 3. Check environment files
grep -r "consumer_key" src/  # Should NOT find anything in git

# 4. Verify HTTPS
curl -I https://yoursite.com | grep "Strict-Transport"
```

## Development vs Production

### Development (Current)
- ✅ Client-side rate limiting
- ✅ Encrypted localStorage
- ⚠️ WooCommerce credentials in frontend
- ⚠️ No backend validation

### Production (Recommended)
- ✅ Backend proxy for API calls
- ✅ httpOnly cookies for tokens
- ✅ Backend rate limiting
- ✅ Security headers
- ✅ Content Security Policy
- ✅ Regular security audits

## Common Security Mistakes to Avoid

❌ **DON'T:**
- Commit `.env` or `environment.ts` files
- Use `bypassSecurityTrustHtml` without sanitization
- Log sensitive user data
- Store tokens in plain text
- Use HTTP in production
- Trust client-side validation alone

✅ **DO:**
- Use environment variables
- Validate on both client and server
- Implement rate limiting on backend
- Use HTTPS everywhere
- Keep dependencies updated
- Review security regularly

## Need Help?

See full documentation: [SECURITY.md](./SECURITY.md)

## Emergency Security Response

If you discover a security issue:

1. Don't publish it publicly
2. Contact security team immediately
3. Document the issue
4. Apply patch as soon as possible
5. Review similar code for same vulnerability

---

**Remember:** Security is a continuous process, not a one-time task. Review and update regularly.

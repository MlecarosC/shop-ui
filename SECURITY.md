# Security Documentation

This document outlines the security measures implemented in the Shop UI application and provides guidelines for maintaining security best practices.

## Table of Contents

1. [Security Features Implemented](#security-features-implemented)
2. [Known Security Considerations](#known-security-considerations)
3. [Security Best Practices](#security-best-practices)
4. [Reporting Security Issues](#reporting-security-issues)

---

## Security Features Implemented

### 1. XSS (Cross-Site Scripting) Protection

**Status:** ✅ Implemented

- **Removed unsafe HTML rendering**: Eliminated the use of `bypassSecurityTrustHtml` in product descriptions
- **Angular sanitization**: All user-generated content is rendered using Angular's built-in sanitization
- **Location**: `src/app/pages/productDetail/`

### 2. Open Redirect Protection

**Status:** ✅ Implemented

- **URL validation**: All redirect URLs are validated to only allow relative paths
- **Security utility**: Created `validateRedirectUrl()` function in `src/app/core/utils/security.utils.ts`
- **Implementation**: Applied in `auth.guard.ts` and `login.ts`

**Protected against:**
- Absolute URL redirects
- Protocol-relative URLs (`//example.com`)
- JavaScript protocol URLs
- Data URLs and other suspicious patterns

### 3. Token Storage Encryption

**Status:** ✅ Implemented

- **Encrypted localStorage**: Auth tokens and user data are now encrypted before storage
- **Device-specific keys**: Encryption keys are generated based on browser fingerprint
- **Service**: `StorageEncryptionService` in `src/app/core/services/storage-encryption.service.ts`

**Note:** This provides obfuscation, not cryptographic security. For production, consider using httpOnly cookies.

### 4. Rate Limiting

**Status:** ✅ Implemented

- **Login rate limiting**: Max 5 attempts per 15 minutes
- **Client-side protection**: Prevents brute-force attacks before reaching the server
- **Service**: `RateLimiterService` in `src/app/core/services/rate-limiter.service.ts`

**Implemented on:**
- Login page (`/login`)
- Can be extended to other forms (contact, password reset, etc.)

### 5. Secure Cart Key Handling

**Status:** ✅ Implemented

- **Headers instead of URL params**: Cart keys are now sent via HTTP headers
- **URL history protection**: Prevents cart keys from appearing in browser history or server logs
- **Validation**: Cart keys are validated before use
- **Location**: `src/app/core/services/cart-api.service.ts`

### 6. Input Validation & Sanitization

**Status:** ✅ Implemented

- **Security utilities**: Created helper functions for input validation
- **Email validation**: Proper email format checking
- **HTML stripping**: Function to remove HTML tags from user input
- **Cart key validation**: Format validation for cart keys
- **Location**: `src/app/core/utils/security.utils.ts`

### 7. Sensitive Data Protection

**Status:** ✅ Implemented

- **No PII logging**: Removed logging of personally identifiable information
- **No billing data in console**: Checkout data is no longer logged
- **Error handling**: Generic error messages to users, no sensitive details exposed

---

## Known Security Considerations

### 1. WooCommerce API Credentials in Frontend

**Status:** ⚠️ Documented Risk

**Issue:**
- WooCommerce consumer credentials are included in the frontend code
- While environment files are gitignored, the compiled app contains these credentials

**Recommended Solution:**
```
┌──────────┐      HTTPS      ┌─────────────┐      API Keys      ┌──────────────┐
│ Frontend │ ────────────────> │ Your Backend│ ──────────────────> │  WooCommerce │
│ (Public) │                  │   (Secure)  │                    │   (Private)  │
└──────────┘                  └─────────────┘                    └──────────────┘
```

**Mitigation for Current Setup:**
- Use read-only API keys with minimal permissions
- Monitor API usage for anomalies
- Implement backend proxy in production

**Documentation:** See `src/app/core/interceptors/woocommerce.interceptor.ts`

### 2. LocalStorage vs HttpOnly Cookies

**Current:** Encrypted localStorage
**Production Recommendation:** HttpOnly cookies with Secure and SameSite flags

**Why HttpOnly Cookies are Better:**
- Not accessible via JavaScript (XSS protection)
- Automatically sent with requests
- Can be set with Secure flag (HTTPS only)
- SameSite flag prevents CSRF

**Migration Path:**
1. Set up backend to issue httpOnly cookies
2. Configure CORS properly
3. Remove localStorage token storage
4. Update interceptors to rely on cookies

### 3. Content Security Policy (CSP)

**Status:** ⚠️ Not Implemented

**Recommendation:** Add CSP headers on your web server

**Example CSP Header:**
```
Content-Security-Policy:
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  font-src 'self' data:;
  connect-src 'self' https://your-wordpress-api.com;
  frame-ancestors 'none';
```

### 4. Security Headers

**Status:** ⚠️ Requires Server Configuration

**Recommended Headers:**

```nginx
# Nginx Example
add_header X-Frame-Options "DENY";
add_header X-Content-Type-Options "nosniff";
add_header X-XSS-Protection "1; mode=block";
add_header Referrer-Policy "strict-origin-when-cross-origin";
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
add_header Permissions-Policy "geolocation=(), microphone=(), camera=()";
```

**Apache Example:**
```apache
# Apache .htaccess
Header always set X-Frame-Options "DENY"
Header always set X-Content-Type-Options "nosniff"
Header always set X-XSS-Protection "1; mode=block"
Header always set Referrer-Policy "strict-origin-when-cross-origin"
Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains"
```

---

## Security Best Practices

### For Developers

1. **Never commit sensitive data**
   - Use environment variables for all secrets
   - Keep `.env` files in `.gitignore`
   - Use `.example` files for documentation

2. **Input validation**
   - Always validate user input on both client and server
   - Use Angular's built-in validators
   - Sanitize data before display

3. **Authentication**
   - Never store passwords in plain text
   - Use JWT tokens with reasonable expiration
   - Implement token refresh mechanism
   - Validate tokens on every request

4. **Dependencies**
   - Regularly update npm packages
   - Run `npm audit` frequently
   - Review security advisories

5. **Code review**
   - Review all authentication/authorization code
   - Check for SQL injection vulnerabilities
   - Look for XSS vulnerabilities
   - Verify CSRF protection

### For Deployment

1. **HTTPS Only**
   - Always use HTTPS in production
   - Redirect HTTP to HTTPS
   - Use HSTS header

2. **Environment Variables**
   - Never expose API keys in frontend
   - Use environment-specific configs
   - Rotate secrets regularly

3. **Monitoring**
   - Log authentication failures
   - Monitor for suspicious patterns
   - Set up alerts for security events
   - Use error tracking (Sentry, etc.)

4. **Backups**
   - Regular database backups
   - Test backup restoration
   - Secure backup storage

5. **CORS Configuration**
   - Configure proper CORS policies
   - Whitelist specific origins
   - Don't use wildcard (*) in production

---

## Security Checklist

Before deploying to production:

- [ ] Environment files are not committed
- [ ] HTTPS is enforced
- [ ] Security headers are configured
- [ ] Content Security Policy is implemented
- [ ] Rate limiting is enabled on backend
- [ ] API keys are moved to backend
- [ ] Error messages don't expose sensitive info
- [ ] Authentication tokens use httpOnly cookies
- [ ] CORS is properly configured
- [ ] Dependencies are up to date
- [ ] Security monitoring is in place
- [ ] Backups are configured and tested

---

## Additional Security Measures to Consider

### 1. Two-Factor Authentication (2FA)
Implement 2FA for user accounts, especially admin accounts.

### 2. Session Management
- Implement session timeout
- Detect concurrent sessions
- Allow users to view/revoke active sessions

### 3. Password Policies
- Minimum password length (8+ characters)
- Password complexity requirements
- Password strength meter
- Prevent common passwords

### 4. Account Security
- Email verification for new accounts
- Password reset with token expiration
- Account lockout after failed attempts
- Security questions or backup codes

### 5. Audit Logging
- Log all authentication attempts
- Log sensitive operations
- Store logs securely
- Regular log review

### 6. Penetration Testing
- Regular security audits
- Third-party penetration testing
- Vulnerability scanning
- Bug bounty program

---

## Reporting Security Issues

If you discover a security vulnerability, please follow responsible disclosure:

1. **Do NOT** open a public GitHub issue
2. Email security concerns to: [security@yourdomain.com]
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

We will respond within 48 hours and work with you to address the issue.

---

## Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Angular Security Guide](https://angular.io/guide/security)
- [MDN Web Security](https://developer.mozilla.org/en-US/docs/Web/Security)
- [WooCommerce REST API Security](https://woocommerce.github.io/woocommerce-rest-api-docs/)

---

## Version History

- **v1.0** - Initial security implementation
  - XSS protection
  - Open redirect protection
  - Token encryption
  - Rate limiting
  - Secure cart handling
  - Input validation

---

## License

This security documentation is part of the Shop UI project and follows the same license.

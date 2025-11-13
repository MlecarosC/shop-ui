/**
 * Security utility functions for input validation and sanitization
 */

/**
 * Validates that a redirect URL is safe (only allows relative paths)
 * Prevents open redirect vulnerabilities
 *
 * @param url - The URL to validate
 * @returns The validated URL or a default safe URL
 */
export function validateRedirectUrl(url: string | null): string {
  const defaultUrl = '/home';

  if (!url) {
    return defaultUrl;
  }

  // Remove any whitespace
  url = url.trim();

  // Only allow relative paths that start with /
  // Reject absolute URLs, protocol-relative URLs, and javascript: URLs
  if (!url.startsWith('/') || url.startsWith('//')) {
    return defaultUrl;
  }

  // Additional check for encoded characters that could bypass the check
  const decodedUrl = decodeURIComponent(url);
  if (!decodedUrl.startsWith('/') || decodedUrl.startsWith('//')) {
    return defaultUrl;
  }

  // Reject URLs with suspicious patterns
  const suspiciousPatterns = [
    /javascript:/i,
    /data:/i,
    /vbscript:/i,
    /file:/i,
    /<script/i,
  ];

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(url) || pattern.test(decodedUrl)) {
      return defaultUrl;
    }
  }

  return url;
}

/**
 * Sanitizes text input by removing potentially dangerous characters
 *
 * @param input - The input string to sanitize
 * @returns The sanitized string
 */
export function sanitizeInput(input: string): string {
  if (!input) return '';

  // Remove null bytes
  return input.replace(/\0/g, '');
}

/**
 * Validates that a cart key is in the expected format
 *
 * @param cartKey - The cart key to validate
 * @returns True if valid, false otherwise
 */
export function validateCartKey(cartKey: string | null): boolean {
  if (!cartKey) return false;

  // Cart keys should be alphanumeric with possible dashes/underscores
  // Adjust regex based on your actual cart key format
  const cartKeyPattern = /^[a-zA-Z0-9_-]{10,100}$/;

  return cartKeyPattern.test(cartKey);
}

/**
 * Strips HTML tags from a string
 *
 * @param input - The input string
 * @returns String without HTML tags
 */
export function stripHtmlTags(input: string): string {
  if (!input) return '';

  return input.replace(/<[^>]*>/g, '');
}

/**
 * Validates email format
 *
 * @param email - Email to validate
 * @returns True if valid email format
 */
export function validateEmail(email: string): boolean {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(email);
}

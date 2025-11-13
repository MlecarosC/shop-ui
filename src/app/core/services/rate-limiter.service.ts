import { Injectable } from '@angular/core';

/**
 * Rate Limiter Service
 *
 * Provides client-side rate limiting to prevent abuse and DOS attacks.
 * This is a defense-in-depth measure; backend rate limiting is still essential.
 *
 * Use cases:
 * - Login attempts
 * - Form submissions
 * - API calls
 * - Password reset requests
 */
@Injectable({
  providedIn: 'root'
})
export class RateLimiterService {
  private attempts: Map<string, number[]> = new Map();

  /**
   * Check if an action is allowed based on rate limiting rules
   *
   * @param key - Unique identifier for the action (e.g., 'login', 'contact-form')
   * @param maxAttempts - Maximum number of attempts allowed
   * @param windowMs - Time window in milliseconds
   * @returns True if action is allowed, false if rate limited
   */
  isAllowed(key: string, maxAttempts: number, windowMs: number): boolean {
    const now = Date.now();
    const timestamps = this.attempts.get(key) || [];

    // Remove timestamps outside the window
    const recentAttempts = timestamps.filter(time => now - time < windowMs);

    if (recentAttempts.length >= maxAttempts) {
      return false;
    }

    // Add current attempt
    recentAttempts.push(now);
    this.attempts.set(key, recentAttempts);

    return true;
  }

  /**
   * Get remaining time until the rate limit resets
   *
   * @param key - Unique identifier for the action
   * @param maxAttempts - Maximum number of attempts allowed
   * @param windowMs - Time window in milliseconds
   * @returns Milliseconds until reset, or 0 if not rate limited
   */
  getTimeUntilReset(key: string, maxAttempts: number, windowMs: number): number {
    const now = Date.now();
    const timestamps = this.attempts.get(key) || [];

    const recentAttempts = timestamps.filter(time => now - time < windowMs);

    if (recentAttempts.length < maxAttempts) {
      return 0;
    }

    const oldestAttempt = Math.min(...recentAttempts);
    const resetTime = oldestAttempt + windowMs;

    return Math.max(0, resetTime - now);
  }

  /**
   * Reset the rate limiter for a specific key
   *
   * @param key - Unique identifier for the action
   */
  reset(key: string): void {
    this.attempts.delete(key);
  }

  /**
   * Clear all rate limiting data
   */
  clearAll(): void {
    this.attempts.clear();
  }

  /**
   * Get number of recent attempts for a key
   *
   * @param key - Unique identifier for the action
   * @param windowMs - Time window in milliseconds
   * @returns Number of attempts in the window
   */
  getAttemptCount(key: string, windowMs: number): number {
    const now = Date.now();
    const timestamps = this.attempts.get(key) || [];
    return timestamps.filter(time => now - time < windowMs).length;
  }
}

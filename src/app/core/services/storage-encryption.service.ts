import { Injectable } from '@angular/core';

/**
 * Storage Encryption Service
 *
 * Provides basic encryption for sensitive data stored in localStorage.
 * NOTE: This is NOT a replacement for proper security measures.
 *
 * SECURITY CONSIDERATIONS:
 * - Browser localStorage is inherently insecure (vulnerable to XSS)
 * - This encryption provides obfuscation, not true security
 * - For production, consider using httpOnly cookies for tokens
 * - Always use HTTPS to protect data in transit
 *
 * This service provides a layer of defense-in-depth but should not be
 * relied upon as the sole security measure.
 */
@Injectable({
  providedIn: 'root'
})
export class StorageEncryptionService {

  /**
   * Simple XOR-based encryption for basic obfuscation
   * NOTE: This is not cryptographically secure, just obfuscation
   *
   * For true security, tokens should be in httpOnly cookies
   */
  private simpleEncrypt(text: string, key: string): string {
    let result = '';
    for (let i = 0; i < text.length; i++) {
      const charCode = text.charCodeAt(i) ^ key.charCodeAt(i % key.length);
      result += String.fromCharCode(charCode);
    }
    return btoa(result); // Base64 encode
  }

  /**
   * Decrypt XOR-encrypted text
   */
  private simpleDecrypt(encoded: string, key: string): string {
    try {
      const text = atob(encoded); // Base64 decode
      let result = '';
      for (let i = 0; i < text.length; i++) {
        const charCode = text.charCodeAt(i) ^ key.charCodeAt(i % key.length);
        result += String.fromCharCode(charCode);
      }
      return result;
    } catch {
      return '';
    }
  }

  /**
   * Generate a device-specific key based on browser fingerprint
   * This makes the encrypted data tied to the specific browser
   */
  private getDeviceKey(): string {
    const userAgent = navigator.userAgent;
    const language = navigator.language;
    const platform = navigator.platform;
    const screenResolution = `${screen.width}x${screen.height}`;

    // Create a fingerprint from browser characteristics
    const fingerprint = `${userAgent}${language}${platform}${screenResolution}`;

    // Simple hash function
    let hash = 0;
    for (let i = 0; i < fingerprint.length; i++) {
      const char = fingerprint.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }

    return `key_${Math.abs(hash).toString(36)}`;
  }

  /**
   * Store encrypted data in localStorage
   *
   * @param key - Storage key
   * @param value - Value to encrypt and store
   */
  setSecureItem(key: string, value: string): void {
    const deviceKey = this.getDeviceKey();
    const encrypted = this.simpleEncrypt(value, deviceKey);
    localStorage.setItem(key, encrypted);
  }

  /**
   * Retrieve and decrypt data from localStorage
   *
   * @param key - Storage key
   * @returns Decrypted value or null if not found
   */
  getSecureItem(key: string): string | null {
    const encrypted = localStorage.getItem(key);
    if (!encrypted) return null;

    const deviceKey = this.getDeviceKey();
    const decrypted = this.simpleDecrypt(encrypted, deviceKey);

    return decrypted || null;
  }

  /**
   * Remove item from localStorage
   *
   * @param key - Storage key
   */
  removeSecureItem(key: string): void {
    localStorage.removeItem(key);
  }

  /**
   * Clear all items from localStorage
   */
  clearSecureStorage(): void {
    localStorage.clear();
  }

  /**
   * Store JSON object encrypted
   *
   * @param key - Storage key
   * @param value - Object to store
   */
  setSecureJson<T>(key: string, value: T): void {
    const json = JSON.stringify(value);
    this.setSecureItem(key, json);
  }

  /**
   * Retrieve and parse encrypted JSON object
   *
   * @param key - Storage key
   * @returns Parsed object or null
   */
  getSecureJson<T>(key: string): T | null {
    const json = this.getSecureItem(key);
    if (!json) return null;

    try {
      return JSON.parse(json) as T;
    } catch {
      return null;
    }
  }
}

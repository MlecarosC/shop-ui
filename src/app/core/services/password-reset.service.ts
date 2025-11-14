import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
  PasswordResetRequest,
  PasswordResetResponse,
  PasswordResetValidationRequest,
  PasswordResetValidationResponse
} from '@core/models';

/**
 * Reset Request State
 * Tracks the current state of password reset process
 */
interface ResetState {
  email: string | null;
  codeRequested: boolean;
  codeValidated: boolean;
}

/**
 * Password Reset Service
 *
 * Handles password reset functionality using BetterDPWR (Better Default Password Reset) plugin.
 * Provides a three-step process: request code, validate code, set new password.
 */
@Injectable({
  providedIn: 'root'
})
export class PasswordResetService {
  // Signal to track reset state
  private readonly resetState = signal<ResetState>({
    email: null,
    codeRequested: false,
    codeValidated: false
  });

  // Public computed signals
  public readonly currentEmail = signal<string | null>(null);
  public readonly isCodeRequested = signal<boolean>(false);
  public readonly isCodeValidated = signal<boolean>(false);

  constructor(private http: HttpClient) {}

  /**
   * Request password reset code
   * Sends a reset code to the user's email address
   *
   * @param email - User's email address
   * @returns Observable with response indicating if email was sent
   */
  requestPasswordReset(email: string): Observable<PasswordResetResponse> {
    const url = `${environment.passwordReset.url}/reset-password`;
    const headers = this.getHeaders();

    const body: PasswordResetRequest = { email };

    return this.http.post<PasswordResetResponse>(url, body, { headers }).pipe(
      tap((response) => {
        if (response.code === 'success' || response.code === 'email_sent') {
          // Update state to indicate code was requested
          this.currentEmail.set(email);
          this.isCodeRequested.set(true);
          this.isCodeValidated.set(false);

          this.resetState.set({
            email,
            codeRequested: true,
            codeValidated: false
          });
        }
      }),
      map((response) => {
        // Validate response
        if (response.code === 'success' || response.code === 'email_sent') {
          return response;
        } else {
          throw new Error(response.message || 'Failed to send reset code.');
        }
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Validate reset code
   * Checks if the provided code is valid for the email
   *
   * @param email - User's email address
   * @param code - Reset code received via email
   * @returns Observable with validation result
   */
  validateCode(email: string, code: string): Observable<boolean> {
    const url = `${environment.passwordReset.url}/validate-code`;
    const headers = this.getHeaders();

    const body = { email, code };

    return this.http.post<PasswordResetValidationResponse>(url, body, { headers }).pipe(
      tap((response) => {
        if (response.code === 'success' || response.code === 'code_valid') {
          // Update state to indicate code is validated
          this.isCodeValidated.set(true);

          const state = this.resetState();
          this.resetState.set({
            ...state,
            codeValidated: true
          });
        }
      }),
      map((response) => {
        return response.code === 'success' || response.code === 'code_valid';
      }),
      catchError((error) => {
        console.error('Code validation error:', error);
        return throwError(() => new Error('Invalid or expired reset code.'));
      })
    );
  }

  /**
   * Set new password after code validation
   * Completes the password reset process
   *
   * @param email - User's email address
   * @param code - Validated reset code
   * @param password - New password
   * @returns Observable with response indicating if password was changed
   */
  setNewPassword(email: string, code: string, password: string): Observable<PasswordResetValidationResponse> {
    const url = `${environment.passwordReset.url}/set-password`;
    const headers = this.getHeaders();

    const body: PasswordResetValidationRequest = {
      email,
      code,
      password
    };

    return this.http.post<PasswordResetValidationResponse>(url, body, { headers }).pipe(
      tap((response) => {
        if (response.code === 'success' || response.code === 'password_reset') {
          // Clear reset state after successful password reset
          this.clearResetState();
        }
      }),
      map((response) => {
        if (response.code === 'success' || response.code === 'password_reset') {
          return response;
        } else {
          throw new Error(response.message || 'Failed to reset password.');
        }
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Complete password reset process
   * Combines validation and password setting in one call
   *
   * @param email - User's email address
   * @param code - Reset code
   * @param newPassword - New password
   * @returns Observable with response
   */
  resetPassword(email: string, code: string, newPassword: string): Observable<PasswordResetValidationResponse> {
    return this.validateCode(email, code).pipe(
      catchError((error) => {
        return throwError(() => new Error('Invalid or expired reset code.'));
      }),
      // If validation succeeds, set new password
      tap((isValid) => {
        if (!isValid) {
          throw new Error('Invalid or expired reset code.');
        }
      }),
      // Switch to setNewPassword call
      map(() => email),
      catchError((error) => throwError(() => error)),
      // Set new password
      tap(() => {}),
      // Return the final observable
      map(() => this.setNewPassword(email, code, newPassword)),
      // Flatten nested observable
      catchError(this.handleError)
    ) as any;
  }

  /**
   * Validate password strength
   *
   * @param password - Password to validate
   * @returns Object with validation result and strength
   */
  validatePasswordStrength(password: string): {
    isValid: boolean;
    strength: 'weak' | 'medium' | 'strong' | 'very-strong';
    errors: string[];
  } {
    const errors: string[] = [];
    let strength: 'weak' | 'medium' | 'strong' | 'very-strong' = 'weak';

    // Minimum length check
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }

    // Check for uppercase letters
    const hasUppercase = /[A-Z]/.test(password);
    if (!hasUppercase) {
      errors.push('Password must contain at least one uppercase letter');
    }

    // Check for lowercase letters
    const hasLowercase = /[a-z]/.test(password);
    if (!hasLowercase) {
      errors.push('Password must contain at least one lowercase letter');
    }

    // Check for numbers
    const hasNumbers = /\d/.test(password);
    if (!hasNumbers) {
      errors.push('Password must contain at least one number');
    }

    // Check for special characters
    const hasSpecialChars = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

    // Calculate strength
    let strengthScore = 0;
    if (password.length >= 8) strengthScore++;
    if (password.length >= 12) strengthScore++;
    if (hasUppercase) strengthScore++;
    if (hasLowercase) strengthScore++;
    if (hasNumbers) strengthScore++;
    if (hasSpecialChars) strengthScore++;

    if (strengthScore <= 2) {
      strength = 'weak';
    } else if (strengthScore <= 4) {
      strength = 'medium';
    } else if (strengthScore <= 5) {
      strength = 'strong';
    } else {
      strength = 'very-strong';
    }

    return {
      isValid: errors.length === 0,
      strength,
      errors
    };
  }

  /**
   * Check if passwords match
   *
   * @param password - Password
   * @param confirmPassword - Confirmation password
   * @returns Boolean indicating if passwords match
   */
  doPasswordsMatch(password: string, confirmPassword: string): boolean {
    return password === confirmPassword && password.length > 0;
  }

  /**
   * Get current reset state
   *
   * @returns Current reset state
   */
  getResetState(): ResetState {
    return this.resetState();
  }

  /**
   * Clear reset state
   * Called after successful password reset or when user cancels
   */
  clearResetState(): void {
    this.currentEmail.set(null);
    this.isCodeRequested.set(false);
    this.isCodeValidated.set(false);

    this.resetState.set({
      email: null,
      codeRequested: false,
      codeValidated: false
    });
  }

  /**
   * Check if email is valid format
   *
   * @param email - Email address to validate
   * @returns Boolean indicating if email is valid
   */
  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Get HTTP headers for password reset API
   *
   * @returns HttpHeaders object
   */
  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json'
    });
  }

  /**
   * Handle HTTP errors
   *
   * @param error - HTTP error response
   * @returns Observable error with safe message
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An error occurred during password reset. Please try again.';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = 'A network error occurred. Please check your connection.';
    } else if (error.error instanceof ProgressEvent) {
      // Network error (e.g., CORS, connection refused)
      errorMessage = 'Unable to reach the server. Please check your connection and try again.';
    } else {
      // Server-side error
      switch (error.status) {
        case 400:
          errorMessage = error.error?.message || 'Invalid request. Please check your information.';
          break;
        case 404:
          errorMessage = 'User not found. Please check your email address.';
          break;
        case 429:
          errorMessage = 'Too many requests. Please wait a moment and try again.';
          break;
        case 500:
          errorMessage = 'A server error occurred. Please try again later.';
          break;
        case 503:
          errorMessage = 'Service temporarily unavailable. Please try again later.';
          break;
        default:
          if (error.error?.message) {
            errorMessage = error.error.message;
          } else if (error.message) {
            errorMessage = error.message;
          }
      }
    }

    console.error('Password Reset Service Error:', error);
    return throwError(() => new Error(errorMessage));
  }
}

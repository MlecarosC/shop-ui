import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ContactFormRequest, ContactFormResponse } from '@core/models';

/**
 * Contact Service
 *
 * Handles contact form submission using Contact Form 7 REST API.
 * Provides methods for sending contact form data and handling responses.
 */
@Injectable({
  providedIn: 'root'
})
export class ContactService {
  constructor(private http: HttpClient) {}

  /**
   * Send contact form submission
   *
   * @param formData - Contact form data
   * @returns Observable with form submission response
   */
  sendContactForm(formData: ContactFormRequest): Observable<ContactFormResponse> {
    const url = `${environment.contactForm.url}/contact-forms/${environment.contactForm.formId}/feedback`;
    const headers = this.getHeaders();

    // Convert form data to FormData format expected by Contact Form 7
    const body = this.buildFormData(formData);

    return this.http.post<ContactFormResponse>(url, body, { headers }).pipe(
      map((response) => {
        // Validate response status
        if (response.status === 'mail_sent') {
          return response;
        } else if (response.status === 'validation_failed') {
          throw new Error('Please check your form inputs and try again.');
        } else if (response.status === 'mail_failed') {
          throw new Error('Failed to send message. Please try again later.');
        } else if (response.status === 'spam') {
          throw new Error('Your message was flagged as spam. Please contact us directly.');
        } else {
          throw new Error(response.message || 'An error occurred. Please try again.');
        }
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Send simplified contact form with name, email, and message
   *
   * @param name - Sender's name
   * @param email - Sender's email
   * @param message - Message content
   * @param subject - Optional subject line
   * @returns Observable with form submission response
   */
  sendSimpleContactForm(
    name: string,
    email: string,
    message: string,
    subject?: string
  ): Observable<ContactFormResponse> {
    const formData: ContactFormRequest = {
      name,
      email,
      message,
      subject
    };

    return this.sendContactForm(formData);
  }

  /**
   * Send contact form with additional fields
   *
   * @param name - Sender's name
   * @param email - Sender's email
   * @param message - Message content
   * @param phone - Optional phone number
   * @param company - Optional company name
   * @param subject - Optional subject line
   * @returns Observable with form submission response
   */
  sendDetailedContactForm(
    name: string,
    email: string,
    message: string,
    phone?: string,
    company?: string,
    subject?: string
  ): Observable<ContactFormResponse> {
    const formData: ContactFormRequest = {
      name,
      email,
      message,
      phone,
      company,
      subject
    };

    return this.sendContactForm(formData);
  }

  /**
   * Validate email format
   *
   * @param email - Email address to validate
   * @returns Boolean indicating if email is valid
   */
  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate phone format (basic validation)
   *
   * @param phone - Phone number to validate
   * @returns Boolean indicating if phone is valid
   */
  isValidPhone(phone: string): boolean {
    // Remove common phone formatting characters
    const cleaned = phone.replace(/[\s\-\(\)\+]/g, '');
    // Check if remaining characters are digits and length is reasonable
    return /^\d{7,15}$/.test(cleaned);
  }

  /**
   * Build FormData object from contact form request
   * Contact Form 7 expects FormData format
   *
   * @param formData - Contact form request data
   * @returns FormData object
   */
  private buildFormData(formData: ContactFormRequest): FormData {
    const body = new FormData();

    // Map common field names to Contact Form 7 field names
    // Adjust these field names based on your Contact Form 7 configuration
    if (formData.name) {
      body.append('your-name', formData.name);
    }

    if (formData.email) {
      body.append('your-email', formData.email);
    }

    if (formData.subject) {
      body.append('your-subject', formData.subject);
    }

    if (formData.message) {
      body.append('your-message', formData.message);
    }

    if (formData.phone) {
      body.append('your-phone', formData.phone);
    }

    if (formData.company) {
      body.append('your-company', formData.company);
    }

    return body;
  }

  /**
   * Get HTTP headers for Contact Form 7 API
   * Note: Contact Form 7 expects FormData, so Content-Type is not set
   *
   * @returns HttpHeaders object
   */
  private getHeaders(): HttpHeaders {
    // Don't set Content-Type for FormData - browser will set it automatically with boundary
    return new HttpHeaders();
  }

  /**
   * Handle HTTP errors
   *
   * @param error - HTTP error response
   * @returns Observable error with safe message
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An error occurred while sending your message. Please try again.';

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
          errorMessage = 'Invalid form data. Please check your inputs and try again.';
          break;
        case 404:
          errorMessage = 'Contact form not found. Please contact us directly.';
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

    console.error('Contact Service Error:', error);
    return throwError(() => new Error(errorMessage));
  }
}

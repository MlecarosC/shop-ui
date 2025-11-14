import { Injectable, signal, computed, effect } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError, of, BehaviorSubject } from 'rxjs';
import { map, catchError, tap, switchMap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
  WCAuthRequest,
  WCAuthResponse,
  WCRegistrationRequest,
  WCRegistrationResponse,
  WCTokenValidationResponse,
  WCCustomer,
  WCUpdateCustomerRequest,
  WCOrder
} from '@core/models';

/**
 * Authentication Service
 *
 * Handles user authentication using JWT tokens from WordPress/WooCommerce.
 * Manages user session state with Angular signals for reactive updates.
 * Provides methods for login, registration, token validation, and profile management.
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Storage keys
  private readonly AUTH_TOKEN_KEY = 'auth_token';
  private readonly USER_DATA_KEY = 'user_data';

  // Signals for reactive state management
  public readonly authToken = signal<string | null>(this.getStoredToken());
  public readonly currentUser = signal<WCCustomer | null>(this.getStoredUser());
  public readonly isAuthenticated = computed(() => !!this.authToken() && !!this.currentUser());

  constructor(private http: HttpClient) {
    // Effect to sync token changes with localStorage
    effect(() => {
      const token = this.authToken();
      if (token) {
        localStorage.setItem(this.AUTH_TOKEN_KEY, token);
      } else {
        localStorage.removeItem(this.AUTH_TOKEN_KEY);
      }
    });

    // Effect to sync user changes with localStorage
    effect(() => {
      const user = this.currentUser();
      if (user) {
        localStorage.setItem(this.USER_DATA_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(this.USER_DATA_KEY);
      }
    });

    // Initialize authentication state on service creation
    this.initializeAuth();
  }

  /**
   * Initialize authentication state from stored data
   * Validates stored token on app startup
   */
  private initializeAuth(): void {
    const token = this.getStoredToken();
    if (token) {
      this.validateToken().subscribe({
        next: (isValid) => {
          if (!isValid) {
            this.logout();
          }
        },
        error: () => {
          this.logout();
        }
      });
    }
  }

  /**
   * Authenticate user with username and password
   *
   * @param username - User's username or email
   * @param password - User's password
   * @returns Observable with authentication response
   */
  login(username: string, password: string): Observable<WCAuthResponse> {
    const url = `${environment.jwt.url}/token`;
    const body: WCAuthRequest = { username, password };

    return this.http.post<WCAuthResponse>(url, body).pipe(
      tap((response) => {
        // Store token and update signal
        this.authToken.set(response.token);

        // Fetch full user data
        this.fetchCurrentUser().subscribe({
          next: (user) => {
            this.currentUser.set(user);
          },
          error: (error) => {
            console.error('Error fetching user data:', error);
          }
        });
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Register a new user account
   *
   * @param registrationData - User registration data
   * @returns Observable with registration response
   */
  register(registrationData: WCRegistrationRequest): Observable<WCRegistrationResponse> {
    const url = `${environment.woocommerce.url}/customers`;

    // Note: In production, customer creation should go through a secure backend endpoint
    // that handles WooCommerce authentication properly
    const headers = this.getWooCommerceHeaders();

    return this.http.post<WCRegistrationResponse>(url, registrationData, { headers }).pipe(
      tap((response) => {
        // After successful registration, automatically log in the user
        this.login(registrationData.username, registrationData.password).subscribe();
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Validate the current JWT token
   *
   * @returns Observable with validation result (true if valid, false if invalid)
   */
  validateToken(): Observable<boolean> {
    const token = this.authToken();

    if (!token) {
      return of(false);
    }

    const url = `${environment.jwt.url}/token/validate`;
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.post<WCTokenValidationResponse>(url, {}, { headers }).pipe(
      map((response) => {
        return response.code === 'jwt_auth_valid_token';
      }),
      catchError(() => of(false))
    );
  }

  /**
   * Fetch current user data from WooCommerce
   *
   * @returns Observable with current user data
   */
  private fetchCurrentUser(): Observable<WCCustomer> {
    const token = this.authToken();

    if (!token) {
      return throwError(() => new Error('No authentication token available'));
    }

    // Decode JWT to get user ID (JWT format: header.payload.signature)
    const payload = this.decodeJWT(token);
    const userId = payload?.data?.user?.id;

    if (!userId) {
      return throwError(() => new Error('Invalid token payload'));
    }

    const url = `${environment.woocommerce.url}/customers/${userId}`;
    const headers = this.getAuthHeaders();

    return this.http.get<WCCustomer>(url, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Get current user data
   * Returns the signal value, or fetches from server if not available
   *
   * @returns Observable with current user data
   */
  getCurrentUser(): Observable<WCCustomer | null> {
    const user = this.currentUser();

    if (user) {
      return of(user);
    }

    const token = this.authToken();
    if (!token) {
      return of(null);
    }

    return this.fetchCurrentUser().pipe(
      tap((fetchedUser) => {
        this.currentUser.set(fetchedUser);
      }),
      catchError(() => of(null))
    );
  }

  /**
   * Update current user profile
   *
   * @param updateData - User data to update
   * @returns Observable with updated user data
   */
  updateProfile(updateData: WCUpdateCustomerRequest): Observable<WCCustomer> {
    const user = this.currentUser();

    if (!user) {
      return throwError(() => new Error('No authenticated user'));
    }

    const url = `${environment.woocommerce.url}/customers/${user.id}`;
    const headers = this.getAuthHeaders();

    return this.http.put<WCCustomer>(url, updateData, { headers }).pipe(
      tap((updatedUser) => {
        this.currentUser.set(updatedUser);
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Check if user has purchased a specific product
   *
   * @param productId - Product ID to check
   * @returns Observable with boolean result
   */
  hasUserPurchasedProduct(productId: number): Observable<boolean> {
    const user = this.currentUser();

    if (!user) {
      return of(false);
    }

    const url = `${environment.woocommerce.url}/orders`;
    const headers = this.getAuthHeaders();
    const params = {
      customer: user.id.toString(),
      status: 'completed',
      per_page: '100'
    };

    return this.http.get<WCOrder[]>(url, { headers, params }).pipe(
      map((orders) => {
        // Check if any completed order contains the product
        return orders.some(order =>
          order.line_items.some(item => item.product_id === productId)
        );
      }),
      catchError(() => of(false))
    );
  }

  /**
   * Log out current user
   * Clears authentication state and stored data
   */
  logout(): void {
    this.authToken.set(null);
    this.currentUser.set(null);
    localStorage.removeItem(this.AUTH_TOKEN_KEY);
    localStorage.removeItem(this.USER_DATA_KEY);
  }

  /**
   * Get stored authentication token from localStorage
   *
   * @returns Stored token or null
   */
  private getStoredToken(): string | null {
    if (typeof window !== 'undefined' && window.localStorage) {
      return localStorage.getItem(this.AUTH_TOKEN_KEY);
    }
    return null;
  }

  /**
   * Get stored user data from localStorage
   *
   * @returns Stored user data or null
   */
  private getStoredUser(): WCCustomer | null {
    if (typeof window !== 'undefined' && window.localStorage) {
      const userData = localStorage.getItem(this.USER_DATA_KEY);
      if (userData) {
        try {
          return JSON.parse(userData);
        } catch {
          return null;
        }
      }
    }
    return null;
  }

  /**
   * Decode JWT token payload
   *
   * @param token - JWT token to decode
   * @returns Decoded payload or null
   */
  private decodeJWT(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch {
      return null;
    }
  }

  /**
   * Get HTTP headers with JWT authentication
   *
   * @returns HttpHeaders with Authorization
   */
  private getAuthHeaders(): HttpHeaders {
    const token = this.authToken();
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    return headers;
  }

  /**
   * Get HTTP headers with WooCommerce authentication
   * WARNING: This should only be used for read operations in production
   * Write operations should go through a secure backend
   *
   * @returns HttpHeaders with WooCommerce auth
   */
  private getWooCommerceHeaders(): HttpHeaders {
    const auth = btoa(`${environment.woocommerce.consumerKey}:${environment.woocommerce.consumerSecret}`);
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Basic ${auth}`
    });
  }

  /**
   * Handle HTTP errors
   *
   * @param error - HTTP error response
   * @returns Observable error with safe message
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An error occurred. Please try again.';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = 'A network error occurred. Please check your connection.';
    } else {
      // Server-side error
      switch (error.status) {
        case 401:
          errorMessage = 'Invalid credentials. Please try again.';
          break;
        case 403:
          errorMessage = 'Access denied. Please check your permissions.';
          break;
        case 404:
          errorMessage = 'The requested resource was not found.';
          break;
        case 500:
          errorMessage = 'A server error occurred. Please try again later.';
          break;
        default:
          if (error.error?.message) {
            errorMessage = error.error.message;
          }
      }
    }

    console.error('Authentication Error:', error);
    return throwError(() => new Error(errorMessage));
  }
}

import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap, catchError, of, map } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { WCUser, WCAuthResponse } from '../models/woocommerce/wc-user.model';
import { StorageEncryptionService } from './storage-encryption.service';

@Injectable({
  providedIn: 'root'
})
export class AuthApiService {
  private http = inject(HttpClient);
  private storage = inject(StorageEncryptionService);
  private baseUrl = environment.apiUrl;

  private currentUser = signal<WCUser | null>(null);
  private isAuthenticated = signal<boolean>(false);
  private authToken = signal<string | null>(null);

  constructor() {
    this.checkStoredAuth();
  }

  private checkStoredAuth(): void {
    // Use encrypted storage for sensitive auth data
    const token = this.storage.getSecureItem('auth_token');
    const user = this.storage.getSecureJson<WCUser>('current_user');

    if (token && user) {
      this.authToken.set(token);
      this.currentUser.set(user);
      this.isAuthenticated.set(true);

      this.validateToken().subscribe();
    }
  }

  login(username: string, password: string): Observable<WCAuthResponse> {
    const url = `${this.baseUrl}/jwt-auth/v1/token`;

    return this.http.post<WCAuthResponse>(url, { username, password }).pipe(
      tap(response => {
        this.authToken.set(response.token);
        this.isAuthenticated.set(true);
        // Store token encrypted
        this.storage.setSecureItem('auth_token', response.token);

        const user: WCUser = {
          id: 0,
          username: response.user_nicename,
          name: response.user_display_name,
          first_name: '',
          last_name: '',
          email: response.user_email,
          url: '',
          description: '',
          link: '',
          locale: '',
          nickname: response.user_nicename,
          slug: response.user_nicename,
          registered_date: '',
          roles: [],
          capabilities: {},
          extra_capabilities: {},
          avatar_urls: { 24: '', 48: '', 96: '' },
          meta: [],
          billing: {
            first_name: '',
            last_name: '',
            company: '',
            address_1: '',
            address_2: '',
            city: '',
            state: '',
            postcode: '',
            country: '',
            email: response.user_email,
            phone: ''
          },
          shipping: {
            first_name: '',
            last_name: '',
            company: '',
            address_1: '',
            address_2: '',
            city: '',
            state: '',
            postcode: '',
            country: '',
            email: '',
            phone: ''
          },
          is_paying_customer: false,
          avatar_url: ''
        };

        this.currentUser.set(user);
        // Store user data encrypted
        this.storage.setSecureJson('current_user', user);
      })
    );
  }

  register(userData: {
    username: string;
    email: string;
    password: string;
    first_name?: string;
    last_name?: string;
  }): Observable<WCUser> {
    const url = `${environment.woocommerce.url}/customers`;
    
    return this.http.post<WCUser>(url, userData).pipe(
      tap(user => {
        this.login(userData.username, userData.password).subscribe();
      })
    );
  }

  getCurrentUser(): Observable<WCUser | null> {
    const token = this.authToken();
    if (!token) {
      return of(null);
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    const url = `${this.baseUrl}/wp/v2/users/me`;
    
    return this.http.get<WCUser>(url, { headers }).pipe(
      tap(user => {
        this.currentUser.set(user);
        this.storage.setSecureJson('current_user', user);
      }),
      catchError((error) => {
        // Don't log full error details that might contain sensitive data
        return of(this.currentUser());
      })
    );
  }

  validateToken(): Observable<any> {
    const token = this.authToken();
    if (!token) {
      return of({ valid: false });
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    const url = `${this.baseUrl}/jwt-auth/v1/token/validate`;

    return this.http.post(url, {}, { headers }).pipe(
      catchError((error) => {
        // Token validation failed, logout user
        this.logout();
        return of({ valid: false });
      })
    );
  }

  updateProfile(userId: number, userData: Partial<WCUser>): Observable<WCUser> {
    const token = this.authToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    const url = `${environment.woocommerce.url}/customers/${userId}`;

    return this.http.put<WCUser>(url, userData, { headers }).pipe(
      tap(user => {
        this.currentUser.set(user);
        this.storage.setSecureJson('current_user', user);
      })
    );
  }

  logout(): void {
    this.authToken.set(null);
    this.currentUser.set(null);
    this.isAuthenticated.set(false);

    // Clear encrypted storage
    this.storage.removeSecureItem('auth_token');
    this.storage.removeSecureItem('current_user');
    localStorage.removeItem('cart_key');
  }

  hasUserPurchasedProduct(productId: number): Observable<boolean> {
    const userId = this.currentUser()?.id;
    if (!userId) {
      return of(false);
    }

    const url = `${environment.woocommerce.url}/orders`;
    const params = {
      customer: userId.toString(),
      status: 'completed',
      per_page: '100'
    };

    return this.http.get<any[]>(url, { params }).pipe(
      map(orders => {
        const hasPurchased = orders.some(order => 
          order.line_items.some((item: any) => item.product_id === productId)
        );
        return hasPurchased;
      }),
      catchError(() => of(false))
    );
  }

  getAuthHeaders(): HttpHeaders {
    const token = this.authToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  getCurrentUserSignal() {
    return this.currentUser;
  }

  getIsAuthenticatedSignal() {
    return this.isAuthenticated;
  }

  getAuthTokenSignal() {
    return this.authToken;
  }
}

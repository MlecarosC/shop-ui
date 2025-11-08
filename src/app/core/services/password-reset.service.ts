import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';

interface PasswordResetResponse {
  data: {
    status: number;
  };
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class PasswordResetService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/bdpwr/v1`;

  requestPasswordReset(email: string): Observable<PasswordResetResponse> {
    return this.http.post<PasswordResetResponse>(`${this.baseUrl}/reset-password`, { email });
  }

  validateCode(email: string, code: string): Observable<PasswordResetResponse> {
    return this.http.post<PasswordResetResponse>(`${this.baseUrl}/validate-code`, { email, code });
  }

  setNewPassword(email: string, code: string, password: string): Observable<PasswordResetResponse> {
    return this.http.post<PasswordResetResponse>(`${this.baseUrl}/set-password`, { 
      email, 
      code, 
      password 
    });
  }
}

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';

interface ContactFormResponse {
  contact_form_id: number;
  status: string;
  message: string;
  posted_data_hash?: string;
  invalid_fields?: Array<{
    field: string;
    message: string;
  }>;
}

@Injectable({
  providedIn: 'root'
})
export class ContactService {
  private http = inject(HttpClient);
  private formId = 3589;
  private apiUrl = `${environment.apiUrl}/contact-form-7/v1/contact-forms/${this.formId}/feedback`;

  sendContactForm(data: {
    firstName: string;
    lastName: string;
    email: string;
    message: string;
  }): Observable<ContactFormResponse> {
    const formData = new FormData();
    formData.append('first-name', data.firstName);
    formData.append('last-name', data.lastName);
    formData.append('your-email', data.email);
    formData.append('your-message', data.message);

    return this.http.post<ContactFormResponse>(this.apiUrl, formData);
  }
}

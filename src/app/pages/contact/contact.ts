import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ContactService } from '../../core/services/contact.service';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './contact.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Contact {
  private fb = inject(FormBuilder);
  private contactService = inject(ContactService);

  contactForm: FormGroup;
  isLoading = signal(false);
  successMessage = signal<string | null>(null);
  errorMessage = signal<string | null>(null);

  constructor() {
    this.contactForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2), this.nameValidator]],
      lastName: ['', [Validators.required, Validators.minLength(2), this.nameValidator]],
      email: ['', [Validators.required, Validators.email]],
      message: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  nameValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) {
      return null;
    }
    
    const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'-]+$/;
    
    if (!nameRegex.test(control.value)) {
      return { invalidName: true };
    }
    
    return null;
  }

  onSubmit(): void {
    if (this.contactForm.invalid) {
      Object.keys(this.contactForm.controls).forEach(key => {
        this.contactForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    const formData = {
      firstName: this.contactForm.value.firstName,
      lastName: this.contactForm.value.lastName,
      email: this.contactForm.value.email,
      message: this.contactForm.value.message
    };

    this.contactService.sendContactForm(formData).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        
        if (response.status === 'mail_sent') {
          this.successMessage.set('¡Mensaje enviado! Te responderemos pronto.');
          this.contactForm.reset();
        } else if (response.status === 'validation_failed') {
          this.errorMessage.set('Por favor verifica los campos del formulario.');
        } else {
          this.errorMessage.set(response.message || 'Error al enviar el mensaje.');
        }
      },
      error: (error) => {
        this.isLoading.set(false);
        this.errorMessage.set('Error al enviar el mensaje. Por favor, intenta de nuevo.');
        console.error('Contact form error:', error);
      }
    });
  }

  get firstName() {
    return this.contactForm.get('firstName');
  }

  get lastName() {
    return this.contactForm.get('lastName');
  }

  get email() {
    return this.contactForm.get('email');
  }

  get message() {
    return this.contactForm.get('message');
  }
}

import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ContactService } from '@core/services/contact.service';
import { ToastService } from '@shared/services/toast.service';
import { CustomValidators } from '@shared/validators';

/**
 * Contact Page Component
 *
 * Displays a contact form with:
 * - Name, email, subject, and message fields
 * - Custom validators (latinCharacters, email)
 * - Form validation and error handling
 * - Loading state during submission
 * - Success/error notifications via ToastService
 * - Contact information display (address, phone, email, hours)
 * - Google Maps embed or placeholder
 *
 * @example
 * Route: /contact
 */
@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule
  ],
  templateUrl: './contact.component.html'
})
export class ContactComponent implements OnInit {
  /** Inject services */
  private readonly fb = inject(FormBuilder);
  private readonly contactService = inject(ContactService);
  private readonly toastService = inject(ToastService);

  /** Contact form */
  public contactForm!: FormGroup;

  /** Loading state signal */
  public readonly isSubmitting = signal<boolean>(false);

  /** Success state signal */
  public readonly submissionSuccess = signal<boolean>(false);

  /**
   * Contact information
   */
  public readonly contactInfo = {
    address: 'Av. Libertador Bernardo O\'Higgins 123, Santiago, Chile',
    phone: '+56 2 1234 5678',
    email: 'contacto@empresa.cl',
    hours: 'Lunes a Viernes: 9:00 - 18:00\nSábado: 10:00 - 14:00'
  };

  ngOnInit(): void {
    this.initializeForm();
  }

  /**
   * Initialize contact form with validators
   */
  private initializeForm(): void {
    this.contactForm = this.fb.group({
      name: ['', [Validators.required, CustomValidators.latinCharacters()]],
      email: ['', [Validators.required, CustomValidators.email()]],
      subject: ['', [Validators.required, Validators.minLength(3)]],
      message: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  /**
   * Submit contact form
   */
  submitForm(): void {
    // Validate form
    if (this.contactForm.invalid) {
      this.markFormGroupTouched(this.contactForm);
      this.toastService.error('Por favor completa todos los campos correctamente', 4000);
      this.scrollToFirstError();
      return;
    }

    this.isSubmitting.set(true);

    const formValue = this.contactForm.value;

    this.contactService.sendSimpleContactForm(
      formValue.name,
      formValue.email,
      formValue.message,
      formValue.subject
    ).subscribe({
      next: (response) => {
        console.log('Contact form submitted successfully:', response);
        this.toastService.success('¡Mensaje enviado exitosamente! Te responderemos pronto.', 4000);
        this.submissionSuccess.set(true);
        this.contactForm.reset();
        this.isSubmitting.set(false);

        // Reset success state after 5 seconds
        setTimeout(() => {
          this.submissionSuccess.set(false);
        }, 5000);
      },
      error: (error) => {
        console.error('Error submitting contact form:', error);
        this.toastService.error(
          this.getSafeErrorMessage(error),
          5000
        );
        this.isSubmitting.set(false);
      }
    });
  }

  /**
   * Get safe error message from error object
   *
   * @param error - Error object
   * @returns Safe error message
   */
  private getSafeErrorMessage(error: any): string {
    if (error?.message) {
      return error.message;
    }
    return 'Error al enviar el mensaje. Por favor, intenta nuevamente.';
  }

  /**
   * Mark all form controls as touched to show validation errors
   *
   * @param formGroup - Form group to mark
   */
  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  /**
   * Scroll to first form error
   */
  private scrollToFirstError(): void {
    const firstErrorElement = document.querySelector('.input-error, .textarea-error');
    if (firstErrorElement) {
      firstErrorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  /**
   * Get form control error message
   *
   * @param controlName - Form control name
   * @param fieldName - Display name for field
   * @returns Error message or null
   */
  getErrorMessage(controlName: string, fieldName: string): string | null {
    const control = this.contactForm.get(controlName);
    return CustomValidators.getErrorMessage(control, fieldName);
  }

  /**
   * Check if form control has error and is touched
   *
   * @param controlName - Form control name
   * @returns Boolean indicating if control has visible error
   */
  hasError(controlName: string): boolean {
    const control = this.contactForm.get(controlName);
    return !!(control && control.invalid && control.touched);
  }

  /**
   * Get form control value
   *
   * @param controlName - Form control name
   * @returns Control value
   */
  getControlValue(controlName: string): string {
    return this.contactForm.get(controlName)?.value || '';
  }
}

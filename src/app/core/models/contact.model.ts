/**
 * Contact Form Submission Request
 */
export interface ContactFormRequest {
  name: string;
  email: string;
  subject?: string;
  message: string;
  phone?: string;
  company?: string;
}

/**
 * Contact Form 7 Response
 */
export interface ContactFormResponse {
  status: 'mail_sent' | 'mail_failed' | 'validation_failed' | 'spam' | 'aborted' | 'invalid';
  message: string;
  posted_data_hash?: string;
  into?: string;
  invalid_fields?: ContactFormInvalidField[];
}

/**
 * Contact Form Invalid Field
 */
export interface ContactFormInvalidField {
  field: string;
  message: string;
  idref: string | null;
  error_id: string;
}

/**
 * Contact Form Field
 */
export interface ContactFormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'tel' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'file';
  required: boolean;
  placeholder?: string;
  options?: string[];
  validation?: ContactFormFieldValidation;
}

/**
 * Contact Form Field Validation
 */
export interface ContactFormFieldValidation {
  required?: boolean;
  email?: boolean;
  phone?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  customValidator?: (value: any) => boolean;
}

/**
 * Contact Form Configuration
 */
export interface ContactFormConfig {
  formId: number;
  title: string;
  fields: ContactFormField[];
  submitButtonText?: string;
  successMessage?: string;
  errorMessage?: string;
}

/**
 * Contact Information
 */
export interface ContactInfo {
  email: string;
  phone?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  socialMedia?: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
    youtube?: string;
  };
  businessHours?: {
    monday?: string;
    tuesday?: string;
    wednesday?: string;
    thursday?: string;
    friday?: string;
    saturday?: string;
    sunday?: string;
  };
}

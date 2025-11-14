import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Custom Form Validators
 *
 * Provides custom validation functions for reactive forms.
 * All validators follow Angular's ValidatorFn pattern.
 */

/**
 * Validates password strength
 *
 * Requirements:
 * - Minimum 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 *
 * @returns Validator function
 *
 * @example
 * ```typescript
 * this.passwordControl = new FormControl('', [
 *   Validators.required,
 *   CustomValidators.passwordStrength()
 * ]);
 * ```
 */
export function passwordStrength(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;

    if (!value) {
      return null; // Don't validate empty values (use Validators.required for that)
    }

    const errors: ValidationErrors = {};

    // Check minimum length (8 characters)
    if (value.length < 8) {
      errors['minLength'] = {
        requiredLength: 8,
        actualLength: value.length
      };
    }

    // Check for uppercase letter
    if (!/[A-Z]/.test(value)) {
      errors['requiresUppercase'] = true;
    }

    // Check for lowercase letter
    if (!/[a-z]/.test(value)) {
      errors['requiresLowercase'] = true;
    }

    // Check for number
    if (!/\d/.test(value)) {
      errors['requiresNumber'] = true;
    }

    return Object.keys(errors).length > 0 ? errors : null;
  };
}

/**
 * Validates that two form controls have matching values
 *
 * Typically used for password confirmation fields.
 * This validator should be applied to the confirmation field.
 *
 * @param matchTo - Name of the control to match against
 * @returns Validator function
 *
 * @example
 * ```typescript
 * this.confirmPasswordControl = new FormControl('', [
 *   Validators.required,
 *   CustomValidators.matchPassword('password')
 * ]);
 * ```
 */
export function matchPassword(matchTo: string): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null; // Don't validate empty values
    }

    const parent = control.parent;
    if (!parent) {
      return null;
    }

    const matchControl = parent.get(matchTo);
    if (!matchControl) {
      console.warn(`matchPassword: Control '${matchTo}' not found`);
      return null;
    }

    if (control.value !== matchControl.value) {
      return { passwordMismatch: true };
    }

    return null;
  };
}

/**
 * Validates that a string contains only Latin characters
 *
 * Allows:
 * - Letters (a-z, A-Z)
 * - Accented characters (á, é, í, ó, ú, ñ, etc.)
 * - Spaces
 * - Hyphens and apostrophes (for names like "O'Brien" or "Smith-Jones")
 *
 * @returns Validator function
 *
 * @example
 * ```typescript
 * this.firstNameControl = new FormControl('', [
 *   Validators.required,
 *   CustomValidators.latinCharacters()
 * ]);
 * ```
 */
export function latinCharacters(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;

    if (!value) {
      return null; // Don't validate empty values
    }

    // Regex that allows:
    // - Latin letters (including accented characters and ñ)
    // - Spaces
    // - Hyphens and apostrophes
    const latinRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'-]+$/;

    if (!latinRegex.test(value)) {
      return { latinCharacters: true };
    }

    return null;
  };
}

/**
 * Validates email format with enhanced checking
 *
 * More strict than the default Angular email validator.
 *
 * @returns Validator function
 *
 * @example
 * ```typescript
 * this.emailControl = new FormControl('', [
 *   Validators.required,
 *   CustomValidators.email()
 * ]);
 * ```
 */
export function email(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;

    if (!value) {
      return null; // Don't validate empty values
    }

    // Enhanced email regex pattern
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!emailRegex.test(value)) {
      return { email: true };
    }

    return null;
  };
}

/**
 * Gets a user-friendly error message for a form control
 *
 * Provides safe, non-technical error messages for displaying to users.
 *
 * @param control - The form control to get errors from
 * @param fieldName - Display name of the field (e.g., "Email", "Password")
 * @returns Error message string or null if no errors
 *
 * @example
 * ```typescript
 * const errorMsg = getErrorMessage(this.emailControl, 'Email');
 * if (errorMsg) {
 *   this.toastService.error(errorMsg);
 * }
 * ```
 */
export function getErrorMessage(control: AbstractControl | null, fieldName: string): string | null {
  if (!control || !control.errors || !control.touched) {
    return null;
  }

  const errors = control.errors;

  if (errors['required']) {
    return `${fieldName} is required`;
  }

  if (errors['email']) {
    return 'Please enter a valid email address';
  }

  if (errors['minLength']) {
    const required = errors['minLength'].requiredLength;
    return `${fieldName} must be at least ${required} characters`;
  }

  if (errors['maxLength']) {
    const required = errors['maxLength'].requiredLength;
    return `${fieldName} must not exceed ${required} characters`;
  }

  if (errors['requiresUppercase']) {
    return 'Password must contain at least one uppercase letter';
  }

  if (errors['requiresLowercase']) {
    return 'Password must contain at least one lowercase letter';
  }

  if (errors['requiresNumber']) {
    return 'Password must contain at least one number';
  }

  if (errors['passwordMismatch']) {
    return 'Passwords do not match';
  }

  if (errors['latinCharacters']) {
    return `${fieldName} can only contain letters, spaces, hyphens, and apostrophes`;
  }

  // Generic error message for unknown validation errors
  return `${fieldName} is invalid`;
}

/**
 * CustomValidators namespace
 * Provides all custom validators in a single importable object
 */
export const CustomValidators = {
  passwordStrength,
  matchPassword,
  latinCharacters,
  email,
  getErrorMessage
};

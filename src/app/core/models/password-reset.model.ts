/**
 * Password Reset Request
 */
export interface PasswordResetRequest {
  email: string;
}

/**
 * Password Reset Response
 */
export interface PasswordResetResponse {
  code: string;
  message: string;
  data?: {
    status: number;
  };
}

/**
 * Password Reset Validation Request
 */
export interface PasswordResetValidationRequest {
  email: string;
  code: string;
  password: string;
}

/**
 * Password Reset Validation Response
 */
export interface PasswordResetValidationResponse {
  code: string;
  message: string;
  data?: {
    status: number;
  };
}

/**
 * Password Change Request
 */
export interface PasswordChangeRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

/**
 * Password Change Response
 */
export interface PasswordChangeResponse {
  success: boolean;
  message: string;
}

/**
 * Password Strength
 */
export type PasswordStrength = 'weak' | 'medium' | 'strong' | 'very-strong';

/**
 * Password Requirements
 */
export interface PasswordRequirements {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  specialChars?: string;
}

/**
 * Password Validation Result
 */
export interface PasswordValidationResult {
  isValid: boolean;
  strength: PasswordStrength;
  errors: string[];
  suggestions?: string[];
}

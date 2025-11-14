/**
 * JWT Authentication Response
 */
export interface WCAuthResponse {
  token: string;
  user_email: string;
  user_nicename: string;
  user_display_name: string;
}

/**
 * JWT Authentication Request
 */
export interface WCAuthRequest {
  username: string;
  password: string;
}

/**
 * JWT Token Validation Response
 */
export interface WCTokenValidationResponse {
  code: string;
  data: {
    status: number;
  };
}

/**
 * JWT Token Refresh Response
 */
export interface WCRefreshTokenResponse {
  token: string;
}

/**
 * Registration Request
 */
export interface WCRegistrationRequest {
  username: string;
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
}

/**
 * Registration Response
 */
export interface WCRegistrationResponse {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
}

/**
 * Password Reset Request
 */
export interface WCPasswordResetRequest {
  user_login: string;
}

/**
 * Password Reset Response
 */
export interface WCPasswordResetResponse {
  code: string;
  message: string;
  data?: {
    status: number;
  };
}

/**
 * Password Reset Validation Request
 */
export interface WCPasswordResetValidationRequest {
  key: string;
  login: string;
  password: string;
}

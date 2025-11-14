/**
 * Toast Notification Model
 */
export interface Toast {
  id?: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
  dismissible?: boolean;
  action?: ToastAction;
  position?: ToastPosition;
  icon?: string;
}

/**
 * Toast Type (severity level)
 */
export type ToastType = 'success' | 'error' | 'warning' | 'info';

/**
 * Toast Position
 */
export type ToastPosition =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right';

/**
 * Toast Action (optional button/link)
 */
export interface ToastAction {
  label: string;
  onClick?: () => void;
  link?: string;
}

/**
 * Toast Configuration
 */
export interface ToastConfig {
  duration?: number; // Duration in milliseconds (0 = no auto-dismiss)
  dismissible?: boolean; // Can be manually closed
  position?: ToastPosition;
  maxToasts?: number; // Maximum number of toasts to display at once
  newestOnTop?: boolean; // Show newest toasts at the top
}

/**
 * Toast Service Options
 */
export interface ToastOptions {
  duration?: number;
  dismissible?: boolean;
  position?: ToastPosition;
  icon?: string;
  action?: ToastAction;
}

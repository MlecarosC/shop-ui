/**
 * Payment Gateway
 */
export interface PaymentGateway {
  id: string;
  title: string;
  description: string;
  order: number;
  enabled: boolean;
  methodTitle: string;
  methodDescription: string;
  methodSupports: string[];
  settings?: PaymentGatewaySettings;
}

/**
 * Payment Gateway Settings
 */
export interface PaymentGatewaySettings {
  [key: string]: {
    id: string;
    label: string;
    description: string;
    type: string;
    value: string;
    default: string;
    tip?: string;
    placeholder?: string;
  };
}

/**
 * Payment Method
 */
export interface PaymentMethod {
  id: string;
  title: string;
  description?: string;
  icon?: string;
  enabled: boolean;
  supports: PaymentMethodSupport[];
}

/**
 * Payment Method Support Features
 */
export type PaymentMethodSupport =
  | 'products'
  | 'refunds'
  | 'subscriptions'
  | 'pre-orders'
  | 'tokenization'
  | 'add_payment_method'
  | 'subscriptions'
  | 'subscription_cancellation'
  | 'subscription_suspension'
  | 'subscription_reactivation'
  | 'subscription_amount_changes'
  | 'subscription_date_changes'
  | 'subscription_payment_method_change'
  | 'subscription_payment_method_change_customer'
  | 'subscription_payment_method_change_admin'
  | 'multiple_subscriptions';

/**
 * Payment Request
 */
export interface PaymentRequest {
  orderId: number;
  paymentMethod: string;
  paymentData?: any;
  returnUrl?: string;
  cancelUrl?: string;
}

/**
 * Payment Response
 */
export interface PaymentResponse {
  success: boolean;
  orderId: number;
  transactionId?: string;
  status: PaymentStatus;
  redirectUrl?: string;
  message?: string;
  data?: any;
}

/**
 * Payment Status
 */
export type PaymentStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'refunded'
  | 'on-hold';

/**
 * Payment Error
 */
export interface PaymentError {
  code: string;
  message: string;
  details?: any;
}

/**
 * Stripe Payment Intent
 */
export interface StripePaymentIntent {
  clientSecret: string;
  paymentIntentId: string;
  amount: number;
  currency: string;
  status: string;
}

/**
 * Stripe Card Element
 */
export interface StripeCardData {
  cardNumber: string;
  expiryDate: string;
  cvc: string;
  cardholderName?: string;
  saveCard?: boolean;
}

/**
 * PayPal Payment Data
 */
export interface PayPalPaymentData {
  orderID: string;
  payerID?: string;
  paymentID?: string;
  billingToken?: string;
  facilitatorAccessToken?: string;
}

/**
 * Saved Payment Method
 */
export interface SavedPaymentMethod {
  id: string;
  type: 'card' | 'bank_account' | 'paypal';
  last4?: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
  nickname?: string;
}

/**
 * Payment Token
 */
export interface PaymentToken {
  tokenId: string;
  token: string;
  gatewayId: string;
  type: string;
  isDefault: boolean;
  displayName: string;
  expiryYear?: number;
  expiryMonth?: number;
}

/**
 * Refund Request
 */
export interface RefundRequest {
  orderId: number;
  amount?: number;
  reason?: string;
  refundLineItems?: Array<{
    lineItemId: number;
    quantity: number;
    refundTotal: number;
  }>;
}

/**
 * Refund Response
 */
export interface RefundResponse {
  success: boolean;
  refundId: number;
  amount: string;
  reason: string;
  message?: string;
}

/**
 * Transaction
 */
export interface Transaction {
  id: string;
  orderId: number;
  type: 'payment' | 'refund' | 'void';
  status: PaymentStatus;
  amount: number;
  currency: string;
  gateway: string;
  transactionId?: string;
  date: string;
  note?: string;
}

/**
 * Payment Method Configuration
 */
export interface PaymentMethodConfig {
  id: string;
  enabled: boolean;
  title: string;
  description?: string;
  instructions?: string;
  testMode?: boolean;
  apiKeys?: {
    publicKey?: string;
    secretKey?: string;
  };
  webhookUrl?: string;
  supportedCurrencies?: string[];
  supportedCountries?: string[];
}

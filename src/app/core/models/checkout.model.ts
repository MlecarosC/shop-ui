/**
 * Checkout Data
 */
export interface CheckoutData {
  billing: BillingAddress;
  shipping: ShippingAddress;
  shippingMethod?: ShippingMethod;
  paymentMethod: string;
  paymentMethodTitle: string;
  orderNotes?: string;
  createAccount?: boolean;
  accountPassword?: string;
  shipToDifferentAddress?: boolean;
  termsAccepted: boolean;
}

/**
 * Billing Address
 */
export interface BillingAddress {
  firstName: string;
  lastName: string;
  company?: string;
  country: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  postcode: string;
  email: string;
  phone: string;
}

/**
 * Shipping Address
 */
export interface ShippingAddress {
  firstName: string;
  lastName: string;
  company?: string;
  country: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  postcode: string;
}

/**
 * Shipping Method
 */
export interface ShippingMethod {
  id: string;
  methodId: string;
  instanceId?: string;
  title: string;
  cost: string;
  taxable: boolean;
  taxes?: Array<{
    id: number;
    total: string;
  }>;
}

/**
 * Order Summary Item
 */
export interface OrderSummaryItem {
  id: number;
  productId: number;
  variationId?: number;
  name: string;
  quantity: number;
  price: number;
  subtotal: number;
  total: number;
  image?: string;
  sku?: string;
  variation?: Array<{
    attribute: string;
    value: string;
  }>;
}

/**
 * Order Summary
 */
export interface OrderSummary {
  items: OrderSummaryItem[];
  subtotal: number;
  shippingTotal: number;
  taxTotal: number;
  discountTotal: number;
  total: number;
  currency: string;
  currencySymbol: string;
}

/**
 * Checkout Validation Error
 */
export interface CheckoutValidationError {
  field: string;
  message: string;
  code?: string;
}

/**
 * Checkout Response
 */
export interface CheckoutResponse {
  orderId: number;
  orderNumber: string;
  orderKey: string;
  status: string;
  total: string;
  paymentUrl?: string;
  redirectUrl?: string;
  message?: string;
}

/**
 * Checkout Error Response
 */
export interface CheckoutErrorResponse {
  code: string;
  message: string;
  data?: {
    status: number;
    errors?: CheckoutValidationError[];
  };
}

/**
 * Checkout Step
 */
export type CheckoutStep = 'cart' | 'information' | 'shipping' | 'payment' | 'confirmation';

/**
 * Checkout State
 */
export interface CheckoutState {
  currentStep: CheckoutStep;
  completedSteps: CheckoutStep[];
  checkoutData: Partial<CheckoutData>;
  orderSummary: OrderSummary;
  isProcessing: boolean;
  errors: CheckoutValidationError[];
}

/**
 * Available Shipping Methods
 */
export interface AvailableShippingMethods {
  [packageId: string]: {
    packageName: string;
    rates: ShippingMethod[];
  };
}

/**
 * Country
 */
export interface Country {
  code: string;
  name: string;
  states?: State[];
}

/**
 * State/Province
 */
export interface State {
  code: string;
  name: string;
}

/**
 * Coupon Application
 */
export interface CouponApplication {
  code: string;
  discount: number;
  discountTax: number;
  description?: string;
}

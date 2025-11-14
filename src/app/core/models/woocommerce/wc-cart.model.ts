import { WCImage, WCMetaData } from './wc-common.model';

/**
 * CoCart - Shopping Cart Response
 */
export interface WCCart {
  cart_hash: string;
  cart_key: string;
  currency: {
    currency_code: string;
    currency_symbol: string;
    currency_minor_unit: number;
    currency_decimal_separator: string;
    currency_thousand_separator: string;
    currency_prefix: string;
    currency_suffix: string;
  };
  customer: WCCartCustomer;
  items: WCCartItem[];
  item_count: number;
  items_weight: number;
  coupons: WCCartCoupon[];
  needs_payment: boolean;
  needs_shipping: boolean;
  shipping: WCCartShipping;
  fees: WCCartFee[];
  taxes: WCCartTax[];
  totals: WCCartTotals;
  removed_items: WCCartItem[];
  cross_sells: WCCartCrossSell[];
  notices: any[];
}

/**
 * Cart Customer Information
 */
export interface WCCartCustomer {
  billing_address: {
    billing_first_name: string;
    billing_last_name: string;
    billing_company: string;
    billing_country: string;
    billing_address_1: string;
    billing_address_2: string;
    billing_city: string;
    billing_state: string;
    billing_postcode: string;
    billing_phone: string;
    billing_email: string;
  };
  shipping_address: {
    shipping_first_name: string;
    shipping_last_name: string;
    shipping_company: string;
    shipping_country: string;
    shipping_address_1: string;
    shipping_address_2: string;
    shipping_city: string;
    shipping_state: string;
    shipping_postcode: string;
  };
}

/**
 * Cart Item
 */
export interface WCCartItem {
  item_key: string;
  id: number;
  name: string;
  title: string;
  price: string;
  quantity: {
    value: number;
    min_purchase: number;
    max_purchase: number;
  };
  totals: {
    subtotal: number;
    subtotal_tax: number;
    total: number;
    tax: number;
  };
  slug: string;
  meta: {
    product_type: string;
    sku: string;
    dimensions: {
      length: string;
      width: string;
      height: string;
      unit: string;
    };
    weight: number;
    variation: any[];
  };
  backorders: string;
  cart_item_data: any[];
  featured_image: string;
}

/**
 * Cart Coupon
 */
export interface WCCartCoupon {
  coupon: string;
  label: string;
  saving: string;
  saving_html: string;
}

/**
 * Cart Shipping
 */
export interface WCCartShipping {
  total_packages: number;
  show_package_details: boolean;
  has_calculated_shipping: boolean;
  packages: {
    [key: string]: {
      package_name: string;
      rates: {
        [key: string]: WCShippingRate;
      };
      package_details: string;
      index: number;
      chosen_method: string;
      formatted_destination: string;
    };
  };
}

/**
 * Shipping Rate
 */
export interface WCShippingRate {
  key: string;
  method_id: string;
  instance_id: number;
  label: string;
  cost: string;
  html: string;
  taxes: string;
  chosen_method: boolean;
  meta_data: WCMetaData[];
}

/**
 * Cart Fee
 */
export interface WCCartFee {
  name: string;
  fee: string;
}

/**
 * Cart Tax
 */
export interface WCCartTax {
  name: string;
  price: string;
}

/**
 * Cart Totals
 */
export interface WCCartTotals {
  subtotal: string;
  subtotal_tax: string;
  fee_total: string;
  fee_tax: string;
  discount_total: string;
  discount_tax: string;
  shipping_total: string;
  shipping_tax: string;
  total: string;
  total_tax: string;
}

/**
 * Cross-sell Product
 */
export interface WCCartCrossSell {
  id: number;
  name: string;
  title: string;
  slug: string;
  price: string;
  regular_price: string;
  sale_price: string;
  image: string;
}

/**
 * Add to Cart Request
 */
export interface WCAddToCartRequest {
  id: string;
  quantity?: string;
  variation?: any[];
  cart_item_data?: any;
  return_cart?: boolean;
}

/**
 * Update Cart Item Request
 */
export interface WCUpdateCartItemRequest {
  quantity?: number;
  return_cart?: boolean;
}

/**
 * Remove Cart Item Request
 */
export interface WCRemoveCartItemRequest {
  return_cart?: boolean;
}

/**
 * Update Customer Request
 */
export interface WCUpdateCustomerRequest {
  billing_address?: {
    billing_first_name?: string;
    billing_last_name?: string;
    billing_company?: string;
    billing_country?: string;
    billing_address_1?: string;
    billing_address_2?: string;
    billing_city?: string;
    billing_state?: string;
    billing_postcode?: string;
    billing_phone?: string;
    billing_email?: string;
  };
  shipping_address?: {
    shipping_first_name?: string;
    shipping_last_name?: string;
    shipping_company?: string;
    shipping_country?: string;
    shipping_address_1?: string;
    shipping_address_2?: string;
    shipping_city?: string;
    shipping_state?: string;
    shipping_postcode?: string;
  };
}

/**
 * Apply Coupon Request
 */
export interface WCApplyCouponRequest {
  coupon_code: string;
  return_cart?: boolean;
}

/**
 * Cart Totals Response
 */
export interface WCCartTotalsResponse {
  subtotal: string;
  subtotal_tax: string;
  fee_total: string;
  fee_tax: string;
  discount_total: string;
  discount_tax: string;
  shipping_total: string;
  shipping_tax: string;
  total: string;
  total_tax: string;
}

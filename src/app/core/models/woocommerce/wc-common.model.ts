/**
 * Common interfaces and types shared across WooCommerce models
 */

/**
 * Image object used in WooCommerce
 */
export interface WCImage {
  id: number;
  date_created?: string;
  date_created_gmt?: string;
  date_modified?: string;
  date_modified_gmt?: string;
  src: string;
  name: string;
  alt: string;
  position?: number;
}

/**
 * Address information (billing or shipping)
 */
export interface WCAddress {
  first_name: string;
  last_name: string;
  company?: string;
  address_1: string;
  address_2?: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
  email?: string;
  phone?: string;
}

/**
 * Meta data key-value pairs
 */
export interface WCMetaData {
  id?: number;
  key: string;
  value: string | number | boolean | any;
  display_key?: string;
  display_value?: string;
}

/**
 * Currency information
 */
export interface WCCurrency {
  currency_code: string;
  currency_symbol: string;
  currency_minor_unit: number;
  currency_decimal_separator: string;
  currency_thousand_separator: string;
  currency_prefix: string;
  currency_suffix: string;
}

/**
 * Price range for variable products
 */
export interface WCPriceRange {
  min_amount: string;
  max_amount: string;
}

/**
 * Dimensions object
 */
export interface WCDimensions {
  length: string;
  width: string;
  height: string;
}

/**
 * Category or tag object
 */
export interface WCTerm {
  id: number;
  name: string;
  slug: string;
}

/**
 * Attribute object
 */
export interface WCAttribute {
  id: number;
  name: string;
  position?: number;
  visible?: boolean;
  variation?: boolean;
  options: string[];
}

/**
 * Default attribute for variations
 */
export interface WCDefaultAttribute {
  id: number;
  name: string;
  option: string;
}

/**
 * Download object
 */
export interface WCDownload {
  id: string;
  name: string;
  file: string;
}

/**
 * Tax line item
 */
export interface WCTaxLine {
  id: number;
  rate_code: string;
  rate_id: number;
  label: string;
  compound: boolean;
  tax_total: string;
  shipping_tax_total: string;
  rate_percent?: number;
  meta_data?: WCMetaData[];
}

/**
 * Fee line item
 */
export interface WCFeeLine {
  id: number;
  name: string;
  tax_class: string;
  tax_status: string;
  amount: string;
  total: string;
  total_tax: string;
  taxes: WCTaxLine[];
  meta_data?: WCMetaData[];
}

/**
 * Shipping line item
 */
export interface WCShippingLine {
  id: number;
  method_title: string;
  method_id: string;
  instance_id?: string;
  total: string;
  total_tax: string;
  taxes: WCTaxLine[];
  meta_data?: WCMetaData[];
}

/**
 * Coupon line item
 */
export interface WCCouponLine {
  id: number;
  code: string;
  discount: string;
  discount_tax: string;
  meta_data?: WCMetaData[];
}

/**
 * Refund information
 */
export interface WCRefund {
  id: number;
  reason: string;
  total: string;
}

/**
 * Links for HATEOAS
 */
export interface WCLinks {
  self?: Array<{ href: string }>;
  collection?: Array<{ href: string }>;
  up?: Array<{ href: string }>;
}

/**
 * Common response pagination headers
 */
export interface WCPaginationHeaders {
  'x-wp-total': string;
  'x-wp-totalpages': string;
}

/**
 * Generic error response from WooCommerce API
 */
export interface WCError {
  code: string;
  message: string;
  data?: {
    status: number;
    params?: any;
    details?: any;
  };
}

/**
 * Stock status enum
 */
export type WCStockStatus = 'instock' | 'outofstock' | 'onbackorder';

/**
 * Backorders enum
 */
export type WCBackorders = 'no' | 'notify' | 'yes';

/**
 * Tax status enum
 */
export type WCTaxStatus = 'taxable' | 'shipping' | 'none';

/**
 * Tax class enum
 */
export type WCTaxClass = '' | 'reduced-rate' | 'zero-rate';

/**
 * Catalog visibility enum
 */
export type WCCatalogVisibility = 'visible' | 'catalog' | 'search' | 'hidden';

/**
 * Product type enum
 */
export type WCProductType = 'simple' | 'grouped' | 'external' | 'variable';

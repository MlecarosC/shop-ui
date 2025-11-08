import { WCDimensions } from "./wc-product.model";

export interface WCCart {
  cart_hash: string;
  cart_key: string;
  currency: WCCurrency;
  customer: WCCustomer;
  items: WCCartItem[];
  item_count: number;
  items_weight: number;
  coupons: any[];
  needs_payment: boolean;
  needs_shipping: boolean;
  shipping: WCShipping;
  fees: any[];
  taxes: WCTax[];
  totals: WCTotals;
  removed_items: any[];
  cross_sells: any[];
  notices: any[];
}

export interface WCCurrency {
  currency_code: string;
  currency_symbol: string;
  currency_minor_unit: number;
  currency_decimal_separator: string;
  currency_thousand_separator: string;
  currency_prefix: string;
  currency_suffix: string;
}

export interface WCCustomer {
  billing_address: WCAddress;
  shipping_address: WCAddress;
}

export interface WCAddress {
  first_name: string;
  last_name: string;
  company: string;
  address_1: string;
  address_2: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
  email: string;
  phone: string;
}

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
    dimensions: WCDimensions;
    weight: number;
    variation: any;
  };
  cart_item_data: any[];
  featured_image: string;
}

export interface WCShipping {
  total_packages: number;
  show_package_details: boolean;
  has_calculated_shipping: boolean;
  packages: any;
}

export interface WCTax {
  name: string;
  price: string;
}

export interface WCTotals {
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

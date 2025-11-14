import {
  WCAddress,
  WCMetaData,
  WCTaxLine,
  WCShippingLine,
  WCFeeLine,
  WCCouponLine,
  WCRefund,
  WCLinks
} from './wc-common.model';

/**
 * WooCommerce Order
 */
export interface WCOrder {
  id: number;
  parent_id: number;
  status: WCOrderStatus;
  currency: string;
  version: string;
  prices_include_tax: boolean;
  date_created: string;
  date_created_gmt: string;
  date_modified: string;
  date_modified_gmt: string;
  discount_total: string;
  discount_tax: string;
  shipping_total: string;
  shipping_tax: string;
  cart_tax: string;
  total: string;
  total_tax: string;
  customer_id: number;
  order_key: string;
  billing: WCAddress;
  shipping: WCAddress;
  payment_method: string;
  payment_method_title: string;
  transaction_id: string;
  customer_ip_address: string;
  customer_user_agent: string;
  created_via: string;
  customer_note: string;
  date_completed: string | null;
  date_completed_gmt: string | null;
  date_paid: string | null;
  date_paid_gmt: string | null;
  cart_hash: string;
  number: string;
  meta_data: WCMetaData[];
  line_items: WCLineItem[];
  tax_lines: WCTaxLine[];
  shipping_lines: WCShippingLine[];
  fee_lines: WCFeeLine[];
  coupon_lines: WCCouponLine[];
  refunds: WCRefund[];
  payment_url?: string;
  is_editable?: boolean;
  needs_payment?: boolean;
  needs_processing?: boolean;
  date_created_formatted?: string;
  _links?: WCLinks;
}

/**
 * Order Status Type
 */
export type WCOrderStatus =
  | 'pending'
  | 'processing'
  | 'on-hold'
  | 'completed'
  | 'cancelled'
  | 'refunded'
  | 'failed'
  | 'trash';

/**
 * Order Line Item
 */
export interface WCLineItem {
  id: number;
  name: string;
  product_id: number;
  variation_id: number;
  quantity: number;
  tax_class: string;
  subtotal: string;
  subtotal_tax: string;
  total: string;
  total_tax: string;
  taxes: WCTaxLine[];
  meta_data: WCMetaData[];
  sku: string;
  price: string;
  image?: {
    id: string;
    src: string;
  };
  parent_name?: string | null;
}

/**
 * Create Order Request
 */
export interface WCCreateOrderRequest {
  payment_method: string;
  payment_method_title: string;
  set_paid?: boolean;
  billing: WCAddress;
  shipping: WCAddress;
  line_items: Array<{
    product_id: number;
    quantity: number;
    variation_id?: number;
    meta_data?: WCMetaData[];
  }>;
  shipping_lines?: Array<{
    method_id: string;
    method_title: string;
    total: string;
  }>;
  coupon_lines?: Array<{
    code: string;
  }>;
  customer_id?: number;
  customer_note?: string;
  meta_data?: WCMetaData[];
}

/**
 * Update Order Request
 */
export interface WCUpdateOrderRequest {
  status?: WCOrderStatus;
  billing?: Partial<WCAddress>;
  shipping?: Partial<WCAddress>;
  line_items?: Array<{
    id?: number;
    product_id?: number;
    quantity?: number;
    variation_id?: number;
    meta_data?: WCMetaData[];
  }>;
  shipping_lines?: Array<{
    id?: number;
    method_id?: string;
    method_title?: string;
    total?: string;
  }>;
  coupon_lines?: Array<{
    id?: number;
    code?: string;
  }>;
  customer_note?: string;
  meta_data?: WCMetaData[];
}

/**
 * Order Note
 */
export interface WCOrderNote {
  id: number;
  author: string;
  date_created: string;
  date_created_gmt: string;
  note: string;
  customer_note: boolean;
  added_by_user?: boolean;
  _links?: WCLinks;
}

/**
 * Create Order Note Request
 */
export interface WCCreateOrderNoteRequest {
  note: string;
  customer_note?: boolean;
  added_by_user?: boolean;
}

/**
 * Order Refund
 */
export interface WCOrderRefund {
  id: number;
  date_created: string;
  date_created_gmt: string;
  amount: string;
  reason: string;
  refunded_by: number;
  refunded_payment: boolean;
  meta_data: WCMetaData[];
  line_items: Array<{
    id: number;
    name: string;
    product_id: number;
    variation_id: number;
    quantity: number;
    tax_class: string;
    subtotal: string;
    subtotal_tax: string;
    total: string;
    total_tax: string;
    taxes: WCTaxLine[];
    meta_data: WCMetaData[];
    sku: string;
    price: string;
    refund_total: number;
  }>;
  _links?: WCLinks;
}

/**
 * Create Refund Request
 */
export interface WCCreateRefundRequest {
  amount?: string;
  reason?: string;
  refunded_by?: number;
  meta_data?: WCMetaData[];
  line_items?: Array<{
    id: number;
    quantity: number;
    refund_total: number;
    refund_tax: Array<{
      id: number;
      refund_total: number;
    }>;
  }>;
  api_refund?: boolean;
}

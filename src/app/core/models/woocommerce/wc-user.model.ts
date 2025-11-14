import { WCAddress, WCMetaData, WCLinks } from './wc-common.model';

/**
 * WooCommerce Customer
 */
export interface WCCustomer {
  id: number;
  date_created: string;
  date_created_gmt: string;
  date_modified: string;
  date_modified_gmt: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  username: string;
  billing: WCAddress;
  shipping: WCAddress;
  is_paying_customer: boolean;
  avatar_url: string;
  meta_data: WCMetaData[];
  _links?: WCLinks;
}

/**
 * Create Customer Request
 */
export interface WCCreateCustomerRequest {
  email: string;
  first_name?: string;
  last_name?: string;
  username: string;
  password: string;
  billing?: Partial<WCAddress>;
  shipping?: Partial<WCAddress>;
  meta_data?: WCMetaData[];
}

/**
 * Update Customer Request
 */
export interface WCUpdateCustomerRequest {
  email?: string;
  first_name?: string;
  last_name?: string;
  username?: string;
  password?: string;
  billing?: Partial<WCAddress>;
  shipping?: Partial<WCAddress>;
  meta_data?: WCMetaData[];
}

/**
 * Customer Download
 */
export interface WCCustomerDownload {
  download_id: string;
  download_url: string;
  product_id: number;
  product_name: string;
  download_name: string;
  order_id: number;
  order_key: string;
  downloads_remaining: string;
  access_expires: string | null;
  access_expires_gmt: string | null;
  file: {
    name: string;
    file: string;
  };
  _links?: WCLinks;
}

/**
 * User role type
 */
export type WCUserRole =
  | 'administrator'
  | 'shop_manager'
  | 'customer'
  | 'subscriber'
  | 'contributor'
  | 'author'
  | 'editor';

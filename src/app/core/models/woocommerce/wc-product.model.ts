import {
  WCImage,
  WCDimensions,
  WCTerm,
  WCAttribute,
  WCDefaultAttribute,
  WCDownload,
  WCMetaData,
  WCStockStatus,
  WCBackorders,
  WCTaxStatus,
  WCTaxClass,
  WCCatalogVisibility,
  WCProductType,
  WCLinks
} from './wc-common.model';

/**
 * WooCommerce Product
 */
export interface WCProduct {
  id: number;
  name: string;
  slug: string;
  permalink: string;
  date_created: string;
  date_created_gmt: string;
  date_modified: string;
  date_modified_gmt: string;
  type: WCProductType;
  status: 'draft' | 'pending' | 'private' | 'publish';
  featured: boolean;
  catalog_visibility: WCCatalogVisibility;
  description: string;
  short_description: string;
  sku: string;
  price: string;
  regular_price: string;
  sale_price: string;
  date_on_sale_from: string | null;
  date_on_sale_from_gmt: string | null;
  date_on_sale_to: string | null;
  date_on_sale_to_gmt: string | null;
  on_sale: boolean;
  purchasable: boolean;
  total_sales: number;
  virtual: boolean;
  downloadable: boolean;
  downloads: WCDownload[];
  download_limit: number;
  download_expiry: number;
  external_url: string;
  button_text: string;
  tax_status: WCTaxStatus;
  tax_class: WCTaxClass;
  manage_stock: boolean;
  stock_quantity: number | null;
  stock_status: WCStockStatus;
  backorders: WCBackorders;
  backorders_allowed: boolean;
  backordered: boolean;
  low_stock_amount: number | null;
  sold_individually: boolean;
  weight: string;
  dimensions: WCDimensions;
  shipping_required: boolean;
  shipping_taxable: boolean;
  shipping_class: string;
  shipping_class_id: number;
  reviews_allowed: boolean;
  average_rating: string;
  rating_count: number;
  upsell_ids: number[];
  cross_sell_ids: number[];
  parent_id: number;
  purchase_note: string;
  categories: WCTerm[];
  tags: WCTerm[];
  images: WCImage[];
  attributes: WCAttribute[];
  default_attributes: WCDefaultAttribute[];
  variations: number[];
  grouped_products: number[];
  menu_order: number;
  price_html: string;
  related_ids: number[];
  meta_data: WCMetaData[];
  _links?: WCLinks;
}

/**
 * Product Variation
 */
export interface WCProductVariation {
  id: number;
  date_created: string;
  date_created_gmt: string;
  date_modified: string;
  date_modified_gmt: string;
  description: string;
  permalink: string;
  sku: string;
  price: string;
  regular_price: string;
  sale_price: string;
  date_on_sale_from: string | null;
  date_on_sale_from_gmt: string | null;
  date_on_sale_to: string | null;
  date_on_sale_to_gmt: string | null;
  on_sale: boolean;
  status: 'draft' | 'pending' | 'private' | 'publish';
  purchasable: boolean;
  virtual: boolean;
  downloadable: boolean;
  downloads: WCDownload[];
  download_limit: number;
  download_expiry: number;
  tax_status: WCTaxStatus;
  tax_class: WCTaxClass;
  manage_stock: boolean;
  stock_quantity: number | null;
  stock_status: WCStockStatus;
  backorders: WCBackorders;
  backorders_allowed: boolean;
  backordered: boolean;
  low_stock_amount: number | null;
  weight: string;
  dimensions: WCDimensions;
  shipping_class: string;
  shipping_class_id: number;
  image: WCImage;
  attributes: Array<{
    id: number;
    name: string;
    option: string;
  }>;
  menu_order: number;
  meta_data: WCMetaData[];
  _links?: WCLinks;
}

/**
 * Product Review
 */
export interface WCProductReview {
  id: number;
  date_created: string;
  date_created_gmt: string;
  product_id: number;
  product_name?: string;
  product_permalink?: string;
  status: 'approved' | 'hold' | 'spam' | 'unspam' | 'trash' | 'untrash';
  reviewer: string;
  reviewer_email: string;
  review: string;
  rating: number;
  verified: boolean;
  reviewer_avatar_urls: {
    24: string;
    48: string;
    96: string;
  };
  _links?: WCLinks;
}

/**
 * Request body for creating/updating a product
 */
export interface WCProductRequest {
  name?: string;
  type?: WCProductType;
  status?: 'draft' | 'pending' | 'private' | 'publish';
  featured?: boolean;
  catalog_visibility?: WCCatalogVisibility;
  description?: string;
  short_description?: string;
  sku?: string;
  regular_price?: string;
  sale_price?: string;
  date_on_sale_from?: string;
  date_on_sale_to?: string;
  virtual?: boolean;
  downloadable?: boolean;
  downloads?: WCDownload[];
  download_limit?: number;
  download_expiry?: number;
  external_url?: string;
  button_text?: string;
  tax_status?: WCTaxStatus;
  tax_class?: WCTaxClass;
  manage_stock?: boolean;
  stock_quantity?: number | null;
  stock_status?: WCStockStatus;
  backorders?: WCBackorders;
  sold_individually?: boolean;
  weight?: string;
  dimensions?: WCDimensions;
  shipping_class?: string;
  reviews_allowed?: boolean;
  upsell_ids?: number[];
  cross_sell_ids?: number[];
  parent_id?: number;
  purchase_note?: string;
  categories?: Array<{ id: number }>;
  tags?: Array<{ id: number }>;
  images?: Array<{
    id?: number;
    src?: string;
    name?: string;
    alt?: string;
    position?: number;
  }>;
  attributes?: WCAttribute[];
  default_attributes?: WCDefaultAttribute[];
  menu_order?: number;
  meta_data?: WCMetaData[];
}

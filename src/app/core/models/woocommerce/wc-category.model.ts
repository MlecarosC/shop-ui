import { WCImage, WCLinks } from './wc-common.model';

/**
 * WooCommerce Product Category
 */
export interface WCCategory {
  id: number;
  name: string;
  slug: string;
  parent: number;
  description: string;
  display: 'default' | 'products' | 'subcategories' | 'both';
  image: WCImage | null;
  menu_order: number;
  count: number;
  _links?: WCLinks;
}

/**
 * Request body for creating/updating a category
 */
export interface WCCategoryRequest {
  name: string;
  slug?: string;
  parent?: number;
  description?: string;
  display?: 'default' | 'products' | 'subcategories' | 'both';
  image?: {
    id?: number;
    src?: string;
    name?: string;
    alt?: string;
  };
  menu_order?: number;
}

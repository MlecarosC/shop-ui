/**
 * Simplified Product Model for Application Use
 */
export interface Product {
  id: number;
  name: string;
  slug: string;
  permalink: string;
  type: 'simple' | 'grouped' | 'external' | 'variable';
  description: string;
  shortDescription: string;
  sku: string;
  price: number;
  regularPrice: number;
  salePrice: number;
  onSale: boolean;
  purchasable: boolean;
  stockStatus: 'instock' | 'outofstock' | 'onbackorder';
  stockQuantity: number | null;
  manageStock: boolean;
  images: ProductImage[];
  categories: ProductCategory[];
  tags: ProductTag[];
  attributes: ProductAttribute[];
  variations: number[];
  averageRating: number;
  ratingCount: number;
  featured: boolean;
  relatedIds: number[];
  upsellIds: number[];
  crossSellIds: number[];
}

/**
 * Product Image
 */
export interface ProductImage {
  id: number;
  src: string;
  name: string;
  alt: string;
  position?: number;
}

/**
 * Product Category
 */
export interface ProductCategory {
  id: number;
  name: string;
  slug: string;
}

/**
 * Product Tag
 */
export interface ProductTag {
  id: number;
  name: string;
  slug: string;
}

/**
 * Product Attribute
 */
export interface ProductAttribute {
  id: number;
  name: string;
  options: string[];
  visible?: boolean;
  variation?: boolean;
}

/**
 * Product Variation
 */
export interface ProductVariation {
  id: number;
  sku: string;
  price: number;
  regularPrice: number;
  salePrice: number;
  onSale: boolean;
  stockStatus: 'instock' | 'outofstock' | 'onbackorder';
  stockQuantity: number | null;
  image: ProductImage;
  attributes: Array<{
    id: number;
    name: string;
    option: string;
  }>;
}

/**
 * Product Filter Options
 */
export interface ProductFilter {
  category?: number;
  tag?: number;
  minPrice?: number;
  maxPrice?: number;
  onSale?: boolean;
  featured?: boolean;
  search?: string;
  orderBy?: 'date' | 'title' | 'price' | 'popularity' | 'rating';
  order?: 'asc' | 'desc';
  page?: number;
  perPage?: number;
}

/**
 * Product Review
 */
export interface ProductReview {
  id: number;
  productId: number;
  reviewer: string;
  reviewerEmail: string;
  review: string;
  rating: number;
  verified: boolean;
  dateCreated: string;
}

/**
 * Add Review Request
 */
export interface AddReviewRequest {
  productId: number;
  review: string;
  reviewer: string;
  reviewerEmail: string;
  rating: number;
}

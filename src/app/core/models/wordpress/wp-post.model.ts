/**
 * WordPress Post
 */
export interface WPPost {
  id: number;
  date: string;
  date_gmt: string;
  guid: {
    rendered: string;
  };
  modified: string;
  modified_gmt: string;
  slug: string;
  status: WPPostStatus;
  type: string;
  link: string;
  title: {
    rendered: string;
  };
  content: {
    rendered: string;
    protected: boolean;
  };
  excerpt: {
    rendered: string;
    protected: boolean;
  };
  author: number;
  featured_media: number;
  comment_status: 'open' | 'closed';
  ping_status: 'open' | 'closed';
  sticky: boolean;
  template: string;
  format: WPPostFormat;
  meta: any[];
  categories: number[];
  tags: number[];
  _embedded?: {
    author?: Array<{
      id: number;
      name: string;
      url: string;
      description: string;
      link: string;
      slug: string;
      avatar_urls: {
        24: string;
        48: string;
        96: string;
      };
    }>;
    'wp:featuredmedia'?: Array<{
      id: number;
      date: string;
      slug: string;
      type: string;
      link: string;
      title: {
        rendered: string;
      };
      author: number;
      caption: {
        rendered: string;
      };
      alt_text: string;
      media_type: string;
      mime_type: string;
      media_details: {
        width: number;
        height: number;
        file: string;
        sizes: {
          [key: string]: {
            file: string;
            width: number;
            height: number;
            mime_type: string;
            source_url: string;
          };
        };
      };
      source_url: string;
    }>;
    'wp:term'?: Array<
      Array<{
        id: number;
        link: string;
        name: string;
        slug: string;
        taxonomy: string;
      }>
    >;
  };
  _links?: {
    self: Array<{ href: string }>;
    collection: Array<{ href: string }>;
    about: Array<{ href: string }>;
    author: Array<{ embeddable: boolean; href: string }>;
    replies: Array<{ embeddable: boolean; href: string }>;
    'version-history': Array<{ count: number; href: string }>;
    'wp:featuredmedia': Array<{ embeddable: boolean; href: string }>;
    'wp:attachment': Array<{ href: string }>;
    'wp:term': Array<{ taxonomy: string; embeddable: boolean; href: string }>;
    curies: Array<{ name: string; href: string; templated: boolean }>;
  };
}

/**
 * WordPress Post Status
 */
export type WPPostStatus =
  | 'publish'
  | 'future'
  | 'draft'
  | 'pending'
  | 'private'
  | 'trash'
  | 'auto-draft'
  | 'inherit';

/**
 * WordPress Post Format
 */
export type WPPostFormat =
  | 'standard'
  | 'aside'
  | 'chat'
  | 'gallery'
  | 'link'
  | 'image'
  | 'quote'
  | 'status'
  | 'video'
  | 'audio';

/**
 * WordPress Media
 */
export interface WPMedia {
  id: number;
  date: string;
  date_gmt: string;
  guid: {
    rendered: string;
  };
  modified: string;
  modified_gmt: string;
  slug: string;
  status: string;
  type: string;
  link: string;
  title: {
    rendered: string;
  };
  author: number;
  comment_status: 'open' | 'closed';
  ping_status: 'open' | 'closed';
  template: string;
  meta: any[];
  description: {
    rendered: string;
  };
  caption: {
    rendered: string;
  };
  alt_text: string;
  media_type: 'image' | 'file' | 'video' | 'audio';
  mime_type: string;
  media_details: {
    width?: number;
    height?: number;
    file: string;
    sizes?: {
      [key: string]: {
        file: string;
        width: number;
        height: number;
        mime_type: string;
        source_url: string;
      };
    };
    image_meta?: {
      aperture: string;
      credit: string;
      camera: string;
      caption: string;
      created_timestamp: string;
      copyright: string;
      focal_length: string;
      iso: string;
      shutter_speed: string;
      title: string;
      orientation: string;
      keywords: string[];
    };
  };
  post: number | null;
  source_url: string;
  _links?: {
    self: Array<{ href: string }>;
    collection: Array<{ href: string }>;
    about: Array<{ href: string }>;
    author: Array<{ embeddable: boolean; href: string }>;
    replies: Array<{ embeddable: boolean; href: string }>;
  };
}

/**
 * WordPress Category
 */
export interface WPCategory {
  id: number;
  count: number;
  description: string;
  link: string;
  name: string;
  slug: string;
  taxonomy: string;
  parent: number;
  meta: any[];
  _links?: {
    self: Array<{ href: string }>;
    collection: Array<{ href: string }>;
    about: Array<{ href: string }>;
    'wp:post_type': Array<{ href: string }>;
    curies: Array<{ name: string; href: string; templated: boolean }>;
  };
}

/**
 * WordPress Tag
 */
export interface WPTag {
  id: number;
  count: number;
  description: string;
  link: string;
  name: string;
  slug: string;
  taxonomy: string;
  meta: any[];
  _links?: {
    self: Array<{ href: string }>;
    collection: Array<{ href: string }>;
    about: Array<{ href: string }>;
    'wp:post_type': Array<{ href: string }>;
    curies: Array<{ name: string; href: string; templated: boolean }>;
  };
}

/**
 * Create/Update Post Request
 */
export interface WPPostRequest {
  date?: string;
  date_gmt?: string;
  slug?: string;
  status?: WPPostStatus;
  password?: string;
  title?: string;
  content?: string;
  author?: number;
  excerpt?: string;
  featured_media?: number;
  comment_status?: 'open' | 'closed';
  ping_status?: 'open' | 'closed';
  format?: WPPostFormat;
  meta?: any;
  sticky?: boolean;
  template?: string;
  categories?: number[];
  tags?: number[];
}

/**
 * WordPress Comment
 */
export interface WPComment {
  id: number;
  post: number;
  parent: number;
  author: number;
  author_name: string;
  author_url: string;
  date: string;
  date_gmt: string;
  content: {
    rendered: string;
  };
  link: string;
  status: 'approved' | 'hold' | 'spam' | 'trash';
  type: string;
  author_avatar_urls: {
    24: string;
    48: string;
    96: string;
  };
  meta: any[];
  _links?: {
    self: Array<{ href: string }>;
    collection: Array<{ href: string }>;
    author: Array<{ embeddable: boolean; href: string }>;
    up: Array<{ embeddable: boolean; post_type: string; href: string }>;
  };
}

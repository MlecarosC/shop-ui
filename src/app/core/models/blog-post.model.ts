/**
 * Simplified Blog Post Model for Application Use
 */
export interface BlogPost {
  id: number;
  date: string;
  modified: string;
  slug: string;
  status: 'publish' | 'draft' | 'pending' | 'private';
  link: string;
  title: string;
  content: string;
  excerpt: string;
  authorId: number;
  authorName?: string;
  authorAvatar?: string;
  featuredMediaId: number;
  featuredImageUrl?: string;
  featuredImageAlt?: string;
  categories: BlogCategory[];
  tags: BlogTag[];
  commentStatus: 'open' | 'closed';
  sticky: boolean;
}

/**
 * Blog Category
 */
export interface BlogCategory {
  id: number;
  name: string;
  slug: string;
  description?: string;
  count?: number;
}

/**
 * Blog Tag
 */
export interface BlogTag {
  id: number;
  name: string;
  slug: string;
  count?: number;
}

/**
 * Blog Author
 */
export interface BlogAuthor {
  id: number;
  name: string;
  slug: string;
  description: string;
  avatarUrl: string;
  url?: string;
}

/**
 * Blog Comment
 */
export interface BlogComment {
  id: number;
  postId: number;
  parentId: number;
  authorName: string;
  authorUrl?: string;
  authorAvatar: string;
  date: string;
  content: string;
  status: 'approved' | 'hold' | 'spam' | 'trash';
}

/**
 * Add Comment Request
 */
export interface AddCommentRequest {
  postId: number;
  content: string;
  authorName: string;
  authorEmail: string;
  parentId?: number;
}

/**
 * Blog Filter Options
 */
export interface BlogFilter {
  categories?: number[];
  tags?: number[];
  author?: number;
  search?: string;
  orderBy?: 'date' | 'title' | 'modified';
  order?: 'asc' | 'desc';
  page?: number;
  perPage?: number;
  sticky?: boolean;
}

/**
 * Featured Media
 */
export interface FeaturedMedia {
  id: number;
  sourceUrl: string;
  altText: string;
  caption?: string;
  title?: string;
  mediaType: 'image' | 'video' | 'file';
  mimeType: string;
  width?: number;
  height?: number;
}

import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { map, catchError, tap, shareReplay } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { WPPost, WPCategory, WPTag } from '@core/models';

/**
 * Post Query Parameters
 */
export interface PostQueryParams {
  page?: number;
  per_page?: number;
  search?: string;
  author?: number;
  author_exclude?: number[];
  before?: string;
  after?: string;
  exclude?: number[];
  include?: number[];
  offset?: number;
  order?: 'asc' | 'desc';
  orderby?: 'author' | 'date' | 'id' | 'include' | 'modified' | 'parent' | 'relevance' | 'slug' | 'title';
  slug?: string;
  status?: 'publish' | 'future' | 'draft' | 'pending' | 'private';
  categories?: number[];
  categories_exclude?: number[];
  tags?: number[];
  tags_exclude?: number[];
  sticky?: boolean;
}

/**
 * Paginated Posts Response
 */
export interface PaginatedPostsResponse {
  posts: WPPost[];
  total: number;
  totalPages: number;
  currentPage: number;
  perPage: number;
}

/**
 * Blog Service
 *
 * Handles all blog/post-related API calls to WordPress REST API.
 * Provides methods for fetching posts, categories, tags, and searching content.
 */
@Injectable({
  providedIn: 'root'
})
export class BlogService {
  // Cache signals
  private readonly postsCache = signal<Map<string, WPPost[]>>(new Map());
  private readonly categoriesCache = signal<WPCategory[] | null>(null);
  private readonly tagsCache = signal<WPTag[] | null>(null);

  constructor(private http: HttpClient) {}

  /**
   * Get blog posts with optional filters and pagination
   *
   * @param params - Query parameters for filtering and pagination
   * @returns Observable with paginated posts response
   */
  getPosts(params: PostQueryParams = {}): Observable<PaginatedPostsResponse> {
    const url = `${environment.apiUrl}/wp/v2/posts`;
    const httpParams = this.buildHttpParams(params);
    const headers = this.getHeaders();

    // Add _embed parameter to get author and featured media
    const enrichedParams = httpParams.set('_embed', 'true');

    return this.http.get<WPPost[]>(url, {
      headers,
      params: enrichedParams,
      observe: 'response'
    }).pipe(
      map((response) => {
        const posts = response.body || [];
        const total = parseInt(response.headers.get('X-WP-Total') || '0', 10);
        const totalPages = parseInt(response.headers.get('X-WP-TotalPages') || '1', 10);

        // Update cache
        const cacheKey = this.getCacheKey(params);
        const cache = this.postsCache();
        cache.set(cacheKey, posts);
        this.postsCache.set(new Map(cache));

        return {
          posts,
          total,
          totalPages,
          currentPage: params.page || 1,
          perPage: params.per_page || 10
        };
      }),
      shareReplay(1),
      catchError(this.handleError)
    );
  }

  /**
   * Get a single post by ID
   *
   * @param postId - Post ID
   * @returns Observable with post data
   */
  getPostById(postId: number): Observable<WPPost> {
    // Check cache first
    const cache = this.postsCache();
    for (const posts of cache.values()) {
      const found = posts.find(p => p.id === postId);
      if (found) {
        return of(found);
      }
    }

    const url = `${environment.apiUrl}/wp/v2/posts/${postId}`;
    const headers = this.getHeaders();
    const params = new HttpParams().set('_embed', 'true');

    return this.http.get<WPPost>(url, { headers, params }).pipe(
      tap((post) => {
        // Update cache with single post
        const cacheKey = `post_${postId}`;
        const cache = this.postsCache();
        cache.set(cacheKey, [post]);
        this.postsCache.set(new Map(cache));
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Get post by slug
   *
   * @param slug - Post slug
   * @returns Observable with post data or null if not found
   */
  getPostBySlug(slug: string): Observable<WPPost | null> {
    const params: PostQueryParams = {
      slug: slug,
      per_page: 1
    };

    return this.getPosts(params).pipe(
      map((response) => {
        return response.posts.length > 0 ? response.posts[0] : null;
      }),
      catchError(() => of(null))
    );
  }

  /**
   * Get featured posts (sticky posts)
   *
   * @param params - Additional query parameters
   * @returns Observable with paginated posts response
   */
  getFeaturedPosts(params: Omit<PostQueryParams, 'sticky'> = {}): Observable<PaginatedPostsResponse> {
    return this.getPosts({ ...params, sticky: true });
  }

  /**
   * Search posts by query string
   *
   * @param query - Search query
   * @param params - Additional query parameters
   * @returns Observable with paginated posts response
   */
  searchPosts(query: string, params: Omit<PostQueryParams, 'search'> = {}): Observable<PaginatedPostsResponse> {
    return this.getPosts({ ...params, search: query, orderby: 'relevance' });
  }

  /**
   * Get posts by category
   *
   * @param categoryId - Category ID or array of category IDs
   * @param params - Additional query parameters
   * @returns Observable with paginated posts response
   */
  getPostsByCategory(categoryId: number | number[], params: Omit<PostQueryParams, 'categories'> = {}): Observable<PaginatedPostsResponse> {
    const categories = Array.isArray(categoryId) ? categoryId : [categoryId];
    return this.getPosts({ ...params, categories });
  }

  /**
   * Get posts by tag
   *
   * @param tagId - Tag ID or array of tag IDs
   * @param params - Additional query parameters
   * @returns Observable with paginated posts response
   */
  getPostsByTag(tagId: number | number[], params: Omit<PostQueryParams, 'tags'> = {}): Observable<PaginatedPostsResponse> {
    const tags = Array.isArray(tagId) ? tagId : [tagId];
    return this.getPosts({ ...params, tags });
  }

  /**
   * Get posts by author
   *
   * @param authorId - Author ID
   * @param params - Additional query parameters
   * @returns Observable with paginated posts response
   */
  getPostsByAuthor(authorId: number, params: Omit<PostQueryParams, 'author'> = {}): Observable<PaginatedPostsResponse> {
    return this.getPosts({ ...params, author: authorId });
  }

  /**
   * Get recent posts
   *
   * @param count - Number of recent posts to fetch (default: 5)
   * @returns Observable with posts array
   */
  getRecentPosts(count: number = 5): Observable<WPPost[]> {
    return this.getPosts({
      per_page: count,
      orderby: 'date',
      order: 'desc'
    }).pipe(
      map(response => response.posts)
    );
  }

  /**
   * Get all post categories
   *
   * @param params - Optional query parameters
   * @returns Observable with categories array
   */
  getCategories(params: { per_page?: number; hide_empty?: boolean; parent?: number } = {}): Observable<WPCategory[]> {
    // Return cached categories if available
    const cached = this.categoriesCache();
    if (cached && !params.parent && !params.hide_empty) {
      return of(cached);
    }

    const url = `${environment.apiUrl}/wp/v2/categories`;
    const headers = this.getHeaders();

    let httpParams = new HttpParams();
    httpParams = httpParams.set('per_page', (params.per_page || 100).toString());

    if (params.parent !== undefined) {
      httpParams = httpParams.set('parent', params.parent.toString());
    }

    if (params.hide_empty !== undefined) {
      httpParams = httpParams.set('hide_empty', params.hide_empty.toString());
    }

    return this.http.get<WPCategory[]>(url, { headers, params: httpParams }).pipe(
      tap((categories) => {
        // Cache categories if fetching all
        if (!params.parent && !params.hide_empty) {
          this.categoriesCache.set(categories);
        }
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Get category by ID
   *
   * @param categoryId - Category ID
   * @returns Observable with category data
   */
  getCategoryById(categoryId: number): Observable<WPCategory> {
    // Check cache first
    const cached = this.categoriesCache();
    if (cached) {
      const found = cached.find(c => c.id === categoryId);
      if (found) {
        return of(found);
      }
    }

    const url = `${environment.apiUrl}/wp/v2/categories/${categoryId}`;
    const headers = this.getHeaders();

    return this.http.get<WPCategory>(url, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Get category by slug
   *
   * @param slug - Category slug
   * @returns Observable with category data or null if not found
   */
  getCategoryBySlug(slug: string): Observable<WPCategory | null> {
    const url = `${environment.apiUrl}/wp/v2/categories`;
    const headers = this.getHeaders();
    const params = new HttpParams().set('slug', slug);

    return this.http.get<WPCategory[]>(url, { headers, params }).pipe(
      map((categories) => categories.length > 0 ? categories[0] : null),
      catchError(() => of(null))
    );
  }

  /**
   * Get all post tags
   *
   * @param params - Optional query parameters
   * @returns Observable with tags array
   */
  getTags(params: { per_page?: number; hide_empty?: boolean } = {}): Observable<WPTag[]> {
    // Return cached tags if available
    const cached = this.tagsCache();
    if (cached && !params.hide_empty) {
      return of(cached);
    }

    const url = `${environment.apiUrl}/wp/v2/tags`;
    const headers = this.getHeaders();

    let httpParams = new HttpParams();
    httpParams = httpParams.set('per_page', (params.per_page || 100).toString());

    if (params.hide_empty !== undefined) {
      httpParams = httpParams.set('hide_empty', params.hide_empty.toString());
    }

    return this.http.get<WPTag[]>(url, { headers, params: httpParams }).pipe(
      tap((tags) => {
        // Cache tags if fetching all
        if (!params.hide_empty) {
          this.tagsCache.set(tags);
        }
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Get tag by ID
   *
   * @param tagId - Tag ID
   * @returns Observable with tag data
   */
  getTagById(tagId: number): Observable<WPTag> {
    // Check cache first
    const cached = this.tagsCache();
    if (cached) {
      const found = cached.find(t => t.id === tagId);
      if (found) {
        return of(found);
      }
    }

    const url = `${environment.apiUrl}/wp/v2/tags/${tagId}`;
    const headers = this.getHeaders();

    return this.http.get<WPTag>(url, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Get tag by slug
   *
   * @param slug - Tag slug
   * @returns Observable with tag data or null if not found
   */
  getTagBySlug(slug: string): Observable<WPTag | null> {
    const url = `${environment.apiUrl}/wp/v2/tags`;
    const headers = this.getHeaders();
    const params = new HttpParams().set('slug', slug);

    return this.http.get<WPTag[]>(url, { headers, params }).pipe(
      map((tags) => tags.length > 0 ? tags[0] : null),
      catchError(() => of(null))
    );
  }

  /**
   * Clear posts cache
   */
  clearPostsCache(): void {
    this.postsCache.set(new Map());
  }

  /**
   * Clear categories cache
   */
  clearCategoriesCache(): void {
    this.categoriesCache.set(null);
  }

  /**
   * Clear tags cache
   */
  clearTagsCache(): void {
    this.tagsCache.set(null);
  }

  /**
   * Clear all caches
   */
  clearAllCaches(): void {
    this.clearPostsCache();
    this.clearCategoriesCache();
    this.clearTagsCache();
  }

  /**
   * Build HTTP params from query parameters
   *
   * @param params - Query parameters
   * @returns HttpParams object
   */
  private buildHttpParams(params: PostQueryParams): HttpParams {
    let httpParams = new HttpParams();

    Object.keys(params).forEach(key => {
      const value = (params as any)[key];
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          // Handle array values (like categories, tags)
          httpParams = httpParams.set(key, value.join(','));
        } else if (typeof value === 'boolean') {
          // Handle boolean values
          httpParams = httpParams.set(key, value.toString());
        } else {
          httpParams = httpParams.set(key, value.toString());
        }
      }
    });

    return httpParams;
  }

  /**
   * Generate cache key from query parameters
   *
   * @param params - Query parameters
   * @returns Cache key string
   */
  private getCacheKey(params: PostQueryParams): string {
    return JSON.stringify(params);
  }

  /**
   * Get HTTP headers for WordPress API
   *
   * @returns HttpHeaders object
   */
  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json'
    });
  }

  /**
   * Handle HTTP errors
   *
   * @param error - HTTP error response
   * @returns Observable error with safe message
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An error occurred while fetching blog content. Please try again.';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = 'A network error occurred. Please check your connection.';
    } else {
      // Server-side error
      switch (error.status) {
        case 404:
          errorMessage = 'The requested content was not found.';
          break;
        case 500:
          errorMessage = 'A server error occurred. Please try again later.';
          break;
        default:
          if (error.error?.message) {
            errorMessage = error.error.message;
          }
      }
    }

    console.error('Blog Service Error:', error);
    return throwError(() => new Error(errorMessage));
  }
}

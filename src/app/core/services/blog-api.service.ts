import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { WPPost } from '../models/woocommerce/wc-blog.model';

@Injectable({
  providedIn: 'root'
})
export class BlogApiService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;
  
  private posts = signal<WPPost[]>([]);
  private featuredPosts = signal<WPPost[]>([]);

  getPosts(params?: {
    per_page?: number;
    page?: number;
    categories?: string;
    tags?: string;
    search?: string;
    orderby?: 'date' | 'id' | 'title';
    order?: 'asc' | 'desc';
    _embed?: boolean;
  }): Observable<WPPost[]> {
    let httpParams = new HttpParams();

    httpParams = httpParams.set('_embed', 'true');
    
    if (params) {
      Object.keys(params).forEach(key => {
        const value = params[key as keyof typeof params];
        if (value !== undefined) {
          httpParams = httpParams.set(key, value.toString());
        }
      });
    }

    const url = `${this.baseUrl}/wp/v2/posts`;
    
    return this.http.get<WPPost[]>(url, { params: httpParams }).pipe(
      tap(posts => this.posts.set(posts))
    );
  }

  getPostById(id: number): Observable<WPPost> {
    const url = `${this.baseUrl}/wp/v2/posts/${id}`;
    const params = new HttpParams().set('_embed', 'true');
    
    return this.http.get<WPPost>(url, { params });
  }

  getPostBySlug(slug: string): Observable<WPPost[]> {
    const url = `${this.baseUrl}/wp/v2/posts`;
    const params = new HttpParams()
      .set('slug', slug)
      .set('_embed', 'true');
    
    return this.http.get<WPPost[]>(url, { params });
  }

  searchPosts(searchTerm: string, perPage: number = 10): Observable<WPPost[]> {
    return this.getPosts({ search: searchTerm, per_page: perPage });
  }

  getFeaturedPosts(limit: number = 3): Observable<WPPost[]> {
    return this.getPosts({ 
      per_page: limit,
      orderby: 'date',
      order: 'desc'
    }).pipe(
      tap(posts => this.featuredPosts.set(posts))
    );
  }

  getPostsByCategory(categoryId: number, perPage: number = 10): Observable<WPPost[]> {
    return this.getPosts({ 
      categories: categoryId.toString(),
      per_page: perPage
    });
  }

  getCategories(): Observable<any[]> {
    const url = `${this.baseUrl}/wp/v2/categories`;
    return this.http.get<any[]>(url);
  }

  getTags(): Observable<any[]> {
    const url = `${this.baseUrl}/wp/v2/tags`;
    return this.http.get<any[]>(url);
  }

  getPostsSignal() {
    return this.posts;
  }

  getFeaturedPostsSignal() {
    return this.featuredPosts;
  }
}

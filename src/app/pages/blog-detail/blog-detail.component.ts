import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { BlogService } from '@core/services/blog.service';
import { ToastService } from '@shared/services/toast.service';
import { WPPost } from '@core/models';

/**
 * Blog Detail Page Component
 *
 * Displays a single blog post with:
 * - Featured image
 * - Title, author, and publication date
 * - Full post content (sanitized HTML)
 * - Categories and tags
 * - Breadcrumb navigation
 * - Back to blog button
 * - Loading state
 * - Error handling
 *
 * @example
 * Route: /blog/:slug
 */
@Component({
  selector: 'app-blog-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule
  ],
  templateUrl: './blog-detail.component.html'
})
export class BlogDetailComponent implements OnInit {
  /** Inject services */
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly blogService = inject(BlogService);
  private readonly toastService = inject(ToastService);
  private readonly sanitizer = inject(DomSanitizer);

  /** Loading state signal */
  public readonly isLoading = signal<boolean>(true);

  /** Post signal */
  public readonly post = signal<WPPost | null>(null);

  /** Error state signal */
  public readonly hasError = signal<boolean>(false);

  ngOnInit(): void {
    this.loadPost();
  }

  /**
   * Load blog post from route parameter
   */
  private loadPost(): void {
    const slug = this.route.snapshot.paramMap.get('slug');

    if (!slug) {
      this.handleError('Post no encontrado');
      return;
    }

    this.isLoading.set(true);
    this.hasError.set(false);

    this.blogService.getPostBySlug(slug).subscribe({
      next: (post) => {
        if (post) {
          this.post.set(post);
          this.isLoading.set(false);
        } else {
          this.handleError('Post no encontrado');
        }
      },
      error: (error) => {
        console.error('Error loading blog post:', error);
        this.handleError(error.message || 'Error al cargar el post');
      }
    });
  }

  /**
   * Handle error state
   *
   * @param message - Error message to display
   */
  private handleError(message: string): void {
    this.hasError.set(true);
    this.isLoading.set(false);
    this.toastService.error(message, 4000);
  }

  /**
   * Get post title
   *
   * @returns Post title or empty string
   */
  getTitle(): string {
    return this.post()?.title.rendered || '';
  }

  /**
   * Get sanitized post content
   *
   * @returns Sanitized HTML content
   */
  getSanitizedContent(): SafeHtml {
    const content = this.post()?.content.rendered || '';
    return this.sanitizer.sanitize(1, content) || '';
  }

  /**
   * Get featured image URL
   *
   * @returns Image URL or placeholder
   */
  getFeaturedImage(): string {
    return this.post()?._embedded?.['wp:featuredmedia']?.[0]?.source_url ||
      'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1200&h=600&fit=crop';
  }

  /**
   * Get author name
   *
   * @returns Author name
   */
  getAuthorName(): string {
    return this.post()?._embedded?.author?.[0]?.name || 'Autor Desconocido';
  }

  /**
   * Get author avatar URL
   *
   * @returns Avatar URL or null
   */
  getAuthorAvatar(): string | null {
    return this.post()?._embedded?.author?.[0]?.avatar_urls?.['96'] || null;
  }

  /**
   * Get formatted publication date
   *
   * @returns Formatted date string
   */
  getFormattedDate(): string {
    const post = this.post();
    if (!post) return '';

    const date = new Date(post.date);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  /**
   * Get post categories
   *
   * @returns Array of category names
   */
  getCategories(): string[] {
    const categories = this.post()?._embedded?.['wp:term']?.[0] || [];
    return categories.map(cat => cat.name);
  }

  /**
   * Get post tags
   *
   * @returns Array of tag names
   */
  getTags(): string[] {
    const tags = this.post()?._embedded?.['wp:term']?.[1] || [];
    return tags.map(tag => tag.name);
  }

  /**
   * Navigate back to blog list
   */
  backToBlog(): void {
    this.router.navigate(['/blog']);
  }

  /**
   * Retry loading the post
   */
  retryLoad(): void {
    this.loadPost();
  }
}

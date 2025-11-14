import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BlogService } from '@core/services/blog.service';
import { ToastService } from '@shared/services/toast.service';
import { CardSkeletonComponent } from '@shared/components/card-skeleton/card-skeleton.component';
import { WPPost } from '@core/models';

/**
 * Blog Page Component
 *
 * Displays a paginated list of blog posts with:
 * - Responsive grid layout using BlogCard components
 * - Loading state with CardSkeleton
 * - Pagination controls
 * - Empty state when no posts available
 * - Error handling with toast notifications
 *
 * @example
 * Route: /blog
 */
@Component({
  selector: 'app-blog',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    CardSkeletonComponent
  ],
  templateUrl: './blog.component.html'
})
export class BlogComponent implements OnInit {
  /** Inject services */
  private readonly blogService = inject(BlogService);
  private readonly toastService = inject(ToastService);

  /** Loading state signal */
  public readonly isLoading = signal<boolean>(true);

  /** Blog posts signal */
  public readonly posts = signal<WPPost[]>([]);

  /** Current page signal */
  public readonly currentPage = signal<number>(1);

  /** Total pages signal */
  public readonly totalPages = signal<number>(1);

  /** Total posts count signal */
  public readonly totalPosts = signal<number>(0);

  /** Posts per page */
  private readonly perPage = 9;

  /** Skeleton array for loading state (9 items - 3x3 grid) */
  public readonly skeletonArray = Array(6).fill(0);

  /** Computed: Check if there are no posts */
  public readonly isEmpty = computed(() => !this.isLoading() && this.posts().length === 0);

  /** Computed: Has previous page */
  public readonly hasPreviousPage = computed(() => this.currentPage() > 1);

  /** Computed: Has next page */
  public readonly hasNextPage = computed(() => this.currentPage() < this.totalPages());

  ngOnInit(): void {
    this.loadPosts();
  }

  /**
   * Load blog posts from the API
   *
   * @param page - Page number to load (default: 1)
   */
  private loadPosts(page: number = 1): void {
    this.isLoading.set(true);

    this.blogService.getPosts({
      page,
      per_page: this.perPage,
      orderby: 'date',
      order: 'desc'
    }).subscribe({
      next: (response) => {
        this.posts.set(response.posts);
        this.currentPage.set(response.currentPage);
        this.totalPages.set(response.totalPages);
        this.totalPosts.set(response.total);
        this.isLoading.set(false);

        // Scroll to top when changing pages
        if (page > 1) {
          this.scrollToTop();
        }
      },
      error: (error) => {
        console.error('Error loading blog posts:', error);
        this.toastService.error(
          error.message || 'Error al cargar los posts del blog',
          4000
        );
        this.isLoading.set(false);
      }
    });
  }

  /**
   * Navigate to next page
   */
  nextPage(): void {
    if (this.hasNextPage()) {
      this.loadPosts(this.currentPage() + 1);
    }
  }

  /**
   * Navigate to previous page
   */
  previousPage(): void {
    if (this.hasPreviousPage()) {
      this.loadPosts(this.currentPage() - 1);
    }
  }

  /**
   * Navigate to specific page
   *
   * @param page - Page number
   */
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages() && page !== this.currentPage()) {
      this.loadPosts(page);
    }
  }

  /**
   * Get page numbers to display in pagination
   * Shows current page, previous, next, and ellipsis for large page counts
   *
   * @returns Array of page numbers and 'ellipsis' strings
   */
  getPageNumbers(): (number | string)[] {
    const total = this.totalPages();
    const current = this.currentPage();
    const pages: (number | string)[] = [];

    if (total <= 7) {
      // Show all pages if 7 or fewer
      for (let i = 1; i <= total; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      // Show ellipsis if current page is far from start
      if (current > 3) {
        pages.push('ellipsis-start');
      }

      // Show pages around current page
      const start = Math.max(2, current - 1);
      const end = Math.min(total - 1, current + 1);
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      // Show ellipsis if current page is far from end
      if (current < total - 2) {
        pages.push('ellipsis-end');
      }

      // Always show last page
      pages.push(total);
    }

    return pages;
  }

  /**
   * Get featured image URL or placeholder
   *
   * @param post - WordPress post
   * @returns Image URL
   */
  getFeaturedImage(post: WPPost): string {
    return post._embedded?.['wp:featuredmedia']?.[0]?.source_url ||
      'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&h=600&fit=crop';
  }

  /**
   * Get post title
   *
   * @param post - WordPress post
   * @returns Post title
   */
  getTitle(post: WPPost): string {
    return post.title.rendered;
  }

  /**
   * Get post excerpt as plain text
   *
   * @param post - WordPress post
   * @returns Plain text excerpt
   */
  getExcerpt(post: WPPost): string {
    const div = document.createElement('div');
    div.innerHTML = post.excerpt.rendered;
    const text = div.textContent || div.innerText || '';
    return text.length > 150 ? text.substring(0, 150) + '...' : text;
  }

  /**
   * Get author name
   *
   * @param post - WordPress post
   * @returns Author name
   */
  getAuthorName(post: WPPost): string {
    return post._embedded?.author?.[0]?.name || 'Autor Desconocido';
  }

  /**
   * Get author avatar URL
   *
   * @param post - WordPress post
   * @returns Avatar URL or null
   */
  getAuthorAvatar(post: WPPost): string | null {
    return post._embedded?.author?.[0]?.avatar_urls?.['96'] || null;
  }

  /**
   * Get formatted date
   *
   * @param post - WordPress post
   * @returns Formatted date string
   */
  getFormattedDate(post: WPPost): string {
    const date = new Date(post.date);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  /**
   * Get post categories (max 2)
   *
   * @param post - WordPress post
   * @returns Array of category names
   */
  getCategories(post: WPPost): string[] {
    const categories = post._embedded?.['wp:term']?.[0] || [];
    return categories.slice(0, 2).map(cat => cat.name);
  }

  /**
   * Scroll to top of page
   */
  private scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

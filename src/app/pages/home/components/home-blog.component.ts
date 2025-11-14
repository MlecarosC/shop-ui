import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { BlogService } from '@core/services/blog.service';
import { ToastService } from '@shared/services/toast.service';
import { BlogCardComponent } from '@shared/components/blog-card/blog-card.component';
import { CardSkeletonComponent } from '@shared/components/card-skeleton/card-skeleton.component';
import { BlogPost } from '@core/models';

/**
 * Home Blog Component
 *
 * Muestra una sección de posts de blog recientes en la página de inicio.
 * - Carga los posts destacados/recientes del blog
 * - Grid responsive de BlogCard
 * - Loading state con CardSkeleton
 * - Botón para ver todos los posts
 *
 * @example
 * ```html
 * <app-home-blog />
 * ```
 */
@Component({
  selector: 'app-home-blog',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    BlogCardComponent,
    CardSkeletonComponent
  ],
  templateUrl: './home-blog.component.html'
})
export class HomeBlogComponent implements OnInit {
  /** Inyección de servicios */
  private readonly blogService = inject(BlogService);
  private readonly toastService = inject(ToastService);
  private readonly router = inject(Router);

  /** Signal para el estado de carga */
  public readonly isLoading = signal<boolean>(true);

  /** Signal para los posts destacados */
  public readonly featuredPosts = signal<BlogPost[]>([]);

  /** Array para los skeleton loaders (3 items) */
  public readonly skeletonArray = Array(3).fill(0);

  ngOnInit(): void {
    this.loadFeaturedPosts();
  }

  /**
   * Carga los posts destacados desde el backend
   */
  private loadFeaturedPosts(): void {
    this.isLoading.set(true);

    // Intentar cargar posts destacados (sticky), si no hay, cargar los más recientes
    this.blogService.getFeaturedPosts({ per_page: 3 }).subscribe({
      next: (response) => {
        if (response.posts.length > 0) {
          this.featuredPosts.set(response.posts);
          this.isLoading.set(false);
        } else {
          // Si no hay posts destacados, cargar los más recientes
          this.loadRecentPosts();
        }
      },
      error: () => {
        // Si falla cargar destacados, intentar con recientes
        this.loadRecentPosts();
      }
    });
  }

  /**
   * Carga los posts más recientes como fallback
   */
  private loadRecentPosts(): void {
    this.blogService.getRecentPosts(3).subscribe({
      next: (posts) => {
        this.featuredPosts.set(posts);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading blog posts:', error);
        this.toastService.error(
          'No se pudieron cargar los posts del blog',
          4000
        );
        this.isLoading.set(false);
      }
    });
  }

  /**
   * Navega a la página de blog
   */
  navigateToBlog(): void {
    this.router.navigate(['/blog']);
  }
}

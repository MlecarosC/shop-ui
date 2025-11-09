import { ChangeDetectionStrategy, Component, inject, signal, effect } from '@angular/core';
import { BlogCard } from '../../../../shared/components/blogCard/blogCard';
import { CardSkeleton } from '../../../../shared/components/cardSkeleton/cardSkeleton';
import { RouterLink } from '@angular/router';
import { BlogService } from '../../../../shared/services/blog.service';

@Component({
  selector: 'app-home-blog',
  imports: [BlogCard, CardSkeleton, RouterLink],
  templateUrl: './homeBlog.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeBlog {
  private blogService = inject(BlogService);
  
  featuredPosts = this.blogService.getFeaturedPosts(2);
  isLoading = signal(true);

  constructor() {
    effect(() => {
      const posts = this.featuredPosts();
      if (posts && posts.length > 0) {
        setTimeout(() => {
          this.isLoading.set(false);
        }, 300);
      }
    });
  }
}

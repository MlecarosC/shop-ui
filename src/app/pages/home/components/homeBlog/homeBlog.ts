import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { BlogCard } from '../../../../shared/components/blogCard/blogCard';
import { RouterLink } from '@angular/router';
import { BlogService } from '../../../../shared/services/blog.service';

@Component({
  selector: 'app-home-blog',
  imports: [BlogCard, RouterLink],
  templateUrl: './homeBlog.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeBlog {
  private blogService = inject(BlogService);
  
  featuredPosts = signal(this.blogService.getFeaturedPosts(2));
}

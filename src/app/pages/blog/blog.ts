import { ChangeDetectionStrategy, Component, inject, signal, effect } from '@angular/core';
import { BlogCard } from '../../shared/components/blogCard/blogCard';
import { BlogService } from '../../shared/services/blog.service';
import { Loading } from '../../shared/components/loading/loading';

@Component({
  selector: 'app-blog',
  imports: [BlogCard, Loading],
  templateUrl: './blog.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Blog {
  private blogService = inject(BlogService);
  
  blogPosts = this.blogService.getAllPosts();
  isLoading = signal(true);

  constructor() {
    effect(() => {
      const posts = this.blogPosts();
      if (posts.length > 0) {
        setTimeout(() => {
          this.isLoading.set(false);
        }, 500);
      }
    });
  }
}

import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { BlogCard } from '../../shared/components/blogCard/blogCard';
import { BlogService } from '../../shared/services/blog.service';

@Component({
  selector: 'app-blog',
  imports: [BlogCard],
  templateUrl: './blog.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Blog {
  private blogService = inject(BlogService);
  
  blogPosts = signal(this.blogService.getAllPosts());
}

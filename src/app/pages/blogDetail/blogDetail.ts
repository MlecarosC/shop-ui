import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { BlogService } from '../../shared/services/blog.service';

@Component({
  selector: 'app-blog-detail',
  imports: [DatePipe],
  templateUrl: './blogDetail.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BlogDetail {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private blogService = inject(BlogService);

  postId = signal<number | null>(null);

  post = computed(() => {
    const id = this.postId();
    if (id === null) return null;
    return this.blogService.getPostById(id);
  });

  constructor() {
    this.route.params.subscribe(params => {
      const id = Number(params['id']);
      if (isNaN(id)) {
        this.router.navigate(['/blog']);
        return;
      }
      this.postId.set(id);
      
      if (!this.post()) {
        this.router.navigate(['/blog']);
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/blog']);
  }
}

import { ChangeDetectionStrategy, Component, inject, effect } from '@angular/core';
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

  post = this.blogService.getPostById(0);

  constructor() {
    this.route.params.subscribe(params => {
      const id = Number(params['id']);
      if (isNaN(id)) {
        this.router.navigate(['/blog']);
        return;
      }
      
      this.post = this.blogService.getPostById(id);

      effect(() => {
        const currentPost = this.post();
        if (currentPost === null && id !== 0) {
          this.router.navigate(['/blog']);
        }
      });
    });
  }

  goBack(): void {
    this.router.navigate(['/blog']);
  }
}
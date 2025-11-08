import { ChangeDetectionStrategy, Component, inject, OnDestroy, signal, effect } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { BlogService } from '../../shared/services/blog.service';
import { Subscription } from 'rxjs';
import { Loading } from '../../shared/components/loading/loading';
import { BlogPost } from '../blog/models/BlogPost';

@Component({
  selector: 'app-blog-detail',
  imports: [DatePipe, Loading],
  templateUrl: './blogDetail.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BlogDetail implements OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private blogService = inject(BlogService);
  private subscription = new Subscription();

  post = signal<BlogPost | null>(null);
  isLoading = signal(true);
  minLoadingTime = 500;
  loadingStartTime = 0;

  constructor() {
    this.subscription.add(
      this.route.params.subscribe(params => {
        const id = Number(params['id']);
        if (isNaN(id)) {
          this.router.navigate(['/blog']);
          return;
        }
        
        this.isLoading.set(true);
        this.loadingStartTime = Date.now();
        
        const postSignal = this.blogService.getPostById(id);
        effect(() => {
          const blogPost = postSignal();
          if (blogPost !== null) {
            this.post.set(blogPost);
          }
        });
      })
    );

    effect(() => {
      const blogPost = this.post();
      const elapsed = Date.now() - this.loadingStartTime;
      const remainingTime = Math.max(0, this.minLoadingTime - elapsed);

      if (blogPost !== null && this.loadingStartTime > 0) {
        setTimeout(() => {
          this.isLoading.set(false);
        }, remainingTime);
      }
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  goBack(): void {
    this.router.navigate(['/blog']);
  }
}

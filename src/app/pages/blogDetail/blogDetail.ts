import { ChangeDetectionStrategy, Component, inject, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { BlogService } from '../../shared/services/blog.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-blog-detail',
  imports: [DatePipe],
  templateUrl: './blogDetail.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BlogDetail implements OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private blogService = inject(BlogService);
  private subscription = new Subscription();

  post = this.blogService.getPostById(0);

  constructor() {
    this.subscription.add(
      this.route.params.subscribe(params => {
        const id = Number(params['id']);
        if (isNaN(id)) {
          this.router.navigate(['/blog']);
          return;
        }
        
        this.post = this.blogService.getPostById(id);
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  goBack(): void {
    this.router.navigate(['/blog']);
  }
}

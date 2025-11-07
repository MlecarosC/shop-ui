import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BlogPost } from '../../../pages/blog/models/BlogPost';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-blog-card',
  imports: [RouterLink, DatePipe],
  templateUrl: './blogCard.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BlogCard {
  post = input<BlogPost | null>(null);
}

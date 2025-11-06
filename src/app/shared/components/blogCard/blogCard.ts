import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-blog-card',
  imports: [],
  templateUrl: './blogCard.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BlogCard { }

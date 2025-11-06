import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BlogCard } from '../../../../shared/components/blogCard/blogCard';

@Component({
  selector: 'app-home-blog',
  imports: [BlogCard],
  templateUrl: './homeBlog.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeBlog { }

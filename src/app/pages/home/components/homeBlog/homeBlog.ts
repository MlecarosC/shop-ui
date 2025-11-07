import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BlogCard } from '../../../../shared/components/blogCard/blogCard';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home-blog',
  imports: [BlogCard, RouterLink],
  templateUrl: './homeBlog.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeBlog { }

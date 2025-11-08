import { Injectable, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { BlogApiService } from '../../core/services/blog-api.service';
import { BlogPost } from '../../pages/blog/models/BlogPost';
import { WPPost } from '../../core/models/woocommerce/wc-blog.model';
import { map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BlogService {
  private blogApiService = inject(BlogApiService);

  private mapWPPostToBlogPost(wpPost: WPPost): BlogPost {
    const featuredImage = wpPost._embedded?.['wp:featuredmedia']?.[0]?.source_url || 
                         'https://img.daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.webp';

    const author = wpPost._embedded?.author?.[0]?.name || 'Autor Desconocido';

    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = wpPost.excerpt.rendered;
    const excerpt = tempDiv.textContent || tempDiv.innerText || '';

    tempDiv.innerHTML = wpPost.content.rendered;
    const content = tempDiv.textContent || tempDiv.innerText || '';

    return {
      id: wpPost.id,
      title: wpPost.title.rendered,
      excerpt: excerpt.trim(),
      image: featuredImage,
      author: author,
      date: new Date(wpPost.date),
      content: content.trim()
    };
  }

  getAllPosts() {
    return toSignal(
      this.blogApiService.getPosts({ per_page: 100 }).pipe(
        map(wpPosts => wpPosts.map(wp => this.mapWPPostToBlogPost(wp)))
      ),
      { initialValue: [] }
    );
  }

  getPostById(id: number) {
    return toSignal(
      this.blogApiService.getPostById(id).pipe(
        map(wpPost => this.mapWPPostToBlogPost(wpPost))
      ),
      { initialValue: null }
    );
  }

  getFeaturedPosts(limit: number = 2) {
    return toSignal(
      this.blogApiService.getFeaturedPosts(limit).pipe(
        map(wpPosts => wpPosts.map(wp => this.mapWPPostToBlogPost(wp)))
      ),
      { initialValue: [] }
    );
  }
}

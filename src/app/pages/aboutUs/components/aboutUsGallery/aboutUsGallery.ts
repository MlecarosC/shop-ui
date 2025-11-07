import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { GalleryImage } from '../../models/GalleryImage';

@Component({
  selector: 'app-about-us-gallery',
  imports: [],
  templateUrl: './aboutUsGallery.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AboutUsGallery {
  images = signal<GalleryImage[]>([
    {
      url: 'https://img.daisyui.com/images/stock/photo-1559703248-dcaaec9fab78.webp',
      alt: 'Team collaboration'
    },
    {
      url: 'https://img.daisyui.com/images/stock/photo-1565098772267-60af42b81ef2.webp',
      alt: 'Office environment'
    },
    {
      url: 'https://img.daisyui.com/images/stock/photo-1572635148818-ef6fd45eb394.webp',
      alt: 'Team meeting'
    },
    {
      url: 'https://img.daisyui.com/images/stock/photo-1494232410401-ad00d5433cfa.webp',
      alt: 'Innovation workshop'
    },
    {
      url: 'https://img.daisyui.com/images/stock/photo-1550439062-609e1531270e.webp',
      alt: 'Company event'
    },
    {
      url: 'https://img.daisyui.com/images/stock/photo-1559181567-c3190ca9959b.webp',
      alt: 'Work culture'
    }
  ]);
}

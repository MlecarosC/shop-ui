import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AboutUsHero } from './components/aboutUsHero/aboutUsHero';
import { AboutUsImageText } from './components/aboutUsImageText/aboutUsImageText';
import { AboutUsTextImage } from './components/aboutUsTextImage/aboutUsTextImage';
import { AboutUsValues } from './components/aboutUsValues/aboutUsValues';
import { LogoCarousel } from '../../shared/components/logoCarousel/logoCarousel';
import { AboutUsGallery } from './components/aboutUsGallery/aboutUsGallery';

@Component({
  selector: 'app-about-us',
  imports: [
    AboutUsHero,
    AboutUsImageText,
    AboutUsTextImage,
    AboutUsValues,
    LogoCarousel,
    AboutUsGallery
  ],
  templateUrl: './aboutUs.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AboutUs { }

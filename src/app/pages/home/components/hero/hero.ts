import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { CarouselSlide } from '../../models/CarouselSlide';


@Component({
  selector: 'app-hero',
  imports: [],
  templateUrl: './hero.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Hero { 
  slides = signal<CarouselSlide[]>([
    {
      id: 'slide1',
      image: 'https://img.daisyui.com/images/stock/photo-1625726411847-8cbb60cc71e6.webp',
      alt: 'Slide 1',
      title: 'Hello there',
      subtitle: 'Provident cupiditate voluptatem et in. Quaerat fugiat ut assumenda excepturi exercitationem quasi. In deleniti eaque aut repudiandae et a id nisi.',
      buttonText: 'Get Started'
    },
    {
      id: 'slide2',
      image: 'https://img.daisyui.com/images/stock/photo-1609621838510-5ad474b7d25d.webp',
      alt: 'Slide 2',
      title: 'Welcome to Slide 2',
      subtitle: 'Este es otro slide con su propio contenido y subtítulo.',
      buttonText: 'Learn More'
    }
  ]);

  navigateToSlide(slideId: string, event: Event): void {
    event.preventDefault();
    const element = document.getElementById(slideId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
    }
  }

  getPreviousSlideId(currentIndex: number): string {
    const slidesArray = this.slides();
    const previousIndex = currentIndex === 0 ? slidesArray.length - 1 : currentIndex - 1;
    return slidesArray[previousIndex].id;
  }

  getNextSlideId(currentIndex: number): string {
    const slidesArray = this.slides();
    const nextIndex = currentIndex === slidesArray.length - 1 ? 0 : currentIndex + 1;
    return slidesArray[nextIndex].id;
  }
}

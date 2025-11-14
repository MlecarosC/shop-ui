import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeroComponent } from './components/hero.component';
import { HomeProductsComponent } from './components/home-products.component';
import { HomeAboutUsComponent } from './components/home-about-us.component';
import { HomeBlogComponent } from './components/home-blog.component';
import { LogoCarouselComponent } from '@shared/components/logo-carousel/logo-carousel.component';

/**
 * Home Page Component
 *
 * Página principal de inicio que compone todas las secciones:
 * 1. Hero - Banner principal con CTA
 * 2. Products - Productos destacados
 * 3. Logo Carousel - Logos de clientes/partners
 * 4. About Us - Sección sobre nosotros
 * 5. Blog - Últimos posts del blog
 *
 * Este componente es standalone y no requiere lógica adicional,
 * simplemente organiza y muestra todos los subcomponentes en el orden correcto.
 *
 * @example
 * ```typescript
 * // En las rutas:
 * {
 *   path: '',
 *   component: HomeComponent
 * }
 * ```
 */
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    HeroComponent,
    HomeProductsComponent,
    HomeAboutUsComponent,
    HomeBlogComponent,
    LogoCarouselComponent
  ],
  templateUrl: './home.component.html'
})
export class HomeComponent {
  /**
   * Array de URLs de logos para el carrusel
   * Estos logos representan clientes, partners o certificaciones
   */
  public readonly partnerLogos: string[] = [
    'https://placehold.co/150x60/e2e8f0/64748b?text=Partner+1',
    'https://placehold.co/150x60/e2e8f0/64748b?text=Partner+2',
    'https://placehold.co/150x60/e2e8f0/64748b?text=Partner+3',
    'https://placehold.co/150x60/e2e8f0/64748b?text=Partner+4',
    'https://placehold.co/150x60/e2e8f0/64748b?text=Partner+5',
    'https://placehold.co/150x60/e2e8f0/64748b?text=Partner+6',
    'https://placehold.co/150x60/e2e8f0/64748b?text=Partner+7',
    'https://placehold.co/150x60/e2e8f0/64748b?text=Partner+8'
  ];
}

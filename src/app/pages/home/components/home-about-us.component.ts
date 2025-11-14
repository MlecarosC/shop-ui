import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

/**
 * Home About Us Component
 *
 * Sección "Sobre Nosotros" resumida en la página de inicio.
 * - Layout de 2 columnas: imagen + texto
 * - Texto con quiénes somos, misión y valores
 * - Botón CTA para conocer más (navega a /about-us)
 * - Diseño responsive y atractivo
 *
 * @example
 * ```html
 * <app-home-about-us />
 * ```
 */
@Component({
  selector: 'app-home-about-us',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home-about-us.component.html'
})
export class HomeAboutUsComponent {
  /** Inyección del Router para navegación */
  private readonly router = inject(Router);

  /**
   * Navega a la página completa de About Us
   */
  navigateToAboutUs(): void {
    this.router.navigate(['/about-us']);
  }
}

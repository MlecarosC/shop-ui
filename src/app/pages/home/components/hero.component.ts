import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

/**
 * Hero Component
 *
 * Banner principal de la página de inicio con:
 * - Imagen de fondo a pantalla completa
 * - Título grande y subtítulo
 * - Call to action con botón
 * - Gradiente overlay para mejor legibilidad
 * - Diseño responsive y moderno
 *
 * @example
 * ```html
 * <app-hero />
 * ```
 */
@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './hero.component.html'
})
export class HeroComponent {
  /** Inyección del Router para navegación */
  private readonly router = inject(Router);

  /**
   * Navega a la página de productos
   */
  navigateToProducts(): void {
    this.router.navigate(['/products']);
  }
}

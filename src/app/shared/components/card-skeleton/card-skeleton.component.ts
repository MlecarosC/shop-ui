import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Card Skeleton Component
 *
 * Componente skeleton loader para mostrar mientras se cargan datos.
 * Reutilizable para diferentes tipos de tarjetas (productos, posts, etc.).
 *
 * @example
 * ```html
 * <!-- Skeleton básico -->
 * <app-card-skeleton />
 *
 * <!-- Skeleton para producto -->
 * <app-card-skeleton type="product" />
 *
 * <!-- Skeleton para blog post -->
 * <app-card-skeleton type="blog" />
 *
 * <!-- Múltiples skeletons -->
 * @for (item of [1,2,3,4]; track item) {
 *   <app-card-skeleton />
 * }
 * ```
 */
@Component({
  selector: 'app-card-skeleton',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './card-skeleton.component.html'
})
export class CardSkeletonComponent {
  /**
   * Tipo de skeleton a mostrar
   * - 'product': Skeleton para tarjeta de producto
   * - 'blog': Skeleton para tarjeta de blog
   * - 'default': Skeleton genérico
   */
  @Input() type: 'product' | 'blog' | 'default' = 'default';

  /**
   * Altura personalizada para la imagen (en pixels)
   * Por defecto: 256px para product, 192px para blog, 200px para default
   */
  @Input() imageHeight?: number;

  /**
   * Obtiene la altura de la imagen según el tipo
   */
  get calculatedImageHeight(): number {
    if (this.imageHeight) {
      return this.imageHeight;
    }

    switch (this.type) {
      case 'product':
        return 256; // h-64
      case 'blog':
        return 192; // h-48
      default:
        return 200;
    }
  }
}

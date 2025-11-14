import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Loading Component
 *
 * Componente de carga que muestra un spinner centrado en pantalla.
 * Usa DaisyUI loading component para el spinner.
 *
 * @example
 * ```html
 * <!-- Loading simple -->
 * <app-loading />
 *
 * <!-- Loading con mensaje -->
 * <app-loading message="Cargando productos..." />
 *
 * <!-- Loading con tamaño personalizado -->
 * <app-loading size="lg" message="Procesando..." />
 *
 * <!-- Loading inline (no centrado) -->
 * <app-loading [fullScreen]="false" size="sm" />
 * ```
 */
@Component({
  selector: 'app-loading',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './loading.component.html'
})
export class LoadingComponent {
  /**
   * Mensaje opcional a mostrar debajo del spinner
   */
  @Input() message: string = '';

  /**
   * Tamaño del spinner
   * - 'xs': Extra pequeño
   * - 'sm': Pequeño
   * - 'md': Mediano (por defecto)
   * - 'lg': Grande
   */
  @Input() size: 'xs' | 'sm' | 'md' | 'lg' = 'md';

  /**
   * Si true, muestra el loading centrado en pantalla completa
   * Si false, muestra el loading inline
   */
  @Input() fullScreen: boolean = true;

  /**
   * Tipo de spinner
   * - 'spinner': Spinner circular (por defecto)
   * - 'dots': Puntos animados
   * - 'ring': Anillo animado
   * - 'ball': Bola animada
   * - 'bars': Barras animadas
   */
  @Input() type: 'spinner' | 'dots' | 'ring' | 'ball' | 'bars' = 'spinner';

  /**
   * Color del spinner (clases de Tailwind)
   * Por defecto: 'text-primary'
   */
  @Input() color: string = 'text-primary';

  /**
   * Obtiene las clases CSS para el spinner
   */
  get spinnerClasses(): string {
    const sizeClass = `loading-${this.size}`;
    const typeClass = `loading-${this.type}`;

    return `loading ${typeClass} ${sizeClass} ${this.color}`;
  }
}

import { Component, Input, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Logo Carousel Component
 *
 * Carrusel infinito de logos con auto-scroll suave.
 * No requiere dependencias externas, usa solo CSS animations.
 *
 * @example
 * ```html
 * <app-logo-carousel
 *   [logos]="['logo1.png', 'logo2.png', 'logo3.png']"
 *   [speed]="30"
 * />
 * ```
 */
@Component({
  selector: 'app-logo-carousel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './logo-carousel.component.html'
})
export class LogoCarouselComponent implements OnInit {
  /**
   * Array de URLs de logos a mostrar
   */
  @Input() logos: string[] = [];

  /**
   * Velocidad del scroll en segundos (menor = más rápido)
   * Por defecto: 30 segundos
   */
  @Input() speed: number = 30;

  /**
   * Altura de los logos en pixels
   * Por defecto: 60px
   */
  @Input() logoHeight: number = 60;

  /**
   * Pausar animación en hover
   * Por defecto: true
   */
  @Input() pauseOnHover: boolean = true;

  /**
   * Signal con los logos duplicados para efecto infinito
   */
  public readonly duplicatedLogos = signal<string[]>([]);

  ngOnInit(): void {
    // Duplicar los logos para crear el efecto de scroll infinito
    this.duplicatedLogos.set([...this.logos, ...this.logos]);
  }

  /**
   * Obtiene el estilo de animación dinámico
   */
  get animationStyle(): { [key: string]: string } {
    return {
      '--animation-duration': `${this.speed}s`
    };
  }
}

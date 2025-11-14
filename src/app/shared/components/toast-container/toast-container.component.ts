import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '@shared/services/toast.service';
import { Toast, ToastType } from '@core/models';

/**
 * Toast Container Component
 *
 * Contenedor de notificaciones toast que se muestra en la esquina superior derecha.
 * Lee los toasts desde el ToastService y los muestra con animaciones.
 *
 * Este componente debe ser incluido en el app.component.html una sola vez:
 *
 * @example
 * ```html
 * <!-- En app.component.html -->
 * <app-toast-container />
 * ```
 *
 * Para mostrar toasts, use el ToastService:
 * ```typescript
 * constructor(private toastService: ToastService) {}
 *
 * showSuccess() {
 *   this.toastService.success('¡Operación exitosa!');
 * }
 * ```
 */
@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast-container.component.html'
})
export class ToastContainerComponent {
  /** Inject ToastService */
  private readonly toastService = inject(ToastService);

  /** Signal de toasts desde el servicio */
  public readonly toasts = this.toastService.toasts;

  /**
   * Obtiene las clases CSS para el tipo de alert
   */
  getAlertClasses(type: ToastType): string {
    const baseClasses = 'alert shadow-lg';

    switch (type) {
      case 'success':
        return `${baseClasses} alert-success`;
      case 'error':
        return `${baseClasses} alert-error`;
      case 'warning':
        return `${baseClasses} alert-warning`;
      case 'info':
        return `${baseClasses} alert-info`;
      default:
        return baseClasses;
    }
  }

  /**
   * Obtiene el ícono SVG para el tipo de toast
   */
  getIcon(type: ToastType): string {
    switch (type) {
      case 'success':
        return 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z';
      case 'error':
        return 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z';
      case 'warning':
        return 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z';
      case 'info':
        return 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z';
      default:
        return 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z';
    }
  }

  /**
   * Cierra un toast manualmente
   */
  close(toast: Toast): void {
    if (toast.id) {
      this.toastService.remove(toast.id);
    }
  }

  /**
   * Track by function para optimizar el rendering
   */
  trackByToastId(index: number, toast: Toast): string {
    return toast.id || index.toString();
  }
}

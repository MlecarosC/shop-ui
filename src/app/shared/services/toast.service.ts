import { Injectable, signal } from '@angular/core';
import { Toast, ToastType } from '@core/models';

/**
 * Toast Service - Gestión de notificaciones toast
 *
 * Este servicio proporciona un sistema de notificaciones tipo toast
 * para mostrar mensajes al usuario de forma no intrusiva.
 *
 * Uso:
 * ```typescript
 * constructor(private toastService: ToastService) {}
 *
 * showSuccess() {
 *   this.toastService.success('¡Operación exitosa!');
 * }
 * ```
 */
@Injectable({
  providedIn: 'root'
})
export class ToastService {
  /**
   * Signal que contiene todos los toasts activos
   */
  public toasts = signal<Toast[]>([]);

  /**
   * Contador para generar IDs únicos
   */
  private nextId = 0;

  /**
   * Muestra una notificación toast
   *
   * @param message - Mensaje a mostrar
   * @param type - Tipo de toast (success, error, warning, info)
   * @param duration - Duración en milisegundos (0 = no auto-cerrar)
   */
  show(message: string, type: ToastType = 'info', duration: number = 3000): void {
    const id = this.nextId++;

    const toast: Toast = {
      id: id.toString(),
      message,
      type,
      duration
    };

    // Agregar el toast al array
    this.toasts.update(toasts => [...toasts, toast]);

    // Auto-remover después de la duración especificada
    if (duration > 0) {
      setTimeout(() => {
        this.remove(toast.id);
      }, duration);
    }
  }

  /**
   * Muestra una notificación de éxito
   */
  success(message: string, duration: number = 3000): void {
    this.show(message, 'success', duration);
  }

  /**
   * Muestra una notificación de error
   */
  error(message: string, duration: number = 4000): void {
    this.show(message, 'error', duration);
  }

  /**
   * Muestra una notificación de advertencia
   */
  warning(message: string, duration: number = 3500): void {
    this.show(message, 'warning', duration);
  }

  /**
   * Muestra una notificación informativa
   */
  info(message: string, duration: number = 3000): void {
    this.show(message, 'info', duration);
  }

  /**
   * Remueve un toast específico
   */
  remove(id: string): void {
    this.toasts.update(toasts => toasts.filter(t => t.id !== id));
  }

  /**
   * Remueve todos los toasts
   */
  clear(): void {
    this.toasts.set([]);
  }
}

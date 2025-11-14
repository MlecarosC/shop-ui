import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BlogPost } from '@core/models';

/**
 * Blog Card Component
 *
 * Tarjeta de post de blog que muestra:
 * - Imagen destacada
 * - Título y excerpt
 * - Autor y fecha de publicación
 * - Categorías
 * - Link al detalle del post
 *
 * @example
 * ```html
 * <app-blog-card [post]="post" />
 * ```
 */
@Component({
  selector: 'app-blog-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './blog-card.component.html'
})
export class BlogCardComponent {
  /** Post de blog a mostrar (requerido) */
  @Input({ required: true }) post!: BlogPost;

  /**
   * Obtiene la imagen destacada del post o una imagen por defecto
   */
  get featuredImage(): string {
    return this.post.featuredImageUrl || 'https://via.placeholder.com/400x250?text=Sin+Imagen';
  }

  /**
   * Formatea la fecha de publicación
   */
  get formattedDate(): string {
    const date = new Date(this.post.date);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  /**
   * Obtiene el nombre del autor
   */
  get authorName(): string {
    return this.post.authorName || 'Autor Desconocido';
  }

  /**
   * Extrae texto plano del excerpt HTML
   */
  get plainExcerpt(): string {
    const div = document.createElement('div');
    div.innerHTML = this.post.excerpt;
    const text = div.textContent || div.innerText || '';
    // Limitar a 150 caracteres
    return text.length > 150 ? text.substring(0, 150) + '...' : text;
  }

  /**
   * Obtiene las primeras 2 categorías del post
   */
  get displayCategories(): string[] {
    return this.post.categories.slice(0, 2).map(cat => cat.name);
  }
}

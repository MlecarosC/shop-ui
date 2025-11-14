import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

/**
 * About Us Page Component
 *
 * Institutional page displaying company information:
 * - Hero section with company introduction
 * - Our Story section with timeline/history
 * - Mission and Vision in two columns
 * - Company Values in grid layout
 * - Team section (placeholder for team members)
 * - Image gallery
 * - Call-to-action section
 *
 * @example
 * Route: /about-us
 */
@Component({
  selector: 'app-about-us',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule
  ],
  templateUrl: './about-us.component.html'
})
export class AboutUsComponent {
  /**
   * Company values to display
   */
  public readonly values = [
    {
      icon: 'M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z',
      title: 'Calidad Garantizada',
      description: 'Ofrecemos productos de la más alta calidad, cuidadosamente seleccionados para satisfacer las necesidades de nuestros clientes.'
    },
    {
      icon: 'M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z',
      title: 'Atención Personalizada',
      description: 'Nuestro equipo está comprometido en brindar una experiencia de compra excepcional y atención dedicada a cada cliente.'
    },
    {
      icon: 'M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z',
      title: 'Precios Justos',
      description: 'Mantenemos precios competitivos y justos, garantizando el mejor valor por tu inversión sin comprometer la calidad.'
    },
    {
      icon: 'M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z',
      title: 'Innovación Constante',
      description: 'Nos mantenemos actualizados con las últimas tendencias y tecnologías para ofrecer productos innovadores y relevantes.'
    }
  ];

  /**
   * Gallery images
   */
  public readonly galleryImages = [
    {
      url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop',
      alt: 'Oficina moderna con ambiente colaborativo'
    },
    {
      url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=600&fit=crop',
      alt: 'Equipo trabajando en proyectos innovadores'
    },
    {
      url: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=800&h=600&fit=crop',
      alt: 'Espacio de trabajo creativo y productivo'
    },
    {
      url: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&h=600&fit=crop',
      alt: 'Reunión de equipo planificando estrategias'
    }
  ];
}

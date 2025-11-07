import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { LogoPartner } from '../../models/LogoPartner';

@Component({
  selector: 'app-logo-carousel',
  imports: [],
  templateUrl: './logoCarousel.html',
  styleUrl: './logoCarousel.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LogoCarousel {
  partners = signal<LogoPartner[]>([
    {
      name: 'Partner 1',
      logo: 'https://via.placeholder.com/150x60/4F46E5/ffffff?text=Logo+1',
      url: 'https://example.com/partner1'
    },
    {
      name: 'Partner 2',
      logo: 'https://via.placeholder.com/150x60/7C3AED/ffffff?text=Logo+2',
      url: 'https://example.com/partner2'
    },
    {
      name: 'Partner 3',
      logo: 'https://via.placeholder.com/150x60/2563EB/ffffff?text=Logo+3',
      url: 'https://example.com/partner3'
    },
    {
      name: 'Partner 4',
      logo: 'https://via.placeholder.com/150x60/DC2626/ffffff?text=Logo+4',
      url: 'https://example.com/partner4'
    },
    {
      name: 'Partner 5',
      logo: 'https://via.placeholder.com/150x60/059669/ffffff?text=Logo+5',
      url: 'https://example.com/partner5'
    },
    {
      name: 'Partner 6',
      logo: 'https://via.placeholder.com/150x60/EA580C/ffffff?text=Logo+6',
      url: 'https://example.com/partner6'
    }
  ]);

  openPartnerUrl(url: string): void {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
}

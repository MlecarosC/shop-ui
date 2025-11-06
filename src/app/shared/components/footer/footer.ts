import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  imports: [RouterLink],
  templateUrl: './footer.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Footer {
  readonly currentYear = new Date().getFullYear();

  readonly quickLinks = [
    { label: 'About Us', route: '/about' },
    { label: 'Contact', route: '/contact' }
  ];

  readonly categories = [
    { label: 'Products', route: '/products' },
    { label: 'Services', route: '/services' },
    { label: 'Solutions', route: '/solutions' },
    { label: 'Resources', route: '/resources' }
  ];
}

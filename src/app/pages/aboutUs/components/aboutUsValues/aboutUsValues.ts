import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { CompanyValue } from '../../models/CompanyValue';

@Component({
  selector: 'app-about-us-values',
  imports: [],
  templateUrl: './aboutUsValues.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AboutUsValues {
  values = signal<CompanyValue[]>([
    {
      title: 'Innovation',
      description: 'We constantly push boundaries and explore new possibilities to deliver groundbreaking solutions that shape the future of technology.'
    },
    {
      title: 'Integrity',
      description: 'We operate with honesty and transparency in all our dealings, building trust with our clients and partners through ethical practices.'
    },
    {
      title: 'Excellence',
      description: 'We strive for the highest quality in everything we do, from our products to our customer service, ensuring exceptional results every time.'
    },
    {
      title: 'Collaboration',
      description: 'We believe in the power of teamwork and foster a culture of cooperation, both within our organization and with our clients.'
    }
  ]);
}

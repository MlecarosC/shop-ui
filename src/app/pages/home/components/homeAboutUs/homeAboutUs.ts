import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home-about-us',
  imports: [RouterLink],
  templateUrl: './homeAboutUs.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeAboutUs { }

import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-card-skeleton',
  standalone: true,
  templateUrl: './cardSkeleton.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardSkeleton {}

import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-loading',
  standalone: true,
  template: `
    <div class="flex flex-col items-center justify-center py-20">
      <span class="loading loading-spinner loading-lg text-primary mb-4"></span>
      <p class="text-base-content/70">{{ message() }}</p>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Loading {
  message = input<string>('Cargando...');
}

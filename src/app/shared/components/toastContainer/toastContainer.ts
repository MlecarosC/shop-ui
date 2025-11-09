import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  templateUrl: './toastContainer.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToastContainer {
  protected toastService = inject(ToastService);
  protected toasts = this.toastService.getToasts();
}

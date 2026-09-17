import { Injectable, inject } from '@angular/core';
import { ToastController } from '@ionic/angular';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

@Injectable({ providedIn: 'root' })
export class ToastService {
  private ctrl = inject(ToastController);
  private async present(message: string, color: string, icon: string) {
    const t = await this.ctrl.create({
      message,
      duration: 2800,
      position: 'bottom',
      color,
      icon,
      cssClass: 'app-toast',
      buttons: [{ text: '×', role: 'cancel' }],
    });
    await t.present();
  }
  success(m: string) {
    return this.present(m, 'success', 'checkmark-circle-outline');
  }
  error(m: string) {
    return this.present(m, 'danger', 'alert-circle-outline');
  }
  warning(m: string) {
    return this.present(m, 'warning', 'warning-outline');
  }
  info(m: string) {
    return this.present(m, 'primary', 'information-circle-outline');
  }
}

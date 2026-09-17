import { Injectable, inject } from '@angular/core';
import { ToastController } from '@ionic/angular';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

@Injectable({ providedIn: 'root' })
export class ToastService {
  private ctrl = inject(ToastController);

  private async show(message: string, color: string, icon: string) {
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

  success(message: string) { return this.show(message, 'success', 'checkmark-circle-outline'); }
  error(message: string) { return this.show(message, 'danger', 'alert-circle-outline'); }
  warning(message: string) { return this.show(message, 'warning', 'warning-outline'); }
  info(message: string) { return this.show(message, 'primary', 'information-circle-outline'); }
}

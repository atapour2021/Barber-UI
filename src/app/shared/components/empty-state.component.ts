import { Component, input } from '@angular/core';
import { IonIcon, IonText } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { fileTrayOutline } from 'ionicons/icons';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [IonIcon, IonText],
  template: ` <div class="empty-state">
    <ion-icon
      name="file-tray-outline"
      style="font-size:32px;opacity:.5"
    ></ion-icon>
    <ion-text color="medium"
      ><p>{{ message() }}</p></ion-text
    >
    <ng-content />
  </div>`,
})
export class EmptyStateComponent {
  message = input.required<string>();
  constructor() {
    addIcons({ fileTrayOutline });
  }
}

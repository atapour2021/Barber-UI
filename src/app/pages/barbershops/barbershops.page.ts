import { Component, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonLabel,
  IonButton,
  IonModal,
  IonSpinner,
  IonCard,
  IonCardContent,
  IonIcon,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { addOutline, trashOutline } from 'ionicons/icons';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { Barbershop } from '../../core/models';
import { fa } from '../../core/i18n/fa';
import { EmptyStateComponent } from '../../shared/components/empty-state.component';
import {
  UiInputComponent,
  UiTextareaComponent,
  UiNumberComponent,
  UiButtonComponent,
} from '../../shared/ui/ui';

@Component({
  selector: 'app-barbershops',
  standalone: true,
  imports: [
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonList,
    IonLabel,
    IonButton,
    IonModal,
    IonSpinner,
    IonCard,
    IonCardContent,
    IonIcon,
    EmptyStateComponent,
    UiInputComponent,
    UiTextareaComponent,
    UiNumberComponent,
    UiButtonComponent,
  ],
  template: ` <ion-header
      ><ion-toolbar
        ><ion-title>{{ t.title }}</ion-title></ion-toolbar
      ></ion-header
    >
    <ion-content [fullscreen]="true">
      <div class="page-wrap">
        @if (loading()) {
          <div style="text-align:center;padding:20px">
            <ion-spinner></ion-spinner>
            <p class="muted">{{ c.loading }}</p>
          </div>
        }
        @if (!loading() && !shops().length) {
          <app-empty-state [message]="t.empty" />
        }
        <ion-list lines="none" style="background:transparent;width:100%">
          @for (b of shops(); track b.id) {
            <ion-card>
              <ion-card-content
                style="display:flex;justify-content:space-between;align-items:center"
              >
                <ion-label
                  ><h3 style="font-weight:700">{{ b.name }}</h3>
                  <p class="muted">{{ b.address }}</p></ion-label
                >
                @if (isAdmin) {
                  <ion-button
                    fill="clear"
                    size="small"
                    color="danger"
                    (click)="remove(b.id)"
                    ><ion-icon name="trash-outline" slot="icon-only"></ion-icon
                  ></ion-button>
                }
              </ion-card-content>
            </ion-card>
          }
        </ion-list>
        @if (isAdmin) {
          <app-ui-button icon="add-outline" (pressed)="showForm.set(true)">{{
            t.add
          }}</app-ui-button>
          <ion-modal [isOpen]="showForm()" (didDismiss)="showForm.set(false)">
            <ng-template>
              <ion-header
                ><ion-toolbar
                  ><ion-title>{{ t.newShop }}</ion-title
                  ><ion-button
                    slot="end"
                    fill="clear"
                    (click)="showForm.set(false)"
                    >{{ c.close }}</ion-button
                  ></ion-toolbar
                ></ion-header
              >
              <ion-content class="ion-padding" [fullscreen]="true">
                <div class="page-wrap">
                  <app-ui-input
                    [label]="t.name"
                    [placeholder]="t.namePlaceholder"
                    [(ngModel)]="form.name"
                  />
                  <app-ui-textarea
                    [label]="t.description"
                    [(ngModel)]="form.description"
                  />
                  <app-ui-input
                    [label]="t.address"
                    [(ngModel)]="form.address"
                  />
                  <app-ui-number
                    [label]="t.latitude"
                    [(ngModel)]="form.latitude"
                  />
                  <app-ui-number
                    [label]="t.longitude"
                    [(ngModel)]="form.longitude"
                  />
                  <app-ui-input
                    [label]="t.ownerId"
                    [(ngModel)]="form.ownerId"
                  />
                  <app-ui-input
                    [label]="t.phone"
                    [placeholder]="t.phonePlaceholder"
                    [(ngModel)]="form.phoneNumber"
                  />
                  <app-ui-button (pressed)="create()">{{
                    t.create
                  }}</app-ui-button>
                </div>
              </ion-content>
            </ng-template>
          </ion-modal>
        }
      </div>
    </ion-content>`,
})
export class BarbershopsPage implements OnInit {
  private api = inject(ApiService);
  private auth = inject(AuthService);
  t = fa.barbershops;
  c = fa.common;
  shops = signal<Barbershop[]>([]);
  loading = signal(false);
  showForm = signal(false);
  isAdmin = this.auth.isAdmin();
  form: Record<string, unknown> = { latitude: 35.7, longitude: 51.4 };
  constructor() {
    addIcons({ addOutline, trashOutline });
  }
  ngOnInit() {
    this.load();
  }
  load() {
    this.loading.set(true);
    this.api.barbershops.list().subscribe({
      next: (v) => {
        this.shops.set(v as Barbershop[]);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
  create() {
    this.api.barbershops.create(this.form).subscribe({
      next: () => {
        this.showForm.set(false);
        this.load();
      },
    });
  }
  remove(id: string) {
    this.api.barbershops.remove(id).subscribe({ next: () => this.load() });
  }
}

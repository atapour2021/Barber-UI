import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import {
  IonBackButton,
  IonBadge,
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonContent,
  IonHeader,
  IonIcon,
  IonList,
  IonSpinner,
  IonTitle,
  IonToolbar,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  calendarOutline,
  locationOutline,
  ribbonOutline,
  timeOutline,
  videocamOutline,
} from 'ionicons/icons';
import { fa } from '../../core/i18n/fa';
import {
  Barber,
  Certificate,
  Educational,
  Location,
  Service,
} from '../../core/models';
import { ApiService } from '../../core/services/api.service';
import { EmptyStateComponent } from '../../shared/components/empty-state.component';
import { UiDatepickerComponent } from '../../shared/ui/ui';

@Component({
  selector: 'app-barber-detail',
  standalone: true,
  imports: [
    FormsModule,
    RouterLink,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonSpinner,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonList,
    IonButton,
    IonBadge,
    IonIcon,
    IonButtons,
    IonBackButton,
    EmptyStateComponent,
    UiDatepickerComponent,
  ],
  template: ` <ion-header
      ><ion-toolbar
        ><ion-buttons slot="start"
          ><ion-back-button
            defaultHref="/tabs/home"
          ></ion-back-button></ion-buttons
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
        @if (barber()) {
          <ion-card>
            <ion-card-header
              ><ion-card-title style="font-size:18px">{{
                barber()!.fullName
              }}</ion-card-title></ion-card-header
            >
            <ion-card-content>
              <p class="muted">{{ barber()!.bio ?? '' }}</p>
              <p style="margin-top:8px">
                <ion-badge
                  [color]="barber()!.isAvailable ? 'success' : 'medium'"
                  >{{ barber()!.isAvailable ? c.success : t.status }}</ion-badge
                >
                {{ barber()!.isAvailable ? fa.home.available : fa.home.busy }}
              </p>
            </ion-card-content>
          </ion-card>
          <p class="section-title">{{ t.services }}</p>
          @if (!services().length) {
            <app-empty-state [message]="t.noServices" />
          }
          <ion-list lines="none" style="background:transparent;width:100%">
            @for (s of services(); track s.id) {
              <ion-card
                ><ion-card-content
                  ><h4 style="margin:0;font-weight:700">{{ s.name }}</h4>
                  <p class="muted">
                    {{ s.price }} · {{ s.duration }}دقیقه
                  </p></ion-card-content
                ></ion-card
              >
            }
          </ion-list>
          <p class="section-title">
            <ion-icon name="time-outline"></ion-icon> {{ t.availability }}
          </p>
          <div
            class="card-modern"
            style="display:flex;gap:8px;align-items:center"
          >
            <app-ui-datepicker
              [label]="t.date"
              [(ngModel)]="date"
              style="flex:1"
            />
            <ion-button size="small" fill="outline" (click)="loadSlots()">{{
              t.checkSlots
            }}</ion-button>
          </div>
          <ion-list
            lines="none"
            style="background:transparent;margin-top:8px;width:100%"
          >
            @for (sl of slots(); track $index) {
              <ion-card
                ><ion-card-content
                  >{{ sl.startTime }} - {{ sl.endTime }} ·
                  {{ sl.status }}</ion-card-content
                ></ion-card
              >
            }
          </ion-list>
          <p class="section-title">
            <ion-icon name="videocam-outline"></ion-icon> {{ t.education }}
          </p>
          <ion-list lines="none" style="background:transparent;width:100%">
            @for (e of edu(); track e.id) {
              <ion-card
                ><ion-card-content
                  ><h4 style="margin:0;font-weight:700">{{ e.title }}</h4>
                  <p class="muted">{{ e.description ?? '' }}</p>
                  @if (e.videoUrl) {
                    <a
                      [href]="e.videoUrl"
                      target="_blank"
                      style="color:var(--ion-color-primary)"
                      >{{ t.video }}</a
                    >
                  }
                </ion-card-content></ion-card
              >
            }
          </ion-list>
          <p class="section-title">
            <ion-icon name="ribbon-outline"></ion-icon> {{ t.certificates }}
          </p>
          <ion-list lines="none" style="background:transparent;width:100%">
            @for (cert of certs(); track cert.id) {
              <ion-card
                ><ion-card-content
                  >{{ cert.name }} — {{ cert.issuer }} ({{
                    cert.issueDate
                  }})</ion-card-content
                ></ion-card
              >
            }
          </ion-list>
          <p class="section-title">
            <ion-icon name="location-outline"></ion-icon> {{ t.location }}
          </p>
          @if (loc()) {
            <div class="card-modern">
              <p style="margin:0">
                {{ loc()!.address }} — {{ loc()!.latitude }},
                {{ loc()!.longitude }}
              </p>
            </div>
          } @else {
            <app-empty-state [message]="t.noLocation" />
          }
          <ion-button
            expand="block"
            [routerLink]="['/appointments']"
            [queryParams]="{ barberId: barber()!.id }"
            style="margin-top:16px"
            ><ion-icon name="calendar-outline" slot="start"></ion-icon>
            {{ t.bookAppointment }}</ion-button
          >
          <ion-button
            fill="clear"
            expand="block"
            [routerLink]="['/barber', barber()!.id, 'manage']"
            >{{ t.manage }}</ion-button
          >
        }
      </div>
    </ion-content>`,
})
export class BarberDetailPage implements OnInit {
  private route = inject(ActivatedRoute);
  private api = inject(ApiService);
  t = fa.barberDetail;
  c = fa.common;
  fa = fa;
  barber = signal<Barber | null>(null);
  services = signal<Service[]>([]);
  edu = signal<Educational[]>([]);
  certs = signal<Certificate[]>([]);
  loc = signal<Location | null>(null);
  slots = signal<{ startTime: string; endTime: string; status: string }[]>([]);
  loading = signal(false);
  date = new Date().toISOString().slice(0, 10);
  constructor() {
    addIcons({
      timeOutline,
      videocamOutline,
      ribbonOutline,
      locationOutline,
      calendarOutline,
    });
  }
  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.loading.set(true);
    this.api.barbers.get(id).subscribe({
      next: (b) => {
        this.barber.set(b);
        this.loading.set(false);
        this.loadRelated(id);
      },
      error: () => this.loading.set(false),
    });
  }
  loadRelated(id: string) {
    this.api.services
      .list({ barberId: id })
      .subscribe({ next: (v) => this.services.set(v as Service[]) });
    this.api.educational
      .list({ barberId: id })
      .subscribe({ next: (v) => this.edu.set(v as Educational[]) });
    this.api.certificates
      .list({ barberId: id })
      .subscribe({ next: (v) => this.certs.set(v as Certificate[]) });
    this.api.locations
      .byBarber(id)
      .subscribe({
        next: (v) => this.loc.set(v),
        error: () => this.loc.set(null),
      });
  }
  loadSlots() {
    const id = this.barber()?.id ?? '';
    this.api.availability.get({ barberId: id, date: this.date }).subscribe({
      next: (v) => {
        const arr = (v as { slots?: unknown[] })?.slots ?? (v as unknown[]);
        this.slots.set((Array.isArray(arr) ? arr : []) as never);
      },
    });
  }
}

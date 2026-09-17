import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonSpinner, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonButton, IonSegment, IonSegmentButton, IonIcon } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { storefrontOutline, peopleOutline, cutOutline, calendarOutline } from 'ionicons/icons';
import { ApiService } from '../../core/services/api.service';
import { Barbershop, Barber, Service } from '../../core/models';
import { fa } from '../../core/i18n/fa';
import { EmptyStateComponent } from '../../shared/components/empty-state.component';
import { UiButtonComponent } from '../../shared/ui/ui';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, IonHeader, IonToolbar, IonTitle, IonContent, IonSpinner, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonButton, IonSegment, IonSegmentButton, IonIcon, EmptyStateComponent, UiButtonComponent],
  template: `
  <ion-header><ion-toolbar><ion-title>{{fa.app.title}}</ion-title></ion-toolbar></ion-header>
  <ion-content [fullscreen]="true">
    <div class="page-wrap">
      <div class="hero">
        <h2>{{fa.brand.title}}</h2>
        <p>{{fa.brand.subtitle}}</p>
      </div>
      <ion-segment [value]="tab" (ionChange)="tab=($event.detail.value ?? 'shops')!.toString()" style="margin-top:14px;width:100%">
        <ion-segment-button value="shops"><ion-icon name="storefront-outline"></ion-icon> {{t.shops}}</ion-segment-button>
        <ion-segment-button value="barbers"><ion-icon name="people-outline"></ion-icon> {{t.barbers}}</ion-segment-button>
        <ion-segment-button value="services"><ion-icon name="cut-outline"></ion-icon> {{t.services}}</ion-segment-button>
      </ion-segment>
      @if (loading()) { <div style="text-align:center;padding:24px"><ion-spinner></ion-spinner><p class="muted">{{c.loading}}</p></div> }
      @if (tab === 'shops') {
        @if (!loading() && !shops().length) { <app-empty-state [message]="t.emptyShops" /> }
        @for (s of shops(); track s.id) {
          <ion-card>
            <ion-card-header><ion-card-title style="font-size:15px">{{s.name}}</ion-card-title></ion-card-header>
            <ion-card-content>
              <p class="muted">{{s.description}}</p>
              <p style="margin:6px 0 10px">{{s.address}}</p>
              <ion-button size="small" [routerLink]="['/barbers']" [queryParams]="{barbershopId: s.id}">{{t.barbers}}</ion-button>
            </ion-card-content>
          </ion-card>
        }
        <ion-button fill="clear" routerLink="/barbershops">{{t.manageShops}}</ion-button>
      }
      @if (tab === 'barbers') {
        @if (!loading() && !barbers().length) { <app-empty-state [message]="t.emptyBarbers" /> }
        @for (b of barbers(); track b.id) {
          <ion-card button [routerLink]="['/barbers', b.id]">
            <ion-card-content style="display:flex;justify-content:space-between;align-items:center">
              <div><h3 style="margin:0;font-weight:700">{{b.fullName}}</h3><p class="muted">{{b.bio ?? ''}}</p><p class="muted">{{b.status}} · {{b.isAvailable ? t.available : t.busy}}</p></div>
            </ion-card-content>
          </ion-card>
        }
        <app-ui-button routerLink="/barbers">{{t.manageBarbers}}</app-ui-button>
      }
      @if (tab === 'services') {
        @if (!loading() && !services().length) { <app-empty-state [message]="t.emptyServices" /> }
        @for (sv of services(); track sv.id) {
          <ion-card>
            <ion-card-content><h3 style="margin:0 0 4px;font-weight:700">{{sv.name}}</h3><p class="muted">{{sv.description ?? ''}} — {{sv.price}} · {{sv.duration}}دقیقه</p></ion-card-content>
          </ion-card>
        }
        <app-ui-button routerLink="/services">{{t.manageServices}}</app-ui-button>
      }
      <app-ui-button color="secondary" icon="calendar-outline" routerLink="/appointments">{{t.bookAppointment}}</app-ui-button>
    </div>
  </ion-content>`,
})
export class HomePage implements OnInit {
  private api = inject(ApiService);
  fa = fa; t = fa.home; c = fa.common;
  shops = signal<Barbershop[]>([]); barbers = signal<Barber[]>([]); services = signal<Service[]>([]);
  loading = signal(false); tab = 'shops';
  constructor() { addIcons({ storefrontOutline, peopleOutline, cutOutline, calendarOutline }); }
  ngOnInit() { this.load(); }
  load() {
    this.loading.set(true);
    let c = 0; const done = () => { c++; if (c === 3) this.loading.set(false); };
    this.api.barbershops.list().subscribe({ next: v => { this.shops.set(v as Barbershop[]); done(); }, error: done });
    this.api.barbers.list().subscribe({ next: v => { this.barbers.set(v as Barber[]); done(); }, error: done });
    this.api.services.list().subscribe({ next: v => { this.services.set(v as Service[]); done(); }, error: done });
  }
}

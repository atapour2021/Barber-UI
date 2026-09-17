import { Component, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel, IonSpinner, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonButton, IonSegment, IonSegmentButton } from '@ionic/angular';
import { ApiService } from '../../core/services/api.service';
import { Barbershop, Barber, Service } from '../../core/models';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [FormsModule, RouterLink, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel, IonSpinner, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonButton, IonSegment, IonSegmentButton],
  template: `
  <ion-header><ion-toolbar><ion-title>Barber</ion-title></ion-toolbar></ion-header>
  <ion-content class="ion-padding">
    <ion-segment [value]="tab" (ionChange)="tab=($event.detail.value ?? 'shops')!.toString()">
      <ion-segment-button value="shops">Shops</ion-segment-button>
      <ion-segment-button value="barbers">Barbers</ion-segment-button>
      <ion-segment-button value="services">Services</ion-segment-button>
    </ion-segment>
    @if (loading()) { <div style="text-align:center;padding:24px"><ion-spinner /></div> }
    @if (tab === 'shops') {
      <ion-list>
        @for (s of shops(); track s.id) {
          <ion-card>
            <ion-card-header><ion-card-title>{{s.name}}</ion-card-title></ion-card-header>
            <ion-card-content><p>{{s.description}}</p><p>{{s.address}}</p>
              <ion-button size="small" [routerLink]="['/barbers']" [queryParams]="{barbershopId: s.id}">Barbers</ion-button>
            </ion-card-content>
          </ion-card>
        }
      </ion-list>
      <ion-button fill="clear" routerLink="/barbershops">Manage shops</ion-button>
    }
    @if (tab === 'barbers') {
      <ion-list>
        @for (b of barbers(); track b.id) {
          <ion-item [routerLink]="['/barbers', b.id]">
            <ion-label><h3>{{b.fullName}}</h3><p>{{b.bio ?? ''}}</p><p>{{b.status}} · {{b.isAvailable ? 'available' : 'busy'}}</p></ion-label>
          </ion-item>
        }
      </ion-list>
      <ion-button expand="block" routerLink="/barbers">Manage barbers</ion-button>
    }
    @if (tab === 'services') {
      <ion-list>
        @for (sv of services(); track sv.id) {
          <ion-item><ion-label><h3>{{sv.name}}</h3><p>{{sv.description ?? ''}} — {{sv.price}} · {{sv.duration}}m</p></ion-label></ion-item>
        }
      </ion-list>
      <ion-button expand="block" routerLink="/services">Manage services</ion-button>
    }
    <ion-button expand="block" color="secondary" routerLink="/appointments">Book appointment</ion-button>
  </ion-content>`,
})
export class HomePage implements OnInit {
  private api = inject(ApiService);
  shops = signal<Barbershop[]>([]); barbers = signal<Barber[]>([]); services = signal<Service[]>([]);
  loading = signal(false); tab = 'shops';
  ngOnInit() { this.load(); }
  load() {
    this.loading.set(true);
    let c = 0; const done = () => { c++; if (c === 3) this.loading.set(false); };
    this.api.barbershops.list().subscribe({ next: v => { this.shops.set(v as Barbershop[]); done(); }, error: done });
    this.api.barbers.list().subscribe({ next: v => { this.barbers.set(v as Barber[]); done(); }, error: done });
    this.api.services.list().subscribe({ next: v => { this.services.set(v as Service[]); done(); }, error: done });
  }
}

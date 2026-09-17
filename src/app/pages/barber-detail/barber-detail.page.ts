import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonSpinner, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonList, IonItem, IonLabel, IonButton, IonText, IonInput, IonBadge } from '@ionic/angular';
import { ApiService } from '../../core/services/api.service';
import { Barber, Service, Educational, Certificate, Location } from '../../core/models';

@Component({
  selector: 'app-barber-detail',
  standalone: true,
  imports: [FormsModule, RouterLink, IonHeader, IonToolbar, IonTitle, IonContent, IonSpinner, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonList, IonItem, IonLabel, IonButton, IonText, IonInput, IonBadge],
  template: `
  <ion-header><ion-toolbar><ion-title>Barber</ion-title></ion-toolbar></ion-header>
  <ion-content class="ion-padding">
    @if (loading()) { <ion-spinner /> }
    @if (barber()) {
      <ion-card>
        <ion-card-header><ion-card-title>{{barber()!.fullName}}</ion-card-title></ion-card-header>
        <ion-card-content><p>{{barber()!.bio ?? ''}}</p><ion-badge>{{barber()!.status}}</ion-badge> {{barber()!.isAvailable ? 'Available' : 'Busy'}}</ion-card-content>
      </ion-card>

      <h3>Services</h3>
      <ion-list>
        @for (s of services(); track s.id) { <ion-item><ion-label>{{s.name}} — {{s.price}} · {{s.duration}}m</ion-label></ion-item> }
        @if (!services().length) { <ion-text color="medium"><p>No services</p></ion-text> }
      </ion-list>

      <h3>Availability</h3>
      <ion-item><ion-input type="date" label="Date" [(ngModel)]="date" /></ion-item>
      <ion-button size="small" (click)="loadSlots()">Check slots</ion-button>
      <ion-list>
        @for (sl of slots(); track $index) { <ion-item><ion-label>{{sl.startTime}} - {{sl.endTime}} · {{sl.status}}</ion-label></ion-item> }
      </ion-list>

      <h3>Education</h3>
      <ion-list>
        @for (e of edu(); track e.id) {
          <ion-item><ion-label><h4>{{e.title}}</h4><p>{{e.description ?? ''}}</p>@if(e.videoUrl){ <a [href]="e.videoUrl" target="_blank">Video</a> }</ion-label></ion-item>
        }
      </ion-list>

      <h3>Certificates</h3>
      <ion-list>
        @for (c of certs(); track c.id) { <ion-item><ion-label>{{c.name}} — {{c.issuer}} ({{c.issueDate}})</ion-label></ion-item> }
      </ion-list>

      <h3>Location</h3>
      @if (loc()) { <p>{{loc()!.address}} — {{loc()!.latitude}}, {{loc()!.longitude}}</p> } @else { <ion-text color="medium"><p>No location</p></ion-text> }

      <ion-button expand="block" [routerLink]="['/appointments']" [queryParams]="{barberId: barber()!.id}">Book appointment</ion-button>
      <ion-button fill="clear" [routerLink]="['/barber', barber()!.id, 'manage']">Manage (educ/certs/loc)</ion-button>
    }
  </ion-content>`,
})
export class BarberDetailPage implements OnInit {
  private route = inject(ActivatedRoute); private api = inject(ApiService);
  barber = signal<Barber | null>(null); services = signal<Service[]>([]); edu = signal<Educational[]>([]); certs = signal<Certificate[]>([]); loc = signal<Location | null>(null);
  slots = signal<{ startTime: string; endTime: string; status: string }[]>([]);
  loading = signal(false); date = new Date().toISOString().slice(0, 10);
  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.loading.set(true);
    this.api.barbers.get(id).subscribe({ next: b => { this.barber.set(b); this.loading.set(false); this.loadRelated(id); }, error: () => this.loading.set(false) });
  }
  loadRelated(id: string) {
    this.api.services.list({ barberId: id }).subscribe({ next: v => this.services.set(v as Service[]) });
    this.api.educational.list({ barberId: id }).subscribe({ next: v => this.edu.set(v as Educational[]) });
    this.api.certificates.list({ barberId: id }).subscribe({ next: v => this.certs.set(v as Certificate[]) });
    this.api.locations.byBarber(id).subscribe({ next: v => this.loc.set(v), error: () => this.loc.set(null) });
  }
  loadSlots() {
    const id = this.barber()?.id ?? '';
    this.api.availability.get({ barberId: id, date: this.date }).subscribe({ next: v => {
      const arr = (v as { slots?: unknown[] })?.slots ?? (v as unknown[]);
      this.slots.set((Array.isArray(arr) ? arr : []) as never);
    }});
  }
}

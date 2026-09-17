import { Component, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonItem, IonInput, IonTextarea, IonButton, IonList, IonLabel, IonText } from '@ionic/angular';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-barber-manage',
  standalone: true,
  imports: [FormsModule, IonHeader, IonToolbar, IonTitle, IonContent, IonItem, IonInput, IonTextarea, IonButton, IonList, IonLabel, IonText],
  template: `
  <ion-header><ion-toolbar><ion-title>Manage barber</ion-title></ion-toolbar></ion-header>
  <ion-content class="ion-padding">
    <h3>Education (video upload)</h3>
    <ion-item><ion-input label="Title" labelPlacement="stacked" [(ngModel)]="edu.title" /></ion-item>
    <ion-item><ion-textarea label="Description" [(ngModel)]="edu.description" /></ion-item>
    <ion-item><input type="file" (change)="eduFile=$event.target.files?.[0] ?? null" /></ion-item>
    <ion-button size="small" (click)="createEdu()">Create education</ion-button>
    <ion-list>@for (e of eduList(); track e.id) { <ion-item><ion-label>{{e.title}}</ion-label><ion-button fill="clear" color="danger" (click)="delEdu(e.id)">Del</ion-button></ion-item> }</ion-list>

    <h3>Certificates</h3>
    <ion-item><ion-input label="Name" [(ngModel)]="cert.name" /></ion-item>
    <ion-item><ion-input label="Issuer" [(ngModel)]="cert.issuer" /></ion-item>
    <ion-item><ion-input label="Issue date" type="date" [(ngModel)]="cert.issueDate" /></ion-item>
    <ion-item><ion-input label="Expiry date" type="date" [(ngModel)]="cert.expiryDate" /></ion-item>
    <ion-button size="small" (click)="createCert()">Add cert</ion-button>
    <ion-list>@for (c of certList(); track c.id) { <ion-item><ion-label>{{c.name}} — {{c.issuer}}</ion-label><ion-button fill="clear" color="danger" (click)="delCert(c.id)">Del</ion-button></ion-item> }</ion-list>

    <h3>Location</h3>
    <ion-item><ion-textarea label="Address" [(ngModel)]="loc.address" /></ion-item>
    <ion-item><ion-input label="Latitude" type="number" [(ngModel)]="loc.latitude" /></ion-item>
    <ion-item><ion-input label="Longitude" type="number" [(ngModel)]="loc.longitude" /></ion-item>
    <ion-button size="small" (click)="upsertLoc()">{{locId ? 'Update' : 'Create'}} location</ion-button>
    @if (msg) { <ion-text [color]="ok?'success':'danger'"><p>{{msg}}</p></ion-text> }
  </ion-content>`,
})
export class BarberManagePage implements OnInit {
  private api = inject(ApiService); private route = inject(ActivatedRoute);
  barberId = ''; eduFile: File | null = null;
  edu: Record<string, unknown> = {}; cert: Record<string, unknown> = {}; loc: Record<string, unknown> = {};
  eduList = signal<{ id: string; title: string }[]>([]); certList = signal<{ id: string; name: string; issuer: string }[]>([]);
  locId = ''; msg = ''; ok = false;
  ngOnInit() {
    this.barberId = this.route.snapshot.paramMap.get('id')!;
    this.cert['barberId'] = this.barberId; this.loc['barberId'] = this.barberId;
    this.refresh();
  }
  refresh() {
    this.api.educational.list({ barberId: this.barberId }).subscribe({ next: v => this.eduList.set(v as never) });
    this.api.certificates.list({ barberId: this.barberId }).subscribe({ next: v => this.certList.set(v as never) });
    this.api.locations.byBarber(this.barberId).subscribe({ next: v => { const l = v as unknown as Record<string, unknown>; this.locId = l['id'] as string; this.loc = { address: l['address'], latitude: l['latitude'], longitude: l['longitude'] }; }, error: () => {} });
  }
  createEdu() {
    const fd = new FormData();
    fd.set('title', String(this.edu['title'] ?? '')); if (this.edu['description']) fd.set('description', String(this.edu['description']));
    fd.set('barberId', this.barberId); if (this.eduFile) fd.set('file', this.eduFile);
    this.api.educational.create(fd).subscribe({ next: () => { this.msg = 'Created'; this.ok = true; this.refresh(); }, error: e => { this.ok = false; this.msg = e.error?.message ?? 'Failed'; } });
  }
  delEdu(id: string) { this.api.educational.remove(id).subscribe({ next: () => this.refresh() }); }
  createCert() { this.api.certificates.create(this.cert).subscribe({ next: () => this.refresh(), error: e => { this.ok = false; this.msg = e.error?.message ?? 'Failed'; } }); }
  delCert(id: string) { this.api.certificates.remove(id).subscribe({ next: () => this.refresh() }); }
  upsertLoc() {
    const payload = { ...this.loc, barberId: this.barberId };
    const obs = this.locId ? this.api.locations.update(this.locId, payload) : this.api.locations.create(payload);
    obs.subscribe({ next: () => { this.ok = true; this.msg = 'Saved'; this.refresh(); }, error: e => { this.ok = false; this.msg = e.error?.message ?? 'Failed'; } });
  }
}

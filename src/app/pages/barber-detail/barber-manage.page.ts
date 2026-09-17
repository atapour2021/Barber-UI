import { Component, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonLabel, IonCard, IonCardContent, IonIcon, IonButtons, IonBackButton, IonButton } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { addOutline, trashOutline, saveOutline } from 'ionicons/icons';
import { ApiService } from '../../core/services/api.service';
import { fa } from '../../core/i18n/fa';
import { UiInputComponent, UiTextareaComponent, UiDatepickerComponent, UiNumberComponent, UiButtonComponent } from '../../shared/ui/ui';

@Component({
  selector: 'app-barber-manage',
  standalone: true,
  imports: [FormsModule, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonLabel, IonCard, IonCardContent, IonIcon, IonButtons, IonBackButton, IonButton, UiInputComponent, UiTextareaComponent, UiDatepickerComponent, UiNumberComponent, UiButtonComponent],
  template: `
  <ion-header><ion-toolbar><ion-buttons slot="start"><ion-back-button defaultHref="/tabs/home"></ion-back-button></ion-buttons><ion-title>{{t.title}}</ion-title></ion-toolbar></ion-header>
  <ion-content [fullscreen]="true">
    <div class="page-wrap">
      <p class="section-title">{{t.educationTitle}}</p>
      <div class="card-modern" style="display:grid;gap:10px">
        <ui-input [label]="t.titleLabel" [placeholder]="t.titlePlaceholder" [(ngModel)]="edu.title" />
        <ui-textarea [label]="t.description" [(ngModel)]="edu.description" />
        <div class="ui-field"><label>{{t.file}}</label><input type="file" (change)="eduFile=$event.target.files?.[0] ?? null" /></div>
        <ui-button size="small" icon="add-outline" (pressed)="createEdu()">{{t.createEdu}}</ui-button>
      </div>
      <ion-list lines="none" style="background:transparent;width:100%">
        @for (e of eduList(); track e.id) { <ion-card><ion-card-content style="display:flex;justify-content:space-between;align-items:center"><ion-label>{{e.title}}</ion-label><ion-button fill="clear" color="danger" (click)="delEdu(e.id)"><ion-icon name="trash-outline" slot="icon-only"></ion-icon></ion-button></ion-card-content></ion-card> }
      </ion-list>
      <p class="section-title">{{t.certificates}}</p>
      <div class="card-modern" style="display:grid;gap:10px">
        <ui-input [label]="t.name" [placeholder]="t.namePlaceholder" [(ngModel)]="cert.name" />
        <ui-input [label]="t.issuer" [(ngModel)]="cert.issuer" />
        <ui-datepicker [label]="t.issueDate" [(ngModel)]="cert.issueDate" />
        <ui-datepicker [label]="t.expiryDate" [(ngModel)]="cert.expiryDate" />
        <ui-button size="small" icon="add-outline" (pressed)="createCert()">{{t.addCert}}</ui-button>
      </div>
      <ion-list lines="none" style="background:transparent;width:100%">
        @for (c of certList(); track c.id) { <ion-card><ion-card-content style="display:flex;justify-content:space-between;align-items:center"><ion-label>{{c.name}} — {{c.issuer}}</ion-label><ion-button fill="clear" color="danger" (click)="delCert(c.id)"><ion-icon name="trash-outline" slot="icon-only"></ion-icon></ion-button></ion-card-content></ion-card> }
      </ion-list>
      <p class="section-title">{{t.location}}</p>
      <div class="card-modern" style="display:grid;gap:10px">
        <ui-textarea [label]="t.address" [(ngModel)]="loc.address" />
        <ui-number [label]="t.latitude" [(ngModel)]="loc.latitude" />
        <ui-number [label]="t.longitude" [(ngModel)]="loc.longitude" />
        <ui-button size="small" icon="save-outline" (pressed)="upsertLoc()">{{locId ? t.updateLoc : t.createLoc}}</ui-button>
      </div>
    </div>
  </ion-content>`,
})
export class BarberManagePage implements OnInit {
  private api = inject(ApiService); private route = inject(ActivatedRoute);
  t = fa.barberManage;
  barberId = ''; eduFile: File | null = null;
  edu: Record<string, unknown> = {}; cert: Record<string, unknown> = {}; loc: Record<string, unknown> = {};
  eduList = signal<{ id: string; title: string }[]>([]); certList = signal<{ id: string; name: string; issuer: string }[]>([]);
  locId = '';
  constructor() { addIcons({ addOutline, trashOutline, saveOutline }); }
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
    this.api.educational.create(fd).subscribe({ next: () => this.refresh() });
  }
  delEdu(id: string) { this.api.educational.remove(id).subscribe({ next: () => this.refresh() }); }
  createCert() { this.api.certificates.create(this.cert).subscribe({ next: () => this.refresh() }); }
  delCert(id: string) { this.api.certificates.remove(id).subscribe({ next: () => this.refresh() }); }
  upsertLoc() {
    const payload = { ...this.loc, barberId: this.barberId };
    const obs = this.locId ? this.api.locations.update(this.locId, payload) : this.api.locations.create(payload);
    obs.subscribe({ next: () => this.refresh() });
  }
}

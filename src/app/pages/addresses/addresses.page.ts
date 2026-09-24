import { Component, AfterViewInit, OnDestroy, OnInit, ViewChild, ElementRef, signal, inject } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { IonContent, IonIcon, IonInput, IonItem, IonSpinner, IonTextarea, AlertController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { arrowForwardOutline, locationOutline, trashOutline, addOutline, createOutline, closeOutline, locateOutline, saveOutline } from 'ionicons/icons';
import * as L from 'leaflet';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { Location } from '../../core/models';
import { unwrapArray } from '../../core/api/utils';

@Component({
  selector: 'app-addresses',
  standalone: true,
  imports: [IonContent, IonIcon, IonInput, IonItem, IonSpinner, IonTextarea, RouterLink, FormsModule, DecimalPipe],
  template: `
    <ion-content [fullscreen]="true">
      <div class="page-wrap addr-wrap" dir="rtl">
        <div class="addr-head">
          <a routerLink="/tabs/profile" class="back-btn" aria-label="back"><ion-icon name="arrow-forward-outline"></ion-icon></a>
          <h1>آدرس‌ها</h1>
        </div>

        @if (loading()) {
          <div class="dark-card" style="text-align:center;padding:18px"><ion-spinner></ion-spinner><p class="muted" style="margin:8px 0 0">در حال بارگذاری...</p></div>
        } @else {
          <div class="addr-list">
            @for (a of items(); track a.id) {
              <div class="addr-card" [class.selected]="editingId()===a.id">
                <span class="addr-icon"><ion-icon name="location-outline"></ion-icon></span>
                <div class="addr-text">
                  <b>{{ a.label || 'آدرس' }}</b>
                  <small>{{ a.address }}</small>
                  @if (a.latitude && a.longitude) {
                    <small class="addr-coords">{{ a.latitude | number:'1.4-4' }}, {{ a.longitude | number:'1.4-4' }}</small>
                  }
                </div>
                <div class="addr-actions">
                  <button type="button" class="addr-edit" (click)="startEdit(a)" aria-label="edit"><ion-icon name="create-outline"></ion-icon></button>
                  <button type="button" class="addr-del" (click)="remove(a.id)" aria-label="delete"><ion-icon name="trash-outline"></ion-icon></button>
                </div>
              </div>
            }
            @if (!items().length) {
              <div class="dark-card" style="text-align:center;padding:18px"><p class="muted" style="margin:0">آدرسی ثبت نشده — روی نقشه انتخاب کنید و ذخیره کنید</p></div>
            }
          </div>
        }

        <div class="dark-card addr-form">
          <b style="font-size:12px;color:var(--text-primary)">{{ editingId() ? 'ویرایش آدرس' : 'افزودن آدرس' }}</b>
          <div class="input-group">
            <label>عنوان</label>
            <ion-item lines="none" class="custom-input"><ion-input [(ngModel)]="label" placeholder="مثلا خانه"></ion-input></ion-item>
          </div>
          <div class="input-group">
            <label>آدرس کامل</label>
            <ion-item lines="none" class="custom-input"><ion-textarea [(ngModel)]="detail" placeholder="آدرس کامل" [autoGrow]="true" rows="2"></ion-textarea></ion-item>
          </div>

          <div class="addr-map-wrap">
            <div #mapEl class="addr-map"></div>
            <button class="addr-locate" type="button" aria-label="موقعیت من" (click)="locateMe()"><ion-icon name="locate-outline"></ion-icon></button>
            @if (pickedLat()!=null) {
              <div class="addr-picked">lat {{ pickedLat()!.toFixed(5) }} , lng {{ pickedLng()!.toFixed(5) }}</div>
            }
          </div>
          <small class="muted" style="text-align:right">روی نقشه ضربه بزنید تا موقعیت انتخاب شود. جابجایی نشانگر مختصات را به‌روزرسانی می‌کند.</small>

          @if (formError()) {
            <div class="alert-error">{{ formError() }}</div>
          }

          <div class="addr-form-actions">
            @if (editingId()) {
              <button type="button" class="addr-cancel" (click)="cancelEdit()"><ion-icon name="close-outline"></ion-icon> انصراف</button>
            }
            <button type="button" class="addr-add" (click)="save()" [disabled]="saving()">
              @if (saving()) { <ion-spinner name="crescent" style="width:16px;height:16px"></ion-spinner> }
              @else { <ion-icon [name]="editingId() ? 'save-outline' : 'add-outline'"></ion-icon> }
              {{ editingId() ? 'ذخیره تغییرات' : 'افزودن' }}
            </button>
          </div>
        </div>
      </div>
    </ion-content>
  `,
  styles: [`
    .addr-wrap { max-width: 520px; gap: 16px; padding-top: 14px; }
    .addr-head { display:flex; align-items:center; gap:10px; }
    .addr-head h1 { margin:0; font-size:18px; font-weight:800; color:var(--text-primary); flex:1; text-align:right; }
    .back-btn { width:36px; height:36px; display:inline-flex; align-items:center; justify-content:center; border-radius:8px; background:var(--card-bg); border:1px solid var(--card-border); color:var(--text-primary); text-decoration:none; font-size:18px; }
    .addr-list { display:grid; gap:10px; width:100%; }
    .addr-card { display:flex; align-items:center; gap:10px; background:var(--card-bg); border:1px solid var(--card-border); border-radius:10px; padding:12px 14px; }
    .addr-card.selected { border-color:var(--accent); }
    .addr-icon { width:36px; height:36px; border-radius:8px; background:#1e2a44; display:inline-flex; align-items:center; justify-content:center; color:var(--text-secondary); font-size:16px; flex-shrink:0; }
    .addr-text { flex:1; min-width:0; text-align:right; display:flex; flex-direction:column; gap:2px; }
    .addr-text b { font-size:12px; font-weight:800; color:var(--text-primary); }
    .addr-text small { font-size:11px; color:var(--text-secondary); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
    .addr-text .addr-coords { color:var(--text-muted); font-size:10px; direction:ltr; text-align:right; }
    .addr-actions { display:flex; gap:4px; flex-shrink:0; }
    .addr-del, .addr-edit { width:32px; height:32px; display:inline-flex; align-items:center; justify-content:center; background:transparent; border:none; color:var(--text-muted); font-size:16px; cursor:pointer; flex-shrink:0; border-radius:8px; }
    .addr-edit { color:var(--text-secondary); }
    .addr-edit:hover, .addr-del:hover { background:var(--ion-color-step-50); color:var(--text-primary); }
    .addr-form { display:grid; gap:10px; }
    .addr-map-wrap { position:relative; width:100%; border-radius:10px; overflow:hidden; border:1px solid var(--card-border); }
    .addr-map { width:100%; height:240px; background:#1e2a44; }
    .addr-locate { position:absolute; bottom:10px; left:10px; z-index:400; width:32px; height:32px; border-radius:8px; background:#0f1a2e; border:1px solid #243150; color:#cbd5e1; display:inline-flex; align-items:center; justify-content:center; font-size:16px; cursor:pointer; box-shadow:0 2px 8px rgba(0,0,0,0.25); }
    .addr-picked { position:absolute; top:8px; left:50%; transform:translateX(-50%); z-index:400; background:var(--card-bg); border:1px solid var(--card-border); color:var(--text-primary); font-size:10px; font-weight:700; padding:5px 10px; border-radius:999px; direction:ltr; box-shadow:0 2px 8px rgba(0,0,0,0.25); }
    .addr-form-actions { display:flex; gap:8px; justify-content:flex-end; }
    .addr-add { display:inline-flex; align-items:center; justify-content:center; gap:6px; background:var(--accent); color:var(--accent-contrast); border:none; border-radius:8px; padding:10px 14px; font-family:inherit; font-size:12px; font-weight:800; cursor:pointer; }
    .addr-add:disabled { opacity:0.7; cursor:default; }
    .addr-cancel { display:inline-flex; align-items:center; gap:6px; background:transparent; border:1px solid var(--card-border); color:var(--text-primary); border-radius:8px; padding:10px 14px; font-family:inherit; font-size:12px; font-weight:700; cursor:pointer; }
    html:not(.ion-palette-dark) .addr-map { background:#e2e8f0; }
    html:not(.ion-palette-dark) .addr-locate { background:#fff; border-color:#cbd5e1; color:#475569; }
    :host ::ng-deep .addr-pin { background:transparent; border:none; }
    :host ::ng-deep .addr-pin-inner { width:32px; height:32px; border-radius:999px; background:var(--accent); display:flex; align-items:center; justify-content:center; color:#0b101e; font-size:18px; border:2px solid #fff; box-shadow:0 4px 16px rgba(0,0,0,0.35); }
  `],
})
export class AddressesPage implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('mapEl', { static: false }) mapEl!: ElementRef<HTMLDivElement>;
  private api = inject(ApiService);
  private auth = inject(AuthService);
  private toast = inject(ToastService);
  private alertCtrl = inject(AlertController);
  items = signal<Location[]>([]);
  loading = signal(true);
  saving = signal(false);
  label = '';
  detail = '';
  formError = signal('');
  pickedLat = signal<number | null>(null);
  pickedLng = signal<number | null>(null);
  editingId = signal<string | null>(null);
  private map?: L.Map;
  private marker?: L.Marker;

  constructor() { addIcons({ arrowForwardOutline, locationOutline, trashOutline, addOutline, createOutline, closeOutline, locateOutline, saveOutline }); }

  ngOnInit() { this.load(); }

  ngAfterViewInit() { setTimeout(() => this.initMap(), 120); }

  ngOnDestroy() { this.map?.remove(); }

  private load() {
    this.loading.set(true);
    this.api.locations.myAddresses().subscribe({
      next: (v) => { this.items.set(unwrapArray<Location>(v)); this.loading.set(false); },
      error: () => {
        this.api.locations.list().subscribe({
          next: (v2) => { this.items.set(unwrapArray<Location>(v2).filter(x => !x.barberId)); this.loading.set(false); },
          error: () => { this.items.set([]); this.loading.set(false); },
        });
      },
    });
  }

  save() {
    this.formError.set('');
    const l = this.label.trim();
    const d = this.detail.trim();
    const lat = this.pickedLat();
    const lng = this.pickedLng();
    if (!l || !d) { this.formError.set('عنوان و آدرس الزامی است'); return; }
    if (lat == null || lng == null) { this.formError.set('لطفاً موقعیت را روی نقشه انتخاب کنید'); return; }
    const uid = this.auth.user()?.id;
    const dto: Record<string, unknown> = { address: d, label: l, latitude: lat, longitude: lng, mapMetadata: { zoom: this.map?.getZoom() ?? 15 }, ...(uid ? { userId: uid } : {}) };
    this.saving.set(true);
    const id = this.editingId();
    const req = id ? this.api.locations.update(id, dto) : this.api.locations.create(dto);
    req.subscribe({
      next: (saved) => {
        this.toast.success(id ? 'آدرس ویرایش شد' : 'آدرس ذخیره شد');
        if (id) this.items.set(this.items().map(x => x.id === id ? { ...x, ...(saved as Location) } : x));
        else this.items.set([(saved as Location), ...this.items()]);
        this.resetForm();
        this.saving.set(false);
      },
      error: (e) => {
        const msg = (e?.error?.message as string) || e?.message || 'ذخیره آدرس ممکن نشد';
        this.formError.set(Array.isArray(msg) ? msg.join('، ') : String(msg));
        this.toast.error(this.formError());
        this.saving.set(false);
      },
    });
  }

  startEdit(a: Location) {
    this.editingId.set(a.id);
    this.label = (a.label as string) || '';
    this.detail = a.address || '';
    const lat = Number(a.latitude);
    const lng = Number(a.longitude);
    if (!isNaN(lat) && !isNaN(lng)) { this.pickedLat.set(lat); this.pickedLng.set(lng); this.setMarker(lat, lng, true); }
    this.formError.set('');
  }

  cancelEdit() { this.resetForm(); }

  async remove(id: string) {
    const alert = await this.alertCtrl.create({
      header: 'حذف آدرس',
      message: 'آیا از حذف این آدرس مطمئن هستید؟',
      cssClass: 'addr-delete-alert',
      buttons: [
        { text: 'انصراف', role: 'cancel' },
        {
          text: 'حذف',
          role: 'destructive',
          handler: () => {
            this.api.locations.remove(id).subscribe({
              next: () => {
                this.items.set(this.items().filter(a => a.id !== id));
                if (this.editingId() === id) this.resetForm();
                this.toast.success('آدرس حذف شد');
              },
              error: (e) => this.toast.error((e?.error?.message as string) || 'حذف ممکن نشد'),
            });
          },
        },
      ],
    });
    await alert.present();
  }

  locateMe() {
    if (!navigator.geolocation) { this.toast.error('موقعیت‌یاب در دسترس نیست'); return; }
    navigator.geolocation.getCurrentPosition(
      (p) => { const lat = p.coords.latitude, lng = p.coords.longitude; this.pickedLat.set(lat); this.pickedLng.set(lng); this.setMarker(lat, lng, true); },
      () => this.toast.error('دسترسی به موقعیت ممکن نشد'),
      { enableHighAccuracy: false, timeout: 6000 },
    );
  }

  private resetForm() {
    this.label = '';
    this.detail = '';
    this.editingId.set(null);
    this.formError.set('');
    this.pickedLat.set(null);
    this.pickedLng.set(null);
    this.marker?.remove();
    this.marker = undefined;
  }

  private initMap() {
    const el = this.mapEl?.nativeElement;
    if (!el || this.map) return;
    const center: L.LatLngExpression = this.pickedLat() != null ? [this.pickedLat()!, this.pickedLng()!] : [35.6892, 51.3890];
    this.map = L.map(el, { zoomControl: false }).setView(center, 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '© OpenStreetMap' }).addTo(this.map);
    L.control.zoom({ position: 'bottomright' }).addTo(this.map);
    this.map.on('click', (e: L.LeafletMouseEvent) => { this.pickedLat.set(e.latlng.lat); this.pickedLng.set(e.latlng.lng); this.setMarker(e.latlng.lat, e.latlng.lng, false); });
    setTimeout(() => this.map?.invalidateSize(), 200);
    if (this.pickedLat() != null) this.setMarker(this.pickedLat()!, this.pickedLng()!, true);
  }

  private setMarker(lat: number, lng: number, pan: boolean) {
    if (!this.map) return;
    const ll: L.LatLngExpression = [lat, lng];
    if (this.marker) this.marker.setLatLng(ll);
    else {
      const icon = L.divIcon({ className: 'addr-pin', html: `<div class="addr-pin-inner">◎</div>`, iconSize: [32, 32], iconAnchor: [16, 32] });
      this.marker = L.marker(ll, { icon, draggable: true }).addTo(this.map);
      this.marker.on('dragend', () => {
        const p = this.marker!.getLatLng();
        this.pickedLat.set(p.lat);
        this.pickedLng.set(p.lng);
      });
    }
    if (pan) this.map.setView(ll, this.map.getZoom() || 15, { animate: true });
    setTimeout(() => this.map?.invalidateSize(), 100);
  }
}

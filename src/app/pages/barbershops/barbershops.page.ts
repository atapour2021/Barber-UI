import { Component, AfterViewInit, OnDestroy, ViewChild, ElementRef, signal, inject, OnInit, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonContent, IonIcon, IonSpinner } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { locateOutline, closeOutline, searchOutline, star } from 'ionicons/icons';
import * as L from 'leaflet';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ToastService } from '../../core/services/toast.service';
import { ApiService } from '../../core/services/api.service';
import { Barbershop, Barber, Location } from '../../core/models';
import { unwrapArray } from '../../core/api/utils';
import { fa } from '../../core/i18n/fa';

type PinItem = { id: string; kind: 'shop' | 'barber'; name: string; address: string; phone: string; lat: number; lng: number; raw: Barbershop | Barber };

@Component({
  selector: 'app-barbershops',
  standalone: true,
  imports: [FormsModule, IonContent, IonIcon, IonSpinner],
  template: `
    <ion-content [fullscreen]="true">
      <div class="page-wrap loc-wrap" dir="rtl">
        <div class="loc-head">
          <h1>{{ t.title }}</h1>
          <p>{{ countLabel() }}</p>
        </div>
        <label class="search-bar" dir="rtl">
          <ion-icon name="search-outline" aria-hidden="true"></ion-icon>
          <input type="search" [placeholder]="ph" [(ngModel)]="query" (ngModelChange)="q.set($event); refreshMarkers()" autocomplete="off" />
          @if (query) { <button type="button" class="sb-clear" (click)="query=''; q.set(''); refreshMarkers()"><ion-icon name="close-outline"></ion-icon></button> }
        </label>
        <div class="loc-map-wrap">
          <div #mapEl class="loc-map"></div>
          <button class="loc-recenter" type="button" [attr.aria-label]="t.centerMap" (click)="recenter()">
            <ion-icon name="locate-outline"></ion-icon>
          </button>
          @if (routeInfo()) {
            <div class="loc-route-badge">
              <span>{{ routeInfo()!.dist }}</span>
              <span class="dot">·</span>
              <span>{{ routeInfo()!.time }}</span>
              <button type="button" class="badge-close" (click)="clearRoute()" [attr.aria-label]="t.removeRoute"><ion-icon name="close-outline"></ion-icon></button>
            </div>
          }
          @if (loading()) {
            <div class="loc-map-loading"><ion-spinner name="crescent"></ion-spinner></div>
          }
        </div>
        @if (selected()) {
          <div class="loc-card">
            <b class="loc-card-title">{{ selected()!.name }}</b>
            <p class="loc-card-addr">{{ selected()!.address }}</p>
            @if (selected()!.phone) { <p class="loc-card-phone">{{ selected()!.phone }}</p> }
            <button class="loc-cta" type="button" (click)="toggleRoute()" [disabled]="routingLoading()">
              @if (routingLoading()) { <ion-spinner name="crescent" style="width:18px;height:18px"></ion-spinner> } @else { {{ isRouting() ? t.removeRoute : t.routing }} }
            </button>
            @if (isRouting() && routeError()) { <p class="loc-route-error">{{ routeError() }}</p> }
          </div>
        } @else {
          <div class="loc-card" style="text-align:center">
            <p class="muted" style="margin:0">{{ pins().length ? 'یک مکان را از فهرست انتخاب کنید' : t.title }}</p>
            <button class="loc-cta" type="button" (click)="toggleRoute()" [disabled]="!pins().length || routingLoading()">
              @if (routingLoading()) { <ion-spinner name="crescent" style="width:18px;height:18px"></ion-spinner> } @else { {{ isRouting() ? t.removeRoute : t.routing }} }
            </button>
          </div>
        }
        <div class="loc-list">
          @if (!filtered().length) {
            <div class="dark-card" style="text-align:center;padding:16px"><p class="muted" style="margin:0">{{ fa.common.empty }}</p></div>
          } @else {
            @for (p of filtered(); track p.id) {
              <button type="button" class="loc-item" [class.sel]="selected()?.id===p.id" (click)="selectPin(p)">
                <span class="loc-item-pin" [class.barber]="p.kind==='barber'">{{ p.kind==='shop' ? '◉' : '✂' }}</span>
                <span class="loc-item-meta">
                  <b>{{ p.name }}</b>
                  <small>{{ p.address }}</small>
                  @if (p.phone) { <small class="muted-sm">{{ p.phone }}</small> }
                </span>
                <span class="loc-item-kind">{{ p.kind==='shop' ? 'شعبه' : 'آرایشگر' }}</span>
              </button>
            }
          }
        </div>
      </div>
    </ion-content>
  `,
  styles: [`
     .loc-wrap { gap: 14px; padding-top: 10px; }
     .loc-head { text-align: right; }
     .loc-head h1 { margin: 0; font-size: 22px; font-weight: 800; color: var(--text-primary); line-height: 1.2; }
     .loc-head p { margin: 6px 0 0; font-size: 11px; color: var(--text-secondary); }
     .search-bar { display:flex; align-items:center; gap:10px; background: var(--card-bg); border:1px solid var(--card-border); border-radius:10px; padding:10px 12px; width:100%; box-sizing:border-box; }
     .search-bar ion-icon { font-size:18px; color:var(--text-muted); flex-shrink:0; }
     .search-bar input { flex:1; min-width:0; border:none; outline:none; background:transparent; color: var(--text-primary); font-size:13px; font-family:inherit; text-align:right; direction:rtl; }
     .search-bar input::placeholder { color: var(--text-muted); }
     .sb-clear { width:26px;height:26px;border-radius:999px;border:1px solid var(--card-border);background:transparent;color:var(--text-secondary);display:inline-flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0 }
     .loc-map-wrap { position: relative; width: 100%; border-radius: 12px; overflow: hidden; border: 1px solid var(--card-border); box-sizing: border-box; }
     .loc-map { width: 100%; height: 300px; background: #1e2a44; }
     @media (min-width: 640px) { .loc-map { height: 360px; } }
     .loc-map-loading{ position:absolute; inset:0; display:flex; align-items:center; justify-content:center; background: rgba(0,0,0,0.18); z-index:350 }
     .loc-recenter { position: absolute; bottom: 12px; left: 12px; z-index: 400; width: 32px; height: 32px; border-radius: 8px; background: #0f1a2e; border: 1px solid #243150; color: #cbd5e1; display: inline-flex; align-items: center; justify-content: center; font-size: 16px; cursor: pointer; box-shadow: 0 2px 8px rgba(0,0,0,0.25); }
     .loc-route-badge { position: absolute; top: 10px; left: 50%; transform: translateX(-50%); z-index: 400; background: var(--card-bg); border: 1px solid var(--card-border); color: var(--text-primary); font-size: 11px; font-weight: 700; padding: 6px 10px; border-radius: 999px; display: inline-flex; align-items: center; gap: 6px; white-space: nowrap; box-shadow: 0 4px 16px rgba(0,0,0,0.25); direction: rtl; }
     .loc-route-badge .dot { color: var(--text-muted); }
     .badge-close { width: 20px; height: 20px; border-radius: 999px; border: 1px solid var(--card-border); background: transparent; color: var(--text-secondary); display: inline-flex; align-items: center; justify-content: center; font-size: 12px; cursor: pointer; margin-inline-start: 2px; }
     .loc-card { background: var(--card-bg); border: 1px solid var(--card-border); border-radius: 12px; padding: 14px; display: flex; flex-direction: column; gap: 6px; text-align: right; box-sizing: border-box; width: 100%; }
     .loc-card-title { font-size: 13px; font-weight: 800; color: var(--text-primary); line-height: 1.4; }
     .loc-card-addr { margin: 0; font-size: 11px; color: var(--text-secondary); line-height: 1.6; }
     .loc-card-phone { margin: 2px 0 6px; font-size: 11px; font-weight: 700; color: var(--text-primary); text-align: right; }
     .loc-cta { width: 100%; height: 38px; border-radius: 8px; border: none; background: var(--accent); color: var(--accent-contrast); font-size: 12px; font-weight: 800; font-family: inherit; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; }
     .loc-cta:disabled { opacity: 0.7; cursor: default; }
     .loc-cta:active:not(:disabled) { transform: scale(0.99); }
     .loc-route-error { margin: 0; font-size: 11px; color: var(--ion-color-danger, #ef4444); text-align: center; }
     .loc-list{ display:flex; flex-direction:column; gap:8px }
     .loc-item{ display:flex; align-items:center; gap:10px; width:100%; text-align:right; background:var(--card-bg); border:1px solid var(--card-border); border-radius:10px; padding:10px 12px; cursor:pointer; font-family:inherit; box-sizing:border-box }
     .loc-item.sel{ border-color:var(--accent); background:var(--card-bg-2); }
     .loc-item-pin{ width:36px;height:36px;border-radius:999px;background:var(--accent);color:#0b101e;display:inline-flex;align-items:center;justify-content:center;font-size:14px;flex-shrink:0;border:2px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.2) }
     .loc-item-pin.barber{ background:#2ec4b6 }
     .loc-item-meta{ flex:1; min-width:0; display:flex; flex-direction:column; gap:2px; align-items:flex-start }
     .loc-item-meta b{ font-size:12px; font-weight:800; color:var(--text-primary); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:100% }
     .loc-item-meta small{ font-size:11px; color:var(--text-secondary); line-height:1.3; display:-webkit-box; -webkit-line-clamp:1; -webkit-box-orient:vertical; overflow:hidden }
     .loc-item-kind{ font-size:10px; font-weight:700; color:var(--text-muted); border:1px solid var(--card-border); border-radius:999px; padding:3px 7px; flex-shrink:0 }
     html:not(.ion-palette-dark) .loc-map { background: #e2e8f0; }
     html:not(.ion-palette-dark) .loc-recenter { background: #ffffff; border-color: #cbd5e1; color: #475569; }
     :host ::ng-deep .salon-pin { background: transparent; border: none; }
     :host ::ng-deep .salon-pin-inner { width: 44px; height: 44px; border-radius: 999px; background: var(--accent); display: flex; align-items: center; justify-content: center; color: #0b101e; font-size: 22px; border: 2px solid #fff; box-shadow: 0 4px 16px rgba(0,0,0,0.35); }
     :host ::ng-deep .barber-pin-inner { width: 36px; height: 36px; border-radius: 999px; background: #2ec4b6; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 16px; border: 2px solid #fff; box-shadow: 0 4px 16px rgba(0,0,0,0.35); }
     :host ::ng-deep .user-pin { background: transparent; border: none; }
     :host ::ng-deep .user-pin-inner { width: 16px; height: 16px; border-radius: 999px; background: #3b82f6; border: 3px solid #fff; box-shadow: 0 2px 8px rgba(0,0,0,0.35); display: block; }
     :host ::ng-deep .leaflet-control-attribution { font-size: 10px; opacity: 0.8; }
  `],
})
export class BarbershopsPage implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('mapEl', { static: false }) mapEl!: ElementRef<HTMLDivElement>;
  private toast = inject(ToastService);
  private api = inject(ApiService);
  private map?: L.Map;
  t = fa.barbershopLocation;
  fa = fa;
  ph = fa.barbersList.searchPlaceholder;
  private defaultLatLng: [number, number] = [35.7826, 51.3675];
  private markers = new Map<string, L.Marker>();
  private userMarker?: L.Marker;
  private routeLine?: L.Polyline;
  isRouting = signal(false);
  routingLoading = signal(false);
  routeInfo = signal<{ dist: string; time: string } | null>(null);
  routeError = signal('');
  loading = signal(false);
  pins = signal<PinItem[]>([]);
  q = signal('');
  query = '';
  selected = signal<PinItem | null>(null);
  userLatLng = signal<[number, number] | null>(null);
  filtered = computed(() => {
    const s = this.q().trim().toLowerCase();
    const arr = this.pins();
    if (!s) return arr;
    return arr.filter(p => `${p.name} ${p.address} ${p.phone}`.toLowerCase().includes(s));
  });
  countLabel = computed(() => {
    const n = this.filtered().length;
    const f = this.toFa(n.toString());
    return `${f} مکان`;
  });

  constructor() { addIcons({ locateOutline, closeOutline, searchOutline, star }); }

  ngOnInit() {
    this.resolveUserLocation();
    this.load();
  }
  ngAfterViewInit() { setTimeout(() => this.initMap(), 80); }
  ngOnDestroy() { this.map?.remove(); }

  private resolveUserLocation() {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      p => {
        const ll: [number, number] = [p.coords.latitude, p.coords.longitude];
        this.userLatLng.set(ll);
        if (this.map) {
          this.map.setView(ll, 14);
          this.upsertUserMarker(ll);
          if (!this.selected() && this.pins().length) this.fitAll();
        }
      },
      () => {},
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 60000 },
    );
  }

  private load() {
    this.loading.set(true);
    forkJoin({
      shops: this.api.barbershops.list().pipe(catchError(() => of([]))),
      barbers: this.api.barbers.list().pipe(catchError(() => of([]))),
      locs: this.api.locations.list().pipe(catchError(() => of([]))),
    }).subscribe(({ shops, barbers, locs }) => {
      const shopsArr = unwrapArray<Barbershop>(shops);
      const barbersArr = unwrapArray<Barber>(barbers);
      const locsArr = unwrapArray<Location>(locs);
      const byBarber = new Map<string, Location>();
      for (const l of locsArr) if (l.barberId) byBarber.set(l.barberId, l);
      const shopById = new Map<string, Barbershop>();
      for (const s of shopsArr) shopById.set(s.id, s);
      const pins: PinItem[] = [];
      for (const s of shopsArr) {
        const lat = Number((s as unknown as Record<string, unknown>)['latitude'] ?? s.latitude);
        const lng = Number((s as unknown as Record<string, unknown>)['longitude'] ?? s.longitude);
        if (Number.isFinite(lat) && Number.isFinite(lng) && lat !== 0 && lng !== 0) {
          pins.push({ id: `shop-${s.id}`, kind: 'shop', name: s.name ?? this.t.branch, address: s.address ?? this.t.address, phone: (s.phoneNumber as string) ?? '', lat, lng, raw: s });
        }
      }
      for (const b of barbersArr) {
        let lat: number | null = null, lng: number | null = null, addr = '', phone = '';
        const loc = byBarber.get(b.id);
        if (loc && Number.isFinite(Number(loc.latitude)) && Number.isFinite(Number(loc.longitude))) {
          lat = Number(loc.latitude); lng = Number(loc.longitude); addr = loc.address ?? '';
        }
        if ((lat === null || lng === null) && b.barbershopId) {
          const sh = shopById.get(b.barbershopId);
          if (sh && Number.isFinite(Number(sh.latitude)) && Number.isFinite(Number(sh.longitude))) { lat = Number(sh.latitude); lng = Number(sh.longitude); addr = sh.address ?? addr; phone = (sh.phoneNumber as string) ?? phone; }
        }
        if (lat === null || lng === null) continue;
        const name = b.fullName ?? (b as unknown as Record<string,unknown>)['name'] as string ?? 'آرایشگر';
        pins.push({ id: `barber-${b.id}`, kind: 'barber', name, address: addr || this.t.address, phone, lat, lng, raw: b });
      }
      if (!pins.length && shopsArr.length) {
        const s = shopsArr[0];
        pins.push({ id: `shop-${s.id}`, kind: 'shop', name: s.name ?? this.t.branch, address: s.address ?? this.t.address, phone: (s.phoneNumber as string) ?? '', lat: this.defaultLatLng[0], lng: this.defaultLatLng[1], raw: s });
      }
      this.pins.set(pins);
      if (pins.length && !this.selected()) this.selected.set(pins[0]);
      this.loading.set(false);
      if (this.map) { this.refreshMarkers(); this.fitAll(); }
    });
  }

  private initMap() {
    const el = this.mapEl?.nativeElement;
    if (!el || this.map) return;
    const center: L.LatLngExpression = this.userLatLng() ?? (this.pins().length ? [this.pins()[0].lat, this.pins()[0].lng] : this.defaultLatLng);
    const zoom = this.userLatLng() ? 14 : 13;
    this.map = L.map(el, { zoomControl: false, attributionControl: true }).setView(center, zoom);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '© OpenStreetMap' }).addTo(this.map);
    L.control.zoom({ position: 'bottomright' }).addTo(this.map);
    if (this.userLatLng()) this.upsertUserMarker(this.userLatLng()!);
    this.refreshMarkers();
    setTimeout(() => this.map?.invalidateSize(), 200);
    if (this.pins().length) setTimeout(() => this.fitAll(), 250);
  }

  refreshMarkers() {
    if (!this.map) return;
    for (const m of this.markers.values()) m.remove();
    this.markers.clear();
    const list = this.filtered().length ? this.filtered() : this.pins();
    const showFilteredOnly = this.q().trim().length > 0;
    const toShow = showFilteredOnly ? this.filtered() : this.pins();
    if (!toShow.length && showFilteredOnly) return;
    for (const p of toShow) {
      const isShop = p.kind === 'shop';
      const icon = L.divIcon({
        className: isShop ? 'salon-pin' : 'barber-pin',
        html: isShop ? `<div class="salon-pin-inner">◉</div>` : `<div class="barber-pin-inner">✂</div>`,
        iconSize: isShop ? [44, 44] : [36, 36],
        iconAnchor: isShop ? [22, 44] : [18, 36],
      });
      const m = L.marker([p.lat, p.lng], { icon }).addTo(this.map!).bindPopup(`<b>${p.name}</b><br/><small>${p.address}</small>`);
      m.on('click', () => this.selectPin(p));
      this.markers.set(p.id, m);
    }
    if (this.userLatLng()) this.upsertUserMarker(this.userLatLng()!);
  }

  private upsertUserMarker(ll: [number, number]) {
    if (!this.map) return;
    const icon = L.divIcon({ className: 'user-pin', html: `<span class="user-pin-inner"></span>`, iconSize: [16, 16], iconAnchor: [8, 8] });
    if (this.userMarker) this.userMarker.setLatLng(ll);
    else this.userMarker = L.marker(ll, { icon, zIndexOffset: 1000 }).addTo(this.map).bindPopup(this.t.yourLocation);
  }

  selectPin(p: PinItem) {
    this.selected.set(p);
    this.map?.setView([p.lat, p.lng], 15, { animate: true });
    this.markers.get(p.id)?.openPopup();
  }

  private fitAll() {
    if (!this.map) return;
    const pts: L.LatLngExpression[] = [];
    if (this.userLatLng()) pts.push(this.userLatLng()!);
    for (const p of (this.filtered().length ? this.filtered() : this.pins())) pts.push([p.lat, p.lng]);
    if (!pts.length) return;
    if (pts.length === 1) this.map.setView(pts[0], 15, { animate: true });
    else this.map.fitBounds(L.latLngBounds(pts as L.LatLng[]), { padding: [28, 28] });
    this.map.invalidateSize();
  }

  recenter() {
    if (!this.map) return;
    if (this.routeLine) { this.map.fitBounds(this.routeLine.getBounds(), { padding: [24, 24] }); return; }
    const sel = this.selected();
    if (sel) this.map.setView([sel.lat, sel.lng], 15, { animate: true });
    else if (this.userLatLng()) this.map.setView(this.userLatLng()!, 14, { animate: true });
    else this.fitAll();
    this.map.invalidateSize();
  }

  toggleRoute() {
    if (this.isRouting()) this.clearRoute();
    else this.startRoute();
  }
  clearRoute() {
    this.routeLine?.remove(); this.routeLine = undefined;
    this.isRouting.set(false); this.routeInfo.set(null); this.routeError.set('');
    const sel = this.selected();
    if (sel) this.map?.setView([sel.lat, sel.lng], 15, { animate: true });
    else if (this.userLatLng()) this.map?.setView(this.userLatLng()!, 14, { animate: true });
  }

  private async startRoute() {
    if (!this.map) return;
    const dest = this.selected() ?? this.pins()[0];
    if (!dest) { this.toast.error(fa.common.noData); return; }
    this.routingLoading.set(true); this.routeError.set('');
    try {
      const user = this.userLatLng() ?? await this.getUserLatLng();
      if (!this.userLatLng()) { this.userLatLng.set(user); this.upsertUserMarker(user); }
      const to: [number, number] = [dest.lat, dest.lng];
      const coords = await this.fetchOsrmRoute(user, to);
      this.drawRoute(user, to, coords);
      this.isRouting.set(true);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : (fa.toast.routingFailed ?? this.t.routingFailed);
      this.routeError.set(msg); this.toast.error(msg);
    } finally { this.routingLoading.set(false); }
  }

  private getUserLatLng(): Promise<[number, number]> {
    if (this.userLatLng()) return Promise.resolve(this.userLatLng()!);
    if (!navigator.geolocation) return Promise.resolve(this.defaultLatLng as [number, number]);
    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (p) => resolve([p.coords.latitude, p.coords.longitude]),
        () => resolve(this.defaultLatLng as [number, number]),
        { enableHighAccuracy: false, timeout: 6000, maximumAge: 60000 },
      );
    });
  }

  private async fetchOsrmRoute(from: [number, number], to: [number, number]): Promise<{ coords: L.LatLngExpression[]; dist: number; dur: number } | null> {
    const url = `https://router.project-osrm.org/route/v1/driving/${from[1]},${from[0]};${to[1]},${to[0]}?overview=full&geometries=geojson`;
    try {
      const r = await fetch(url);
      if (!r.ok) return null;
      const j = await r.json() as { routes?: { geometry: { coordinates: [number, number][] }; distance: number; duration: number }[] };
      const route = j.routes?.[0];
      if (!route) return null;
      const coords: L.LatLngExpression[] = route.geometry.coordinates.map(([lng, lat]) => [lat, lng] as L.LatLngExpression);
      return { coords, dist: route.distance, dur: route.duration };
    } catch { return null; }
  }

  private drawRoute(user: [number, number], dest: [number, number], osrm: { coords: L.LatLngExpression[]; dist: number; dur: number } | null) {
    if (!this.map) return;
    this.routeLine?.remove();
    this.upsertUserMarker(user);
    const coords: L.LatLngExpression[] = osrm?.coords ?? [user, dest];
    this.routeLine = L.polyline(coords, { color: '#f59e0b', weight: 5, opacity: 0.95 }).addTo(this.map);
    if (osrm) {
      const km = osrm.dist / 1000;
      const distFa = km >= 1 ? `${this.toFa(km.toFixed(1))} ${this.t.km}` : `${this.toFa(Math.round(osrm.dist).toString())} ${this.t.meter}`;
      const mins = Math.max(1, Math.round(osrm.dur / 60));
      this.routeInfo.set({ dist: distFa, time: `${this.toFa(mins.toString())} ${this.t.minute}` });
    } else {
      const d = this.haversineKm(user, dest);
      this.routeInfo.set({ dist: `${this.toFa(d.toFixed(1))} ${this.t.km}${this.t.directSuffix}`, time: '—' });
    }
    this.map.fitBounds(this.routeLine.getBounds(), { padding: [28, 28] });
  }

  private haversineKm(a: [number, number], b: [number, number]): number {
    const R = 6371;
    const dLat = (b[0] - a[0]) * Math.PI / 180;
    const dLng = (b[1] - a[1]) * Math.PI / 180;
    const s = Math.sin(dLat / 2) ** 2 + Math.cos(a[0] * Math.PI / 180) * Math.cos(b[0] * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.asin(Math.sqrt(s));
  }
  private toFa(s: string): string {
    const m = ['۰','۱','۲','۳','۴','۵','۶','۷','۸','۹'];
    return s.replace(/[0-9]/g, d => m[+d]).replace('.', '/');
  }
}

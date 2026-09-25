import { Component, AfterViewInit, OnDestroy, ViewChild, ElementRef, signal, inject, OnInit } from '@angular/core';
import { IonContent, IonIcon, IonSpinner } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { locateOutline, closeOutline } from 'ionicons/icons';
import * as L from 'leaflet';
import { ToastService } from '../../core/services/toast.service';
import { ApiService } from '../../core/services/api.service';
import { Barbershop } from '../../core/models';
import { fa } from '../../core/i18n/fa';

@Component({
  selector: 'app-barbershops',
  standalone: true,
  imports: [IonContent, IonIcon, IonSpinner],
  template: `
    <ion-content [fullscreen]="true">
      <div class="page-wrap loc-wrap" dir="rtl">
        <div class="loc-head">
          <h1>{{ t.title }}</h1>
          <p>{{ shopName() }}</p>
        </div>
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
        </div>
        <div class="loc-card">
          <b class="loc-card-title">{{ shopName() }}</b>
          <p class="loc-card-addr">{{ shopAddr() }}</p>
          <p class="loc-card-phone">{{ shopPhone() }}</p>
          <button class="loc-cta" type="button" (click)="toggleRoute()" [disabled]="routingLoading()">
            @if (routingLoading()) {
              <ion-spinner name="crescent" style="width:18px;height:18px"></ion-spinner>
            } @else {
              {{ isRouting() ? t.removeRoute : t.routing }}
            }
          </button>
          @if (isRouting() && routeError()) {
            <p class="loc-route-error">{{ routeError() }}</p>
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
    .loc-map-wrap { position: relative; width: 100%; border-radius: 12px; overflow: hidden; border: 1px solid var(--card-border); box-sizing: border-box; }
    .loc-map { width: 100%; height: 300px; background: #1e2a44; }
    @media (min-width: 640px) { .loc-map { height: 360px; } }
    .loc-recenter {
      position: absolute;
      bottom: 12px;
      left: 12px;
      z-index: 400;
      width: 32px; height: 32px; border-radius: 8px;
      background: #0f1a2e; border: 1px solid #243150; color: #cbd5e1;
      display: inline-flex; align-items: center; justify-content: center;
      font-size: 16px; cursor: pointer;
      box-shadow: 0 2px 8px rgba(0,0,0,0.25);
    }
    .loc-route-badge {
      position: absolute;
      top: 10px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 400;
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      color: var(--text-primary);
      font-size: 11px;
      font-weight: 700;
      padding: 6px 10px;
      border-radius: 999px;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      white-space: nowrap;
      box-shadow: 0 4px 16px rgba(0,0,0,0.25);
      direction: rtl;
    }
    .loc-route-badge .dot { color: var(--text-muted); }
    .badge-close {
      width: 20px; height: 20px; border-radius: 999px;
      border: 1px solid var(--card-border); background: transparent; color: var(--text-secondary);
      display: inline-flex; align-items: center; justify-content: center; font-size: 12px; cursor: pointer;
      margin-inline-start: 2px;
    }
    .loc-card {
      background: var(--card-bg); border: 1px solid var(--card-border); border-radius: 12px;
      padding: 14px; display: flex; flex-direction: column; gap: 6px; text-align: right; box-sizing: border-box; width: 100%;
    }
    .loc-card-title { font-size: 13px; font-weight: 800; color: var(--text-primary); line-height: 1.4; }
    .loc-card-addr { margin: 0; font-size: 11px; color: var(--text-secondary); line-height: 1.6; }
    .loc-card-phone { margin: 2px 0 6px; font-size: 11px; font-weight: 700; color: var(--text-primary); text-align: right; }
    .loc-cta {
      width: 100%; height: 38px; border-radius: 8px; border: none;
      background: var(--accent); color: var(--accent-contrast);
      font-size: 12px; font-weight: 800; font-family: inherit; cursor: pointer;
      display: inline-flex; align-items: center; justify-content: center;
    }
    .loc-cta:disabled { opacity: 0.7; cursor: default; }
    .loc-cta:active:not(:disabled) { transform: scale(0.99); }
    .loc-route-error { margin: 0; font-size: 11px; color: var(--ion-color-danger, #ef4444); text-align: center; }
    html:not(.ion-palette-dark) .loc-map { background: #e2e8f0; }
    html:not(.ion-palette-dark) .loc-recenter { background: #ffffff; border-color: #cbd5e1; color: #475569; }
    :host ::ng-deep .salon-pin { background: transparent; border: none; }
    :host ::ng-deep .salon-pin-inner {
      width: 44px; height: 44px; border-radius: 999px; background: var(--accent);
      display: flex; align-items: center; justify-content: center;
      color: #0b101e; font-size: 22px; border: 2px solid #fff;
      box-shadow: 0 4px 16px rgba(0,0,0,0.35);
    }
    :host ::ng-deep .user-pin { background: transparent; border: none; }
    :host ::ng-deep .user-pin-inner {
      width: 16px; height: 16px; border-radius: 999px; background: #3b82f6;
      border: 3px solid #fff; box-shadow: 0 2px 8px rgba(0,0,0,0.35); display: block;
    }
    :host ::ng-deep .leaflet-control-attribution { font-size: 10px; opacity: 0.8; }
  `],
})
export class BarbershopsPage implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('mapEl', { static: false }) mapEl!: ElementRef<HTMLDivElement>;
  private toast = inject(ToastService);
  private api = inject(ApiService);
  private map?: L.Map;
  t = fa.barbershopLocation;
  private salonLatLng: L.LatLngExpression = [35.7826, 51.3675];
  private salonMarker?: L.Marker;
  private userMarker?: L.Marker;
  private routeLine?: L.Polyline;
  isRouting = signal(false);
  routingLoading = signal(false);
  routeInfo = signal<{ dist: string; time: string } | null>(null);
  routeError = signal('');
  shop = signal<Barbershop | null>(null);
  shopName = signal<string>(fa.barbershopLocation.branch);
  shopAddr = signal<string>(fa.barbershopLocation.address);
  shopPhone = signal<string>(fa.barbershopLocation.phone);

  constructor() { addIcons({ locateOutline, closeOutline }); }

  ngOnInit() {
    this.api.barbershops.list().subscribe({
      next: (v) => {
        const arr = Array.isArray(v) ? v as Barbershop[] : [];
        const s = arr[0];
        if (s) {
          this.shop.set(s);
          this.shopName.set(s.name ?? this.t.branch);
          this.shopAddr.set(s.address ?? this.t.address);
          if (s.phoneNumber) this.shopPhone.set(s.phoneNumber as string);
          if (s.latitude && s.longitude) {
            this.salonLatLng = [Number(s.latitude), Number(s.longitude)];
            if (this.map) {
              this.map.setView(this.salonLatLng, 15);
              this.salonMarker?.setLatLng(this.salonLatLng);
            }
          }
          const sid = s.id;
          if (sid) {
            this.api.locations.byBarber(sid).subscribe({
              next: (loc) => {
                const l = loc as unknown as Record<string, unknown>;
                const lat = Number(l['latitude'] ?? l['lat']);
                const lng = Number(l['longitude'] ?? l['lng']);
                if (lat && lng) {
                  this.salonLatLng = [lat, lng];
                  if (this.map) {
                    this.map.setView(this.salonLatLng, 15);
                    this.salonMarker?.setLatLng(this.salonLatLng);
                  }
                }
              },
              error: () => {},
            });
          }
        }
      },
      error: () => {},
    });
  }

  ngAfterViewInit() {
    setTimeout(() => this.initMap(), 80);
  }

  ngOnDestroy() {
    this.map?.remove();
  }

  private initMap() {
    const el = this.mapEl?.nativeElement;
    if (!el || this.map) return;
    this.map = L.map(el, { zoomControl: false, attributionControl: true }).setView(this.salonLatLng, 15);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap',
    }).addTo(this.map);
    L.control.zoom({ position: 'bottomright' }).addTo(this.map);

    const salonIcon = L.divIcon({
      className: 'salon-pin',
      html: `<div class="salon-pin-inner">◉</div>`,
      iconSize: [44, 44],
      iconAnchor: [22, 44],
    });
    this.salonMarker = L.marker(this.salonLatLng, { icon: salonIcon })
      .addTo(this.map)
      .bindPopup(this.t.popup);

    setTimeout(() => this.map?.invalidateSize(), 200);
  }

  recenter() {
    if (!this.map) return;
    if (this.routeLine) {
      this.map.fitBounds(this.routeLine.getBounds(), { padding: [24, 24] });
    } else {
      this.map.setView(this.salonLatLng, 15, { animate: true });
    }
    this.map.invalidateSize();
  }

  toggleRoute() {
    if (this.isRouting()) this.clearRoute();
    else this.startRoute();
  }

  clearRoute() {
    this.routeLine?.remove();
    this.routeLine = undefined;
    this.userMarker?.remove();
    this.userMarker = undefined;
    this.isRouting.set(false);
    this.routeInfo.set(null);
    this.routeError.set('');
    this.map?.setView(this.salonLatLng, 15, { animate: true });
  }

  private async startRoute() {
    if (!this.map) return;
    this.routingLoading.set(true);
    this.routeError.set('');
    try {
      const user = await this.getUserLatLng();
      const salon = this.salonLatLng as [number, number];
      const coords = await this.fetchOsrmRoute(user, salon);
      this.drawRoute(user, coords);
      this.isRouting.set(true);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : (fa.toast.routingFailed ?? this.t.routingFailed);
      this.routeError.set(msg);
      this.toast.error(msg);
    } finally {
      this.routingLoading.set(false);
    }
  }

  private getUserLatLng(): Promise<[number, number]> {
    if (!navigator.geolocation) return Promise.resolve([35.7926, 51.3775]);
    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (p) => resolve([p.coords.latitude, p.coords.longitude]),
        () => resolve([35.7926, 51.3775]),
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
    } catch {
      return null;
    }
  }

  private drawRoute(user: [number, number], osrm: { coords: L.LatLngExpression[]; dist: number; dur: number } | null) {
    if (!this.map) return;
    this.routeLine?.remove();
    this.userMarker?.remove();

    const userIcon = L.divIcon({
      className: 'user-pin',
      html: `<span class="user-pin-inner"></span>`,
      iconSize: [16, 16],
      iconAnchor: [8, 8],
    });
    this.userMarker = L.marker(user, { icon: userIcon }).addTo(this.map).bindPopup(this.t.yourLocation);

    const coords: L.LatLngExpression[] = osrm?.coords ?? [user, this.salonLatLng];
    this.routeLine = L.polyline(coords, { color: '#f59e0b', weight: 5, opacity: 0.95 }).addTo(this.map);

    if (osrm) {
      const km = osrm.dist / 1000;
      const distFa = km >= 1 ? `${this.toFa(km.toFixed(1))} ${this.t.km}` : `${this.toFa(Math.round(osrm.dist).toString())} ${this.t.meter}`;
      const mins = Math.max(1, Math.round(osrm.dur / 60));
      this.routeInfo.set({ dist: distFa, time: `${this.toFa(mins.toString())} ${this.t.minute}` });
    } else {
      const d = this.haversineKm(user, this.salonLatLng as [number, number]);
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
    const fa = ['۰','۱','۲','۳','۴','۵','۶','۷','۸','۹'];
    return s.replace(/[0-9]/g, d => fa[+d]).replace('.', '/');
  }
}

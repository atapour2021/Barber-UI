import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { AuthService } from './auth.service';
export type ViewRole = 'admin' | 'barber' | 'customer';
const KEY = 'active_view';
const ROLES: ViewRole[] = ['admin', 'barber', 'customer'];
@Injectable({ providedIn: 'root' })
export class ViewRoleService {
  private auth = inject(AuthService);
  activeView = signal<ViewRole>(this.load());
  isBarber = computed(() => this.activeView() === 'barber');
  isCustomer = computed(() => this.activeView() === 'customer');
  isAdmin = computed(() => this.activeView() === 'admin');
  constructor() {
    effect(() => {
      const u = this.auth.user();
      if (!u) {
        this.activeView.set('customer');
        try { localStorage.removeItem(KEY); } catch {}
        return;
      }
      if (!localStorage.getItem(KEY)) this.activeView.set(this.fromRole());
    });
  }
  setView(v: ViewRole) {
    this.activeView.set(v);
    localStorage.setItem(KEY, v);
  }
  private load(): ViewRole {
    const v = localStorage.getItem(KEY) as ViewRole | null;
    if (v && ROLES.includes(v)) return v;
    return this.fromRole();
  }
  private fromRole(): ViewRole {
    const r = (this.auth.user()?.role ?? '').toLowerCase();
    if (r === 'admin' || r === 'super_admin') return 'admin';
    if (r === 'barber') return 'barber';
    return 'customer';
  }
}

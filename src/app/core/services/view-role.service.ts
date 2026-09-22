import { Injectable, computed, inject, signal } from '@angular/core';
import { AuthService } from './auth.service';
export type ViewRole = 'admin' | 'barber' | 'customer';
const KEY = 'active_view';
@Injectable({ providedIn: 'root' })
export class ViewRoleService {
  private auth = inject(AuthService);
  activeView = signal<ViewRole>(this.load());
  isBarber = computed(() => this.activeView() === 'barber');
  isCustomer = computed(() => this.activeView() === 'customer');
  isAdmin = computed(() => this.activeView() === 'admin');
  private load(): ViewRole {
    const v = localStorage.getItem(KEY) as ViewRole | null;
    if (v && ['admin', 'barber', 'customer'].includes(v)) return v;
    const r = (this.auth.user()?.role ?? '').toLowerCase();
    if (r === 'admin' || r === 'super_admin') return 'admin';
    if (r === 'barber') return 'barber';
    return 'customer';
  }
  setView(v: ViewRole) {
    this.activeView.set(v);
    localStorage.setItem(KEY, v);
  }
}

import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly KEY = 'theme';
  private mql?: MediaQueryList;
  private http = inject(HttpClient);
  private base = environment.apiUrl;
  isDark = signal(false);

  init() {
    const saved = localStorage.getItem(this.KEY);
    this.mql = window.matchMedia('(prefers-color-scheme: dark)');
    if (saved) {
      this.apply(saved === 'dark', false);
    } else {
      this.isDark.set(this.mql.matches);
      document.documentElement.classList.toggle('ion-palette-dark', this.mql.matches);
      this.mql.addEventListener('change', (e) => {
        if (!localStorage.getItem(this.KEY)) {
          this.isDark.set(e.matches);
          document.documentElement.classList.toggle('ion-palette-dark', e.matches);
        }
      });
    }
    if (localStorage.getItem('access_token')) this.loadFromApi();
  }

  loadFromApi() {
    this.http.get<{ themePreference: string }>(`${this.base}/users/me/preferences`).subscribe({
      next: (p) => {
        if (p?.themePreference === 'dark' || p?.themePreference === 'light') this.apply(p.themePreference === 'dark', true);
      },
      error: () => {},
    });
  }

  toggle() {
    const next = !this.isDark();
    this.apply(next, true);
    if (localStorage.getItem('access_token')) {
      this.http.patch(`${this.base}/users/me/preferences`, { themePreference: next ? 'dark' : 'light' }).subscribe({ error: () => {} });
    }
  }

  private apply(dark: boolean, persistLocal = true) {
    this.isDark.set(dark);
    document.documentElement.classList.toggle('ion-palette-dark', dark);
    if (persistLocal) localStorage.setItem(this.KEY, dark ? 'dark' : 'light');
  }
}

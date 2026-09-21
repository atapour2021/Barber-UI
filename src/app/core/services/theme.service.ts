import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly KEY = 'theme';
  private mql?: MediaQueryList;
  isDark = signal(false);

  init() {
    const saved = localStorage.getItem(this.KEY);
    this.mql = window.matchMedia('(prefers-color-scheme: dark)');
    if (saved) {
      this.apply(saved === 'dark');
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
  }

  toggle() {
    this.apply(!this.isDark());
  }

  private apply(dark: boolean) {
    this.isDark.set(dark);
    document.documentElement.classList.toggle('ion-palette-dark', dark);
    localStorage.setItem(this.KEY, dark ? 'dark' : 'light');
  }
}

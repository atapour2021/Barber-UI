import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly KEY = 'theme';
  isDark = signal(false);

  init() {
    const saved = localStorage.getItem(this.KEY);
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    this.apply(saved ? saved === 'dark' : prefersDark);
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

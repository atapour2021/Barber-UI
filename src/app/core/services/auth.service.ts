import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap, map, catchError, of, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthResponse, User } from '../models';

const AT = 'access_token';
const RT = 'refresh_token';
const US = 'user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/auth`;
  user = signal<User | null>(this.readUser());
  token = signal<string | null>(localStorage.getItem(AT));

  private readUser(): User | null {
    try {
      const v = localStorage.getItem(US);
      return v ? JSON.parse(v) : null;
    } catch {
      return null;
    }
  }
  isLoggedIn = () => !!this.token();
  isAdmin = () =>
    ['admin', 'super_admin'].includes((this.user()?.role ?? '').toLowerCase());
  isBarber = () => (this.user()?.role ?? '').toLowerCase() === 'barber';

  private persist(r: AuthResponse) {
    localStorage.setItem(AT, r.access_token);
    localStorage.setItem(RT, r.refresh_token);
    localStorage.setItem(US, JSON.stringify(r.user));
    this.token.set(r.access_token);
    this.user.set(r.user);
  }

  register(dto: Record<string, unknown>) {
    return this.http
      .post<AuthResponse>(`${this.base}/register`, dto)
      .pipe(tap((r) => this.persist(r)));
  }
  login(dto: { username: string; password: string }) {
    return this.http
      .post<AuthResponse>(`${this.base}/login`, dto)
      .pipe(tap((r) => this.persist(r)));
  }
  refresh() {
    const rt = localStorage.getItem(RT) ?? '';
    return this.http
      .post<AuthResponse>(`${this.base}/refresh`, { refresh_token: rt })
      .pipe(tap((r) => this.persist(r)));
  }
  logout() {
    const rt = localStorage.getItem(RT);
    if (!rt) {
      this.clear();
      return this.http
        .post(`${this.base}/logout`, { refresh_token: '' })
        .pipe(
          catchError(() => of(void 0)),
          tap(() => this.clear()),
          map(() => void 0),
        );
    }
    return this.http.post(`${this.base}/logout`, { refresh_token: rt }).pipe(
      tap(() => this.clear()),
      map(() => void 0),
      catchError((e) => {
        this.clear();
        return throwError(() => e);
      }),
    );
  }
  logoutAll() {
    return this.http
      .post(`${this.base}/logout-all`, {})
      .pipe(tap(() => this.clear()));
  }
  forgot(dto: { email?: string; username?: string }) {
    return this.http.post<{ reset_token: string } | { message: string }>(
      `${this.base}/forgot-password`,
      dto,
    );
  }
  reset(dto: { token: string; password: string }) {
    return this.http.post(`${this.base}/reset-password`, dto);
  }
  clear() {
    try { localStorage.removeItem(AT); } catch {}
    try { localStorage.removeItem(RT); } catch {}
    try { localStorage.removeItem(US); } catch {}
    try { localStorage.clear(); } catch {}
    try { sessionStorage.clear(); } catch {}
    this.token.set(null);
    this.user.set(null);
  }
}

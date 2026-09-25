# AI.md — Barber Management System (barber-ui)

> **Rule for AI:** Read this file first before any task. Follow architecture, design system, routing, and coding patterns exactly. Keep this file updated after major architecture / design-system / frontend-logic changes.

## 1. Purpose

Barber Management System — Angular + Ionic frontend for customers / barbers / admins to browse barbershops, barbers, services, manage availability, book appointments, track notifications, manage documents/certificates/education, and admin dashboards. Persian (fa) RTL product named **نیوباربر**.

## 2. Tech Stack

| Layer | Version / Choice |
|---|---|
| Angular | `22.0.1` standalone (`angular-standalone`), `strict: true`, `target es2022` |
| Ionic | `^9.0.0` + `@ionic/angular-toolkit ^13.0.0` |
| Router | `withComponentInputBinding`, `PreloadAllModules`, `IonicRouteStrategy` |
| Http | `provideHttpClient(withInterceptors([authInterceptor, errorInterceptor]))` |
| State | Angular `signal` / `computed`, `inject()` — no NgRx |
| Icons | `ionicons ^8.1.0` via `addIcons()` |
| Map | `leaflet ^1.9.4` + `@types/leaflet`, CSS in `angular.json` styles |
| Language | TypeScript `~6.0.0`, SCSS (`inlineStyleLanguage: scss`) |
| Lint | `angular-eslint 22.0.0`, `eslint ^9.16.0`, `typescript-eslint ^8.61.0` |
| Test | `vitest ^4.0.8` + `jsdom ^26.0.0`, `tsconfig.spec.json`, `src/test-setup.ts` |
| Build | `@angular/build:application`, output `www/` |

Env: `src/environments/environment.ts` (`apiUrl: http://localhost:3000`) replaced by `environment.prod.ts` in production. `ionic.config.json` type `angular-standalone`.

## 3. Project Structure

```
src/
  main.ts                         # bootstrapApplication
  index.html                      # <html lang="fa" dir="rtl">, Vazirmatn, viewport-fit=cover
  global.scss                     # Ionic CSS imports + app tokens + layout utilities
  theme/variables.scss            # Ionic CSS vars + .ion-palette-dark
  environments/{environment,environment.prod}.ts
  app/
    app.component.{ts,html,scss}  # <ion-app><ion-router-outlet>, ThemeService.init()
    app.routes.ts                 # root routes
    tabs/{tabs.page.*,tabs.routes.ts}
    layouts/
      app-layout/app-layout.ts    # topbar + sidebar + <router-outlet> + ion-tab-bar (authed shell)
      auth-layout/auth-layout.ts  # centered auth shell with back-link + title from fa.ts
    core/
      api/{admin,appointments,availability,barbers,barbershops,certificates,educational,locations,notifications,services,uploads,users,utils}.ts
      services/{auth,api,theme,toast,view-role}.service.ts
      guards/auth.guard.ts        # authGuard, guestGuard, adminGuard, barberGuard
      interceptors/{auth,error}.interceptor.ts
      models/index.ts             # all domain interfaces
      i18n/fa.ts                  # single source of Persian strings
      errors/global-error.handler.ts
      utils/error.ts              # extractMessage()
    pages/
      auth/{landing,login,register,forgot,reset}.page.ts
      home/home.page.ts           # role-switched home (admin/barber/customer)
      booking/booking.page.ts     # appointment list + reserve confirm + barber schedule
      appointment/{appointment,appointment-create,appointment-detail}.page.ts
      appointments/appointments.page.ts
      barbers/barbers.page.ts
      barber-detail/{barber-detail,barber-manage}.page.ts
      barbershops/barbershops.page.ts
      services/services.page.ts
      notifications/notifications.page.ts
      profile/{profile,profile-edit,change-password}.page.ts
      addresses/addresses.page.ts # Leaflet map
      documents/documents.page.ts
      training/training.page.ts
      admin/admin.page.ts
    shared/
      ui/ui.ts                    # UiInput, UiTextarea, UiSelect, UiDatepicker, UiMultiSelect, UiNumber, UiButton
      components/{app-sidebar/app-sidebar.ts, empty-state.component.ts, theme-toggle.component.ts}
  assets/{icon,images}
```

## 4. Architecture

- **Standalone only.** Every page/component `standalone: true`, `imports: [...]`. No NgModules. Generated via `@ionic/angular-toolkit:page/component` with `styleext: scss`.
- **Bootstrap:** `src/main.ts` provides `RouteReuseStrategy:IonicRouteStrategy`, `ErrorHandler:GlobalErrorHandler`, `provideIonicAngular()`, `provideHttpClient(withInterceptors(...))`, `provideRouter(..., withPreloading(PreloadAllModules), withComponentInputBinding())`.
- **Lazy loading:** All routes use `loadComponent` / `loadChildren`. No eager page imports.
- **Signals:** Services expose `signal`/`computed`. Example: `AuthService.user/token`, `ThemeService.isDark`, `ViewRoleService.activeView`, page `loading/errorMsg/items` signals.
- **DI:** `inject()` in fields, not constructor injection (except where `addIcons` in constructor).
- **Error handling:** `GlobalErrorHandler` logs + `errorInterceptor` (skips auth URLs/401) + `extractMessage()`.

## 5. Design System

### 5.1 Tokens

Defined in `src/global.scss` `:root` and `src/theme/variables.scss`. Dark is default (`--app-bg: #0b101e`).

| Token | Value |
|---|---|
| `--ion-color-primary` | `#f59e0b` (variables.scss `#ffb703`, overridden in global.scss) |
| `--ion-color-primary-contrast` | `#0b101e` (light: `#fff`) |
| `--accent` / `--accent-strong` | `#f59e0b` / `#fbbf24` |
| `--app-bg` / `--app-bg-2` | `#0b101e` / `#0f172a` (light: `#f8fafc` / `#f1f5f9`) |
| `--card-bg` / `--card-bg-2` | `#151d2f` / `#1a2338` (light: `#fff` / `#f8fafc`) |
| `--card-border` / `--card-border-2` | `#222e4a` / `#25324f` (light: `#e2e8f0` / `#cbd5e1`) |
| `--text-primary/secondary/muted` | `#f1f5f9` / `#94a3b8` / `#64748b` |
| `--link-teal` / `--ok-green` | `#2ec4b6` / `#22c55e` |
| Radius | `--radius-xl 20px`, `--radius-lg 16px`, `--radius-md 12px`, `--radius-sm 10px` |
| Shadows | `--shadow-soft 0 8px 24px rgba(0,0,0,.4)`, `--shadow-card 0 4px 16px rgba(0,0,0,.3)` |

Light overrides via `html:not(.ion-palette-dark)` and `.ion-palette-dark` for Ionic vars.

### 5.2 Typography

- Font: `"Vazirmatn", sans-serif` everywhere (`*`, `body`, `--ion-font-family`). Loaded via Google Fonts in `index.html` (weights 300-700).
- `ion-label, ion-title, p, h1,h2,h3 { text-align: right }`.
- No extra font files; keep Vazirmatn.

### 5.3 Spacing & Layout Utilities

- `.page-wrap` — max `840px` centered, `padding 14px 16px calc(16px+safe-area)`, `gap 14px`, `background var(--app-bg)` ( `640px` breakpoint: `18px 20px`). All pages wrap content in `.page-wrap[dir=rtl]`.
- `.section` / `.section-head` (h3 `13px/800` + link `11px teal`) / `.section-title`
- Cards: `.card-modern`, `.dark-card`, `ion-card { radius var(--radius-lg) + border var(--card-border) }`
- Grids: `.grid-2/.grid2` (1fr 1fr → 1fr at 480px), `.grid-3` (3-col), `.grid-4` in home admin.
- Bars: `.app-topbar` (`#090f1e`, inner max 840px) + `.neo-tabbar` / `ion-tab-bar` (`#0f1a2e/#101a2e`, `64px` + safe-area, `--color-selected var(--accent)`).
- Helpers: `.muted`, `.muted-sm`, `.pill`, `.hero` (gradient accent→#7c3aed), `.stat-card`, `.field`, `.auth-card ion-item`, `.empty-state`, `.skeleton-list`, `.alert-error/.alert-ok`, `.app-toast` (RTL).

### 5.4 Theme

- `ThemeService` (`src/app/core/services/theme.service.ts`): `isDark signal`, `KEY='theme'`, reads `localStorage.theme`, falls back to `matchMedia(prefers-color-scheme: dark)` with listener, toggles `document.documentElement.classList .ion-palette-dark`, persists locally + `PATCH /users/me/preferences {themePreference}` when authed, `loadFromApi()` on init if `access_token` exists.
- Toggle: `theme.toggle()` via topbar button + sidebar + `ThemeToggleComponent`. Icons `sunny-outline/moon-outline`.
- `AppComponent.ngOnInit() { theme.init() }`. Root `color-scheme: light dark` in variables.scss.

### 5.5 RTL Rules

- `index.html`: `<html lang="fa" dir="rtl">`. `global.scss`: `html {direction: rtl}` + `html[dir=rtl]`.
- All page wrappers `dir="rtl"`. Sidebar `dir="rtl"` fixed right (`translateX(100%)` → `0` when open).
- Icons that imply direction (back arrow `/` chevron) are mirrored: `transform: scaleX(-1)` or `chevron-back-outline` (pointing left for RTL).
- LTR exceptions: `ion-input` inside `app-auth-layout .custom-input` and `.custom-input.ltr ion-input` use `direction:ltr; text-align:left` (phone, email, token). Leaflet map stays LTR.
- Logical properties: use `margin-inline-start`, `padding-inline`, etc. where possible; existing topbar uses `margin-inline-start: auto` for brand.
- Text alignment right by default; toast `.app-toast { direction: rtl; text-align:right }`.

### 5.6 Icons & Assets

- Add per-component: `addIcons({ homeOutline, ... })` then `<ion-icon name="...">`. Never assume global registration.
- Favicon `assets/icon/favicon.png`, demo avatars `assets/images/barber-*.jpg`, fallback `https://i.pravatar.cc/100?u=...`.

## 6. Routing

### 6.1 Root (`src/app/app.routes.ts`)

| Path | Component / Guard | Notes |
|---|---|---|
| `` → `landing` | redirect | |
| `landing` | `LandingPage` | public |
| `login` | `LoginPage` + `guestGuard` | inside `AuthLayoutComponent` |
| `register` | `RegisterPage` + `guestGuard` | inside `AuthLayoutComponent` |
| `forgot` | `ForgotPage` + `guestGuard` | inside `AuthLayoutComponent` |
| `reset` | `ResetPage` + `guestGuard` | inside `AuthLayoutComponent` |
| `barbershops` | `BarbershopsPage` | inside `AppLayoutComponent` |
| `barbers` | `BarbersPage` | inside `AppLayoutComponent` |
| `barbers/:id` | `BarberDetailPage` | inside `AppLayoutComponent` |
| `barber/:id/manage` | `BarberManagePage` + `authGuard` | inside `AppLayoutComponent` |
| `services` | `ServicesPage` | inside `AppLayoutComponent` |
| `appointments` | `AppointmentsPage` + `authGuard` | inside `AppLayoutComponent` (non-tabs entry) |
| `notifications` | `NotificationsPage` + `authGuard` | inside `AppLayoutComponent` |
| `profile` | `ProfilePage` + `authGuard` | inside `AppLayoutComponent` |
| `admin` | `AdminPage` + `adminGuard` | inside `AppLayoutComponent` |
| `training` | `TrainingPage` | inside `AppLayoutComponent` |
| `` (tabs) | `loadChildren ./tabs/tabs.routes` | tabs shell |

`AuthLayoutComponent` computes `meta` + `backLink` from `router.url` and `fa.auth.*`. `AppLayoutComponent` renders `.app-topbar` + `.app-outlet` + `ion-footer ion-tab-bar.neo-tabbar`.

### 6.2 Tabs (`src/app/tabs/tabs.routes.ts`, path `tabs`)

Children of `TabsPage` (also sidebar + unread badge):

`home`, `appointment` (auth), `appointment/new` (auth), `appointment/:id` (auth), `turns→appointment`, `appointments→appointment`, `notifications` (auth), `services`, `booking` (auth), `profile` (auth), `profile/edit` (auth), `profile/change-password` (auth), `account→profile` (auth), `addresses` (auth, Leaflet), `training`, `documents` (auth), ``→`/tabs/home`.

`TabsPage` / `AppLayoutComponent` both subscribe to `ApiService.notifications.unread()` to show `bell-dot`.

## 7. Shared Building Blocks

### 7.1 UI Kit (`src/app/shared/ui/ui.ts`)

All are `ControlValueAccessor` (`NG_VALUE_ACCESSOR`, `FormsModule`) + Ionic wrappers, with `.ui-field` label+`ion-item`:

- `app-ui-input` (`UiInputComponent`): `label/placeholder/type/icon/autocomplete/inputmode/maxlength/togglePassword`, password eye toggle.
- `app-ui-textarea` (`UiTextareaComponent`)
- `app-ui-select` / `app-ui-multi-select` (`UiSelectComponent`/`UiMultiSelectComponent`): `options: UiOption[]`, `iface: popover|alert|action-sheet`, multi variant `multiple:true`.
- `app-ui-datepicker` (`UiDatepickerComponent`): `type=date`
- `app-ui-number` (`UiNumberComponent`): `type=number`, `null` on empty.
- `app-ui-button` (`UiButtonComponent`): `expand fill color size disabled loading icon`, emits `pressed`, shows `ion-spinner` when `loading`.

Ion-item styling for inputs: `--background var(--ion-color-step-50)`, `border var(--ion-color-step-150)`, `radius var(--radius-md)` (see `global.scss .ui-field`).

### 7.2 Other Shared

- `EmptyStateComponent` (`app-empty-state`, `file-tray-outline`, `message: input.required<string>`)
- `ThemeToggleComponent` (`src/app/shared/components/theme-toggle.component.ts`)
- `AppSidebarComponent` (`app-sidebar`, inputs `open/activeView`, outputs `closed/viewChange/logoutClicked`, role cards admin/barber/customer, nav to `/barbershops`, `/barbers`, `/tabs/documents`, theme toggle, logout; backdrop + `transform translateX`)

### 7.3 Core Services

- **AuthService** (`core/services/auth.service.ts`): `user signal<User|null>` (from `localStorage.user`), `token signal<string|null>` (`access_token`), `isLoggedIn()`, `isAdmin()` (`admin|super_admin`), `isBarber()`, `persist()` (stores `access_token/refresh_token/user`), `register/login/refresh/logout/logoutAll/forgot/reset/changePassword/clear()` (clear wipes `localStorage`+`sessionStorage`). Keys `AT='access_token'`, `RT='refresh_token'`, `US='user'`. Base `${apiUrl}/auth`.
- **ApiService** (`core/services/api.service.ts`): facade over all `*Api` classes; exposes `barbershops/barbers/services/appointments/availability/educational/certificates/locations/notifications/uploads/admin/users` with same method names as underlying API (e.g. `appointments.slots`, `barbers.me`, `locations.myAddresses`).
- **ThemeService** — see 5.4.
- **ToastService** (`core/services/toast.service.ts`): `success/error/warning/info` → `ToastController.create({duration:2800, position:bottom, cssClass:'app-toast', buttons:[×]})`.
- **ViewRoleService** (`core/services/view-role.service.ts`): `activeView signal<ViewRole>` (`admin|barber|customer`, key `active_view`), computed `isAdmin/isBarber/isCustomer`, `load()` from localStorage else derived from `auth.user().role`, `setView(v)` persists.

### 7.4 Models (`core/models/index.ts`)

`Role`, `AppointmentStatus`, `User`, `UserPreferences`, `AuthResponse`, `Barbershop`, `BarberServiceLink`, `Barber`, `Service`, `Appointment`, `Slot/AvailabilitySlot/AvailabilityResponse`, `Educational`, `Certificate`, `Location`, `NotificationItem`, `Paginated<T>`, `NotificationPaginated`, `DashboardData`, `ReportsSummary`, `Setting`. All API responses typed via these.

### 7.5 Guards (`core/guards/auth.guard.ts`)

`authGuard` → `isLoggedIn? true : /login`; `guestGuard` → `isLoggedIn? /tabs/home : true`; `adminGuard` → `isAdmin? true : /tabs/home` (also checks logged-in); `barberGuard` → `isBarber||isAdmin? true : /tabs/home`.

### 7.6 Interceptors

- `authInterceptor`: reads `access_token` → `Authorization: Bearer`, on `401` (excluding `/auth/refresh|login|register`) tries single-flight refresh via `BehaviorSubject`, retries original request, else `clear()` + `/login`.
- `errorInterceptor`: skips logging for auth URLs/401, else `console.error('[API Error]', url, extractMessage|err)`.

### 7.7 Utilities

- `core/utils/error.ts`: `extractMessage(err, fallback=fa.errors.generic)` checks `error.message|msg`, array `message`, status `0→network/404→notFound/401→unauthorized/5xx→server`.
- `core/api/utils.ts`: `toParams(p?)→HttpParams` (skips empty), `unwrapArray<T>` (`data|items`), `unwrapPaginated`, `normalizeUpload`, `UploadResult`.
- `core/i18n/fa.ts`: `fa` const with `app/brand/nav/common/errors/toast/theme/auth/home/barbershops/barbers/services/turns/appointments/notifications/admin/barberDetail/barberManage/profile`. Single source for all Persian copy — add new strings here, never inline.
- `core/errors/global-error.handler.ts`: logs `[GlobalError]` + `extractMessage`.

## 8. Frontend Business Logic & Data Flow

- **Home** (`HomePage`): `computed isAdmin/isBarber` from `ViewRoleService`. Loads `admin.dashboard()` when admin, `barbers.list()` + `appointments.list()` for all. Derives `displayName`, `todayCount/completed/revenueFa/weekly/queue/nextAppt*`. Handles image fallback `i.pravatar.cc` + empty states.
- **Booking** (`BookingPage`): dual mode. `?barberId|serviceId|startTime|time` → reserve-confirm mode (`isReserveMode`) with `reserveService/reserveBarber`, `checkSlot()` via `appointments.slots({barberId,date,serviceId})`, `slotUnavailableReason` (holiday/not_working_day/no_working_hours/booked), `confirmReserve()` creates `appointments.create({barberId,serviceId,date,startTime,endTime,notes})`. Otherwise list mode: `statusFilter` → `appointments.list` or `admin.adminAppointments`, + barber schedule toggle (only for barbers): `barbers.me()` → `workingDays/workingHours/breakTime` days editor + `barbers.update(id,payload)`. Handles `confirm/reject/complete/cancel/remove/startEdit/saveEdit`.
- **Auth flow:** `AuthLayout` → `Login/Register/Forgot/Reset` pages call `AuthService.*` then `persist()`. `guestGuard` prevents authed access. Token refresh transparent via interceptor.
- **Notifications:** `unread()` polled in `AppLayout`/`TabsPage` for `bell-dot`; `NotificationsPage` → `list/readOne/readAll`.
- **Addresses:** `AddressesPage` + `LocationsApi` (`myAddresses/byBarber`) with Leaflet map; CRUD via `ApiService.locations`.
- **Barber detail/manage:** `BarberDetailPage` shows services/availability/education/certificates/location; `BarberManagePage` handles education (`FormData` video upload), certificates, location create/update.
- **Services/Admin:** admin routes use `AdminApi` (dashboard/users/services/appointments/settings/reports) vs customer/barber uses plain `*Api`.

Data flow: Component `signal` state → `ApiService` → `HttpClient` (+ interceptors) → `environment.apiUrl` → signals updated in `subscribe next/error` → template `@if/@for` with `loading/error/empty` states. Unwrapping helpers handle `{data}` vs `T[]` shapes.

## 9. API Integration & Auth

- Base `environment.apiUrl` (`http://localhost:3000`). Change in both `environment.ts` + `environment.prod.ts`.
- Auth header `Authorization: Bearer <access_token>` added per-request.
- Refresh: `POST /auth/refresh {refresh_token}` → new `AuthResponse`. On failure → `clear()` + redirect `/login`.
- Logout: `POST /auth/logout {refresh_token}` (empty-string fallback), `POST /auth/logout-all`.
- Password: `POST /auth/forgot-password {email|username}` → `{reset_token|message}`, `POST /auth/reset-password {token,password}`, `POST /auth/change-password {newPassword,confirmPassword}`.
- Preferences: `GET /users/me/preferences`, `PATCH /users/me/preferences {themePreference}`.
- API pathing per domain class (e.g. `/barbers`, `/barbers/me`, `/barbers/me/avatar`, `/barbers/:id/avatar`, `/appointments/available-slots`, `/availability`, `/educational`, `/certificates`, `/locations`, `/notifications`, `/uploads`, `/admin/*`, `/users/me`).
- Always use `ApiService` facade; inject `HttpClient` only in `*Api` or `ThemeService`. Use `toParams` for query strings.

## 10. Coding Conventions & Naming

- **Selectors:** `prefix app`, `kebab-case` for elements, `camelCase` for attributes. Components `*Page` / `*Component` suffix enforced by ESLint (`@angular-eslint/component-class-suffix`).
- **Files:** Pages `*.page.ts` (each page owns inline `template` + `styles`), shared `*.component.ts`, services `*.service.ts`, APIs `*.api.ts`, guards `*.guard.ts`, interceptors `*.interceptor.ts`. Exception `tabs.page.ts`/`tabs.routes.ts`.
- **Standalone imports:** list Ionic + Angular + shared imports explicitly per component; never rely on shared module.
- **Naming:** `signal` fields `camelCase` (`loading`, `errorMsg`), computed `is*`/`displayName`, handlers `on*`/`load/save/toggle`. API methods `list/get/create/update/remove` (+ domain extras `me/updateMe/uploadAvatar/readAll`). `fa` keys `camelCase`.
- **Style:** `SCSS` inline in component `styles: [...]`; global tokens only in `global.scss`/`variables.scss`. No `::ng-deep` except `.app-outlet ion-content` bottom padding in `AppLayout`.
- **Types:** import from `core/models`; `AppointmentStatus`, `Role`, `ViewRole` as union types.
- **Error strings:** never hardcode Persian — use `fa.*` or `extractMessage` fallback. Toasts via `ToastService`, not raw `ToastController`.
- **Lint:** `npm run lint` (`ng lint` over `src/**/*.ts,html`). Fix before commit.

## 11. Existing Implementation Patterns (must follow)

- Pages: `standalone, inject(ApiService/AuthService/ViewRoleService/ToastService), signal state, ngOnInit load(), template @if(loading)/@else if(error)/@else if(!items.length)/@else grid, dir="rtl", page-wrap` wrapper, inline `styles` using CSS vars. Example `HomePage`, `BookingPage`.
- Lists: `unwrapArray` / `Array.isArray(v)?v:v.data` pattern; `loading.set(true)` before call, `loading.set(false)` in both next/error.
- Icons: `constructor(){ addIcons({...}) }` per component, then `<ion-icon name="...">`.
- Navigation: `routerLink` / `router.navigateByUrl('/tabs/...')`, `RouterLinkActive` in topbar/tabs.
- Forms: `FormsModule` + `[(ngModel)]` for simple pages; `ControlValueAccessor` wrappers (`app-ui-*`) for reusable fields; validate via `fa.auth.*` messages + `ToastService.warning`.
- Theme: no direct `localStorage` for theme outside `ThemeService`; call `theme.toggle()` / `theme.isDark()`.
- View role: never read `localStorage active_view` directly — use `ViewRoleService.activeView()` / `setView()`.
- Uploads: `FormData` for avatars/educational video (`barbers.uploadMyAvatar`, `educational.create(fd)`).
- Safe areas: always `env(safe-area-inset-*)` in topbar/footer/page-wrap.

## 12. Rules for AI / Contributors

1. Read this file + `src/app/core/i18n/fa.ts` + `src/global.scss` + `src/app/app.routes.ts` before coding.
2. Use `ApiService` facade, not direct `HttpClient` in pages.
3. Add new Persian strings to `fa.ts`; reuse `extractMessage` + `ToastService`.
4. Keep RTL: `dir="rtl"` on wrappers, mirror directional icons, keep LTR only for phone/email/date inputs.
5. Follow design tokens — no hardcoded colors/radii; use `var(--card-bg)` etc. Dark is default.
6. Standalone + lazy + signals + `inject()` — no NgModules, no constructor DI for services.
7. Extend `Ui*` components rather than duplicating `ion-item/ion-input` patterns.
8. Run `npm run lint` (and `npm run build` if touching routing/env) before finishing.
9. After major arch/design-system/frontend-logic change, update this `AI.md`.

## 13. Common Commands

```bash
npm start          # ng serve (dev)
npm run build      # ng build (prod, fileReplacements environment.prod.ts, output www/)
npm run watch      # ng build --watch --configuration development
npm run lint       # ng lint (angular-eslint)
npm test           # ng test (vitest, tsconfig.spec.json)
```

## 14. Update Log

- 2026-09-24 — Initial `AI.md` from codebase scan (Angular 22 + Ionic 9, RTL Vazirmatn, signals, ViewRole, Theme, booking reserve flow, Leaflet).


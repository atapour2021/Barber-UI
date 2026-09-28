import { bootstrapApplication } from '@angular/platform-browser';
import {
  ActivatedRouteSnapshot,
  DetachedRouteHandle,
  RouteReuseStrategy,
  provideRouter,
  withComponentInputBinding,
  withPreloading,
  PreloadAllModules,
  withRouterConfig,
} from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { ErrorHandler, Injectable } from '@angular/core';
import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';
import { authInterceptor } from './app/core/interceptors/auth.interceptor';
import { errorInterceptor } from './app/core/interceptors/error.interceptor';
import { GlobalErrorHandler } from './app/core/errors/global-error.handler';

@Injectable()
class NoCacheIonicRouteStrategy extends IonicRouteStrategy {
  override shouldDetach(_route: ActivatedRouteSnapshot): boolean {
    return false;
  }
  override store(_route: ActivatedRouteSnapshot, _handle: DetachedRouteHandle | null): void {}
  override shouldAttach(_route: ActivatedRouteSnapshot): boolean {
    return false;
  }
  override retrieve(_route: ActivatedRouteSnapshot): DetachedRouteHandle | null {
    return null;
  }
  override shouldReuseRoute(_future: ActivatedRouteSnapshot, _curr: ActivatedRouteSnapshot): boolean {
    return false;
  }
}

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: NoCacheIonicRouteStrategy },
    { provide: ErrorHandler, useClass: GlobalErrorHandler },
    provideIonicAngular(),
    provideHttpClient(withInterceptors([authInterceptor, errorInterceptor])),
    provideRouter(
      routes,
      withPreloading(PreloadAllModules),
      withComponentInputBinding(),
      withRouterConfig({ onSameUrlNavigation: 'reload' }),
    ),
  ],
});

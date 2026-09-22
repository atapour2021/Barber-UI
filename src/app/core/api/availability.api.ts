import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { AvailabilityResponse } from '../models';
import { toParams } from './utils';

@Injectable({ providedIn: 'root' })
export class AvailabilityApi {
  private http = inject(HttpClient);
  private b = environment.apiUrl;
  get(params: Record<string, string>) {
    return this.http.get<AvailabilityResponse>(`${this.b}/availability`, { params: toParams(params) });
  }
}

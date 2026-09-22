import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Educational } from '../models';
import { toParams } from './utils';

@Injectable({ providedIn: 'root' })
export class EducationalApi {
  private http = inject(HttpClient);
  private b = environment.apiUrl;
  list(params?: Record<string, unknown>) {
    return this.http.get<Educational[]>(`${this.b}/educational`, { params: toParams(params) });
  }
  get(id: string) {
    return this.http.get<Educational>(`${this.b}/educational/${id}`);
  }
  create(fd: FormData) {
    return this.http.post<Educational>(`${this.b}/educational`, fd);
  }
  update(id: string, fd: FormData) {
    return this.http.patch<Educational>(`${this.b}/educational/${id}`, fd);
  }
  video(id: string, fd: FormData) {
    return this.http.post<Educational>(`${this.b}/educational/${id}/video`, fd);
  }
  remove(id: string) {
    return this.http.delete(`${this.b}/educational/${id}`);
  }
}

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { normalizeUpload, UploadResult } from './utils';

@Injectable({ providedIn: 'root' })
export class UploadsApi {
  private http = inject(HttpClient);
  private b = environment.apiUrl;
  upload(fd: FormData) {
    return this.http
      .post<Record<string, unknown>>(`${this.b}/uploads`, fd)
      .pipe(map((r) => normalizeUpload(r) as UploadResult));
  }
}

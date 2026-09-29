import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface AiAdvisorResponse {
  analysis: {
    faceShape: string;
    faceShapeConfidence: number;
    hairCharacteristics: Record<string, string>;
    detectedFeatures: string[];
    confidence: number;
  };
  recommendations: Array<{
    id: string;
    title: string;
    titleFa: string;
    category: string;
    length: string;
    description: string;
    descriptionFa: string;
    reason: string;
    reasonFa: string;
    stylingTips: string[];
    stylingTipsFa: string[];
    confidence: number;
    suitableFaceShapes: string[];
    maintenance: string;
    tags: string[];
  }>;
  matchedServices: Array<{ id: string; name: string; price: number; duration: number }>;
  meta: { provider: string; model: string };
}

@Injectable({ providedIn: 'root' })
export class AiApi {
  private http = inject(HttpClient);
  private b = environment.apiUrl;
  recommend(fd: FormData) {
    return this.http.post<AiAdvisorResponse>(`${this.b}/ai/hair-style/recommend`, fd);
  }
  preview(fd: FormData) {
    return this.http.post<{ previewImage: string | null; note?: string; mime?: string; url?: string }>(`${this.b}/ai/hair-style/preview`, fd);
  }
}

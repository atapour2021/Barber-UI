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

export interface AiServiceRecommendation {
  serviceId: string;
  reason: string;
  reasonFa: string;
  confidence: number;
  service: { id: string; name: string; description?: string | null; price: number; duration: number; icon?: string | null; barberId: string; barbershopId?: string | null };
}

export interface AiServiceRecommendResponse {
  recommendations: AiServiceRecommendation[];
  meta: { provider: string; model: string };
}

export interface CustomerProfileResponse {
  summary: string; summaryFa: string; personaFa: string; insights: string[]; insightsFa: string[];
  preferencesFa: string;
  recommendations: Array<{ title: string; titleFa: string; reason: string; reasonFa: string; serviceId?: string; confidence: number; tags?: string[] }>;
  meta: { provider: string; model: string };
  customer: { id: string; name: string; family: string; username: string };
  stats: { totalAppointments: number; completed: number; cancelled: number; noShow: number; pending: number; confirmed: number; lastVisitAt: string | null; firstVisitAt: string | null; avgDaysBetween: number | null; favoriteServiceNames: string[]; favoriteBarberName: string | null; preferredDayOfWeek: string | null; totalServices: number };
  recentAppointments: Array<{ date: string; serviceName: string; barberName: string; status: string }>;
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
  serviceRecommendations(body: { hairstyleId?: string; hairstyle?: Record<string, unknown>; barberId?: string; barbershopId?: string }) {
    return this.http.post<AiServiceRecommendResponse>(`${this.b}/ai/service-recommendations`, body);
  }
  customerProfile(customerId: string) {
    return this.http.get<CustomerProfileResponse>(`${this.b}/ai/customer-profile/${customerId}`);
  }
}

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { toParams } from './utils';

@Injectable({ providedIn: 'root' })
export class WalletApi {
  private http = inject(HttpClient);
  private b = environment.apiUrl;
  me() { return this.http.get<{ balance: number; currency: string; walletId: string; userId: string }>(`${this.b}/wallet/me`); }
  transactions(params?: Record<string, unknown>) { return this.http.get<unknown>(`${this.b}/wallet/transactions`, { params: toParams(params) }); }
  topup(amount: number, description?: string) { return this.http.post(`${this.b}/wallet/topup`, { amount, description }); }
  pay(amount: number, description?: string, referenceId?: string) { return this.http.post(`${this.b}/wallet/pay`, { amount, description, referenceId }); }
  withdraw(amount: number, description?: string) { return this.http.post(`${this.b}/wallet/withdraw`, { amount, description }); }
  adminStats() { return this.http.get(`${this.b}/wallet/admin/stats`); }
  adminWallets(params?: Record<string, unknown>) { return this.http.get<unknown>(`${this.b}/wallet/admin/wallets`, { params: toParams(params) }); }
  adminWallet(userId: string) { return this.http.get<unknown>(`${this.b}/wallet/admin/wallets/${userId}`); }
  adminTransactions(params?: Record<string, unknown>) { return this.http.get<unknown>(`${this.b}/wallet/admin/transactions`, { params: toParams(params) }); }
  adminTopup(userId: string, amount: number, description?: string) { return this.http.post(`${this.b}/wallet/admin/topup`, { userId, amount, description }); }
  adminAdjust(userId: string, amount: number, description?: string) { return this.http.post(`${this.b}/wallet/admin/adjust`, { userId, amount, description }); }
}

import { Component, computed, inject, signal, OnInit } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonSpinner, IonIcon, IonBadge } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { walletOutline, addOutline, cardOutline, arrowUpOutline, arrowDownOutline, refreshOutline, searchOutline } from 'ionicons/icons';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { fa } from '../../core/i18n/fa';
import { extractMessage } from '../../core/utils/error';
import { unwrapPaginated } from '../../core/api/utils';
import { EmptyStateComponent } from '../../shared/components/empty-state.component';
import { UiSelectComponent, UiOption } from '../../shared/ui/ui';

@Component({
  selector: 'app-wallet',
  standalone: true,
  imports: [FormsModule, DecimalPipe, IonContent, IonSpinner, IonIcon, IonBadge, EmptyStateComponent, UiSelectComponent],
  template: `
    <ion-content [fullscreen]="true">
      <div class="page-wrap" dir="rtl">
        <div class="section-head"><h3>{{ tWallet.title }}</h3></div>

        <div class="dark-card wallet-balance">
          <div class="wb-head"><ion-icon name="wallet-outline"></ion-icon><span>{{ tWallet.balance }}</span></div>
          <b class="wb-amount">{{ balanceFa() }} <small>{{ tWallet.currency }}</small></b>
          @if (isAdminView()) {
            <div class="wb-stats">
              <span>{{ tWallet.walletsCount }}: {{ stats()?.walletsCount ?? '-' }}</span>
              <span>{{ tWallet.totalBalance }}: {{ statsTotalFa() }}</span>
            </div>
          }
        </div>

        @if (!isAdminView()) {
          <div class="dark-card" style="display:flex;flex-direction:column;gap:10px">
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
              <div style="display:flex;flex-direction:column;gap:6px">
                <label class="muted" style="font-size:11px">{{ tWallet.amount }}</label>
                <input type="number" [(ngModel)]="amount" placeholder="50000" style="background:var(--card-bg);border:1px solid var(--card-border);border-radius:8px;padding:10px;color:var(--text-primary);font-size:13px;width:100%;box-sizing:border-box" />
              </div>
              <div style="display:flex;flex-direction:column;gap:6px">
                <label class="muted" style="font-size:11px">{{ tWallet.description }}</label>
                <input [(ngModel)]="desc" [placeholder]="tWallet.descriptionPlaceholder" style="background:var(--card-bg);border:1px solid var(--card-border);border-radius:8px;padding:10px;color:var(--text-primary);font-size:13px;width:100%;box-sizing:border-box" />
              </div>
            </div>
            <div style="display:flex;gap:8px;flex-wrap:wrap">
              <button type="button" (click)="topup()" [disabled]="busy()" class="wb-btn primary"><ion-icon name="add-outline"></ion-icon> {{ tWallet.topup }}</button>
              <button type="button" (click)="pay()" [disabled]="busy()" class="wb-btn"><ion-icon name="card-outline"></ion-icon> {{ tWallet.pay }}</button>
              <button type="button" (click)="withdraw()" [disabled]="busy()" class="wb-btn outline"><ion-icon name="arrow-up-outline"></ion-icon> {{ tWallet.withdraw }}</button>
            </div>
            @if (busy()) { <div style="text-align:center"><ion-spinner></ion-spinner></div> }
          </div>
        }

        @if (isAdminView()) {
          <div class="dark-card" style="display:flex;flex-direction:column;gap:10px">
            <b style="font-size:12px;color:var(--text-primary)">{{ tWallet.adminTopup }} / {{ tWallet.adminAdjust }}</b>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
              <div style="grid-column:1/-1">
                <app-ui-select [label]="tWallet.selectUser" [placeholder]="tWallet.selectUser" [options]="userOptions()" [(ngModel)]="adminUserId" />
                @if (userOptionsLoading()) { <small class="muted" style="font-size:11px">{{ common.loading }}</small> }
              </div>
              <input type="number" [(ngModel)]="adminAmount" placeholder="10000" style="background:var(--card-bg);border:1px solid var(--card-border);border-radius:8px;padding:10px;color:var(--text-primary);font-size:12px" />
              <input [(ngModel)]="adminDesc" [placeholder]="tWallet.descriptionPlaceholder" style="background:var(--card-bg);border:1px solid var(--card-border);border-radius:8px;padding:10px;color:var(--text-primary);font-size:12px" />
            </div>
            <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
              <input [(ngModel)]="userSearch" (ngModelChange)="onUserSearch($event)" [placeholder]="common.search" style="flex:1;min-width:140px;background:var(--card-bg);border:1px solid var(--card-border);border-radius:8px;padding:10px;color:var(--text-primary);font-size:12px" />
              <button type="button" (click)="loadUserOptions()" class="wb-btn" style="padding:8px 12px"><ion-icon name="refresh-outline"></ion-icon></button>
              <button type="button" (click)="adminTopup()" [disabled]="busy()" class="wb-btn primary">{{ tWallet.adminTopup }}</button>
              <button type="button" (click)="adminAdjust()" [disabled]="busy()" class="wb-btn">{{ tWallet.adminAdjust }}</button>
            </div>
          </div>

          <div class="dark-card" style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
            <input [(ngModel)]="adminSearch" [placeholder]="tWallet.adminWallets" style="flex:1;min-width:160px;background:var(--card-bg);border:1px solid var(--card-border);border-radius:8px;padding:10px;color:var(--text-primary);font-size:12px" />
            <button type="button" (click)="loadAdminWallets()" class="wb-btn primary" style="padding:8px 12px"><ion-icon name="search-outline"></ion-icon></button>
            <button type="button" (click)="loadAdminStats()" class="wb-btn" style="padding:8px 12px"><ion-icon name="refresh-outline"></ion-icon></button>
          </div>
          @if (adminWallets().length) {
            <div style="display:flex;flex-direction:column;gap:8px">
              @for (w of adminWallets(); track w.id) {
                <div class="dark-card" style="display:flex;justify-content:space-between;align-items:center;gap:10px;padding:12px">
                  <div style="min-width:0">
                    <b style="font-size:12px;color:var(--text-primary)">{{ w.user?.username ?? w.userId.slice(0,8) }}</b>
                    <p class="muted" style="margin:2px 0 0;font-size:11px">{{ w.user?.name ?? '' }} {{ w.user?.family ?? '' }} · {{ w.balance | number }} {{ tWallet.currency }}</p>
                  </div>
                  <ion-badge color="success" style="font-size:10px">{{ w.balance }}</ion-badge>
                </div>
              }
            </div>
          }
        }

        <div class="dark-card" style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
          <select [(ngModel)]="filterType" (ngModelChange)="loadTx()" style="background:var(--card-bg);border:1px solid var(--card-border);border-radius:8px;padding:8px;color:var(--text-primary);font-size:12px;flex:1;min-width:120px">
            <option value="">{{ tWallet.all }}</option>
            <option value="topup">{{ tWallet.typeTopup }}</option>
            <option value="payment">{{ tWallet.typePayment }}</option>
            <option value="payout">{{ tWallet.typePayout }}</option>
            <option value="adjustment">{{ tWallet.typeAdjustment }}</option>
            <option value="credit">{{ tWallet.typeTopup }}</option>
          </select>
          <button type="button" (click)="loadTx()" class="wb-btn" style="padding:8px 12px"><ion-icon name="refresh-outline"></ion-icon></button>
        </div>

        @if (loadingTx()) { <div class="dark-card" style="text-align:center;padding:16px"><ion-spinner></ion-spinner></div> }
        @else if (!txs().length) { <app-empty-state [message]="tWallet.empty" /> }
        @else {
          <div style="display:flex;flex-direction:column;gap:8px">
            @for (tx of txs(); track tx.id) {
              <div class="dark-card" style="display:flex;justify-content:space-between;align-items:center;gap:10px;padding:12px">
                <div style="display:flex;align-items:center;gap:10px;min-width:0">
                  <span class="tx-icon" [class.in]="tx.amount>0" [class.out]="tx.amount<0">
                    @if (tx.amount>0) { <ion-icon name="arrow-down-outline"></ion-icon> } @else { <ion-icon name="arrow-up-outline"></ion-icon> }
                  </span>
                  <div style="min-width:0">
                    <b style="font-size:12px;color:var(--text-primary)">{{ labelFor(tx.type) }} <small class="muted">· {{ tx.amount > 0 ? '+' : '' }}{{ tx.amount }}</small></b>
                    <p class="muted" style="margin:2px 0 0;font-size:11px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">{{ tx.description ?? '-' }} · {{ tx.createdAt.slice(0,16).replace('T',' ') }}</p>
                  </div>
                </div>
                <small class="muted" style="font-size:11px;flex-shrink:0">{{ tx.balanceAfter }} {{ tWallet.currency }}</small>
              </div>
            }
          </div>
        }
      </div>
    </ion-content>
  `,
  styles: [`
    .wallet-balance { text-align:center; padding:18px 14px; display:flex; flex-direction:column; align-items:center; gap:8px; }
    .wb-head { display:inline-flex; align-items:center; gap:6px; font-size:11px; color:var(--text-secondary); font-weight:700; }
    .wb-head ion-icon { font-size:16px; color:var(--accent); }
    .wb-amount { font-size:22px; font-weight:800; color:var(--text-primary); }
    .wb-amount small { font-size:11px; color:var(--text-secondary); font-weight:600; }
    .wb-stats { display:flex; gap:12px; font-size:11px; color:var(--text-secondary); flex-wrap:wrap; justify-content:center; }
    .wb-btn { display:inline-flex; align-items:center; gap:6px; padding:10px 14px; border-radius:10px; border:1px solid var(--card-border); background:var(--card-bg-2); color:var(--text-primary); font-size:12px; font-weight:700; cursor:pointer; font-family:inherit; }
    .wb-btn.primary { background:var(--accent); border-color:var(--accent); color:var(--accent-contrast); }
    .wb-btn.outline { background:transparent; }
    .wb-btn:disabled { opacity:0.6; cursor:default; }
    .tx-icon { width:32px; height:32px; border-radius:10px; display:inline-flex; align-items:center; justify-content:center; font-size:14px; flex-shrink:0; background:var(--card-bg-2); color:var(--text-secondary); }
    .tx-icon.in { background:rgba(34,197,94,0.15); color:#22c55e; }
    .tx-icon.out { background:rgba(239,68,68,0.12); color:#ef4444; }
  `],
})
export class WalletPage implements OnInit {
  private api = inject(ApiService);
  private auth = inject(AuthService);
  private toast = inject(ToastService);
  tWallet = fa.wallet;
  common = fa.common;
  isAdminView = computed(() => (this.auth.user()?.role ?? '').toLowerCase() === 'admin' || (this.auth.user()?.role ?? '').toLowerCase() === 'super_admin');
  balance = signal(0);
  balanceFa = computed(() => this.toFa(this.balance().toLocaleString('en-US')));
  stats = signal<any>(null);
  statsTotalFa = computed(() => this.toFa((this.stats()?.totalBalance ?? 0).toLocaleString('en-US')));
  txs = signal<any[]>([]);
  loadingTx = signal(false);
  busy = signal(false);
  amount: number | null = null;
  desc = '';
  filterType = '';
  adminUserId = '';
  adminAmount: number | null = null;
  adminDesc = '';
  adminSearch = '';
  adminWallets = signal<any[]>([]);
  userOptions = signal<UiOption[]>([]);
  userOptionsLoading = signal(false);
  userSearch = '';
  private userSearchTimer: ReturnType<typeof setTimeout> | null = null;
  constructor() { addIcons({ walletOutline, addOutline, cardOutline, arrowUpOutline, arrowDownOutline, refreshOutline, searchOutline }); }
  ngOnInit() { this.loadMe(); this.loadTx(); if (this.isAdminView()) { this.loadAdminStats(); this.loadAdminWallets(); this.loadUserOptions(); } }
  loadUserOptions() {
    this.userOptionsLoading.set(true);
    const p: Record<string, unknown> = { page: 1, limit: 50 };
    if (this.userSearch.trim()) p['search'] = this.userSearch.trim();
    this.api.admin.users(p).subscribe({
      next: (v) => {
        const pg = unwrapPaginated<any>(v);
        const opts: UiOption[] = pg.data.map((u: any) => ({ value: u.id, label: `${u.username} — ${u.name ?? ''} ${u.family ?? ''}`.trim() }));
        this.userOptions.set(opts);
        this.userOptionsLoading.set(false);
      },
      error: () => this.userOptionsLoading.set(false),
    });
  }
  onUserSearch(v: string) {
    this.userSearch = v;
    if (this.userSearchTimer) clearTimeout(this.userSearchTimer);
    this.userSearchTimer = setTimeout(() => this.loadUserOptions(), 350);
  }
  loadMe() { this.api.wallet.me().subscribe({ next: (v: any) => this.balance.set(Number(v?.balance ?? 0)), error: () => {} }); }
  loadTx() {
    this.loadingTx.set(true);
    const p: Record<string, unknown> = { page: 1, limit: 20 };
    if (this.filterType) p['type'] = this.filterType;
    const obs = this.isAdminView() ? this.api.wallet.adminTransactions(p) : this.api.wallet.transactions(p);
    obs.subscribe({ next: (v) => { const pg = unwrapPaginated<any>(v); this.txs.set(pg.data); this.loadingTx.set(false); }, error: (e) => { this.loadingTx.set(false); } });
  }
  topup() {
    if (!this.amount || this.amount < 1000) { this.toast.warning(fa.wallet.minAmount); return; }
    this.busy.set(true);
    this.api.wallet.topup(this.amount!, this.desc || undefined).subscribe({
      next: () => { this.toast.success(fa.wallet.topupSuccess); this.busy.set(false); this.amount = null; this.desc=''; this.loadMe(); this.loadTx(); },
      error: (e) => { this.toast.error(extractMessage(e, fa.common.failed)); this.busy.set(false); },
    });
  }
  pay() {
    if (!this.amount || this.amount < 1000) { this.toast.warning(fa.wallet.minAmount); return; }
    this.busy.set(true);
    this.api.wallet.pay(this.amount!, this.desc || undefined).subscribe({
      next: () => { this.toast.success(fa.wallet.paySuccess); this.busy.set(false); this.amount = null; this.desc=''; this.loadMe(); this.loadTx(); },
      error: (e) => { const m = extractMessage(e, fa.common.failed); this.toast.error(m.includes('Insufficient') ? fa.wallet.insufficient : m); this.busy.set(false); },
    });
  }
  withdraw() {
    if (!this.amount || this.amount < 1000) { this.toast.warning(fa.wallet.minAmount); return; }
    this.busy.set(true);
    this.api.wallet.withdraw(this.amount!, this.desc || undefined).subscribe({
      next: () => { this.toast.success(fa.wallet.withdrawSuccess); this.busy.set(false); this.amount = null; this.desc=''; this.loadMe(); this.loadTx(); },
      error: (e) => { const m = extractMessage(e, fa.common.failed); this.toast.error(m.includes('Insufficient') ? fa.wallet.insufficient : m); this.busy.set(false); },
    });
  }
  adminTopup() {
    if (!this.adminUserId.trim() || !this.adminAmount || this.adminAmount <= 0) { this.toast.warning(fa.common.required); return; }
    this.busy.set(true);
    this.api.wallet.adminTopup(this.adminUserId.trim(), this.adminAmount!, this.adminDesc || undefined).subscribe({
      next: () => { this.toast.success(fa.wallet.topupSuccess); this.busy.set(false); this.loadMe(); this.loadTx(); this.loadAdminWallets(); },
      error: (e) => { this.toast.error(extractMessage(e, fa.common.failed)); this.busy.set(false); },
    });
  }
  adminAdjust() {
    if (!this.adminUserId.trim() || this.adminAmount === null || this.adminAmount === undefined) { this.toast.warning(fa.common.required); return; }
    this.busy.set(true);
    this.api.wallet.adminAdjust(this.adminUserId.trim(), this.adminAmount!, this.adminDesc || undefined).subscribe({
      next: () => { this.toast.success(fa.common.success); this.busy.set(false); this.loadTx(); this.loadAdminWallets(); },
      error: (e) => { this.toast.error(extractMessage(e, fa.common.failed)); this.busy.set(false); },
    });
  }
  loadAdminStats() { this.api.wallet.adminStats().subscribe({ next: (v) => this.stats.set(v), error: () => {} }); }
  loadAdminWallets() {
    const p: Record<string, unknown> = { page: 1, limit: 10 };
    if (this.adminSearch.trim()) p['search'] = this.adminSearch.trim();
    this.api.wallet.adminWallets(p).subscribe({ next: (v) => { const pg = unwrapPaginated<any>(v); this.adminWallets.set(pg.data); }, error: () => {} });
  }
  labelFor(t: string) {
    const m: Record<string,string> = { topup: fa.wallet.typeTopup, payment: fa.wallet.typePayment, payout: fa.wallet.typePayout, refund: fa.wallet.typeRefund, adjustment: fa.wallet.typeAdjustment, credit: fa.wallet.typeTopup, debit: fa.wallet.typePayment };
    return m[t] ?? t;
  }
  private toFa(s: string) { return s.replace(/[0-9]/g, (d: string) => ['۰','۱','۲','۳','۴','۵','۶','۷','۸','۹'][Number(d)]); }
}

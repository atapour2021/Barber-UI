import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { IonIcon, IonSpinner } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { chatbubbleEllipsesOutline, closeOutline, sendOutline } from 'ionicons/icons';
import type { ChatLink } from '../../../core/api/chatbot.api';
import { ApiService } from '../../../core/services/api.service';
import { ViewRoleService } from '../../../core/services/view-role.service';
import { ChatbotUiService } from '../../../core/services/chatbot-ui.service';

interface Msg { from: 'user' | 'bot'; text: string; links?: ChatLink[]; suggestions?: string[]; }

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [FormsModule, RouterLink, IonIcon, IonSpinner],
  template: `
    <button class="chat-fab" type="button" (click)="toggle()" [attr.aria-label]="open() ? 'بستن راهنما' : 'راهنمای نیوباربر'">
      <ion-icon [name]="open() ? 'close-outline' : 'chatbubble-ellipses-outline'"></ion-icon>
    </button>
    @if (open()) {
      <div class="chat-panel" dir="rtl" (click)="$event.stopPropagation()">
        <div class="chat-head"><b>راهنمای نیوباربر</b><small>{{ roleLabel() }}</small><button type="button" class="chat-close" (click)="toggle()"><ion-icon name="close-outline"></ion-icon></button></div>
        <div class="chat-body">
          @for (m of messages(); track $index) {
            <div class="msg" [class.user]="m.from === 'user'" [class.bot]="m.from === 'bot'">{{ m.text }}
              @if (m.links?.length) {
                <div class="links">@for (l of m.links; track l.url) { <a [routerLink]="l.url" (click)="ui.set(false)">{{ l.label }}</a> } </div>
              }
              @if (m.suggestions?.length) {
                <div class="sugs">@for (s of m.suggestions; track s) { <button type="button" (click)="send(s)">{{ s }}</button> } </div>
              }
            </div>
          }
          @if (loading()) { <div class="msg bot"><ion-spinner name="crescent"></ion-spinner></div> }
        </div>
        @if (!messages().length) {
          <div class="faqs">@for (q of faqs(); track q) { <button type="button" (click)="send(q)">{{ q }}</button> } </div>
        }
        <div class="chat-input">
          <input [(ngModel)]="draft" (keyup.enter)="send()" placeholder="سوالت را بنویس..." maxlength="1000" />
          <button type="button" (click)="send()" [disabled]="loading() || !draft.trim()"><ion-icon name="send-outline"></ion-icon></button>
        </div>
      </div>
      <div class="chat-backdrop" (click)="ui.set(false)"></div>
    }
  `,
  styles: [`
    :host { position: fixed; bottom: 84px; left: 14px; z-index: 10000; }
    .chat-fab { width: 52px; height: 52px; border-radius: 999px; border: none; cursor: pointer; background: var(--accent); color: #0b101e; font-size: 24px; display: inline-flex; align-items: center; justify-content: center; box-shadow: 0 6px 20px rgba(0,0,0,.3); }
    .chat-backdrop { position: fixed; inset: 0; z-index: -1; }
    .chat-panel { position: fixed; bottom: 146px; left: 14px; width: min(360px, calc(100vw - 28px)); max-height: min(520px, calc(100dvh - 160px)); display: flex; flex-direction: column; background: var(--card-bg); border: 1px solid var(--card-border); border-radius: 14px; overflow: hidden; box-shadow: 0 12px 40px rgba(0,0,0,.35); z-index: 1; }
    .chat-head { padding: 10px 12px; background: var(--accent); color: #0b101e; display: flex; align-items: center; gap: 8px; }
    .chat-head b { font-size: 13px; flex: 1; } .chat-head small { font-size: 10px; opacity: .85; }
    .chat-close { width: 28px; height: 28px; border: none; background: rgba(0,0,0,.12); border-radius: 8px; display: inline-flex; align-items: center; justify-content: center; cursor: pointer; font-size: 16px; }
    .chat-body { padding: 10px; display: flex; flex-direction: column; gap: 8px; overflow-y: auto; min-height: 120px; }
    .msg { font-size: 12px; line-height: 1.9; padding: 8px 10px; border-radius: 10px; white-space: pre-line; word-break: break-word; }
    .msg.user { background: var(--accent); color: #0b101e; align-self: flex-start; max-width: 88%; }
    .msg.bot { background: var(--ion-color-step-50); border: 1px solid var(--ion-color-step-150); color: var(--text-primary); align-self: stretch; }
    .links, .sugs, .faqs { display: flex; gap: 6px; flex-wrap: wrap; margin-top: 8px; }
    .links a { font-size: 11px; font-weight: 700; background: var(--accent); color: #0b101e; border-radius: 8px; padding: 5px 10px; text-decoration: none; }
    .sugs button, .faqs button { font-size: 11px; font-family: inherit; background: transparent; border: 1px solid var(--card-border-2); color: var(--text-primary); border-radius: 8px; padding: 5px 10px; cursor: pointer; }
    .faqs { padding: 0 10px 8px; }
    .chat-input { display: flex; gap: 8px; padding: 10px; border-top: 1px solid var(--card-border); }
    .chat-input input { flex: 1; background: var(--ion-color-step-50); border: 1px solid var(--ion-color-step-150); border-radius: 10px; padding: 9px 12px; color: var(--text-primary); font-family: inherit; font-size: 12px; outline: none; min-width: 0; }
    .chat-input button { width: 40px; border-radius: 10px; border: none; background: var(--accent); color: #0b101e; cursor: pointer; font-size: 16px; display: inline-flex; align-items: center; justify-content: center; }
    .chat-input button:disabled { opacity: .5; }
  `],
})
export class ChatbotWidget {
  private api = inject(ApiService);
  private views = inject(ViewRoleService);
  ui = inject(ChatbotUiService);
  open = this.ui.open;
  loading = signal(false);
  draft = '';
  messages = signal<Msg[]>([]);
  faqs = signal<string[]>([]);
  role = computed(() => this.views.activeView());
  roleLabel = computed(() => this.role() === 'barber' ? 'پنل آرایشگر' : this.role() === 'admin' ? 'پنل مدیریت' : 'پنل مشتری');
  constructor() { addIcons({ chatbubbleEllipsesOutline, closeOutline, sendOutline }); }
  toggle() {
    this.ui.toggle();
    if (this.open() && !this.faqs().length) this.api.chatbot.faqs(this.role()).subscribe({ next: (v) => this.faqs.set(v.items ?? []), error: () => {} });
  }
  send(text?: string) {
    const q = (text ?? this.draft).trim().slice(0, 1000);
    if (!q || this.loading()) return;
    this.draft = '';
    this.messages.update((a) => [...a, { from: 'user', text: q }]);
    const history = this.messages().slice(-8).map((m) => ({ role: m.from === 'user' ? 'user' : 'assistant', text: m.text }));
    this.loading.set(true);
    this.api.chatbot.ask(q, this.role(), history).subscribe({
      next: (r: any) => {
        const answer = r.reply ?? r.answer ?? '';
        const suggestions = r.suggestions ?? r.quickReplies ?? [];
        this.messages.update((a) => [...a, { from: 'bot', text: answer || 'پاسخی یافت نشد', links: r.links, suggestions }]);
        this.loading.set(false);
      },
      error: () => { this.messages.update((a) => [...a, { from: 'bot', text: 'خطا در ارتباط. دوباره تلاش کن.' }]); this.loading.set(false); },
    });
  }
}

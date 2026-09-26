import { Component, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonContent, IonCard, IonCardContent, IonList, IonLabel, IonButton, IonSpinner, IonSegment, IonSegmentButton, IonBadge, IonIcon } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { refreshOutline, trashOutline, addOutline, searchOutline, powerOutline, keyOutline, checkmarkCircleOutline, closeCircleOutline, pencilOutline, createOutline, closeOutline, checkmarkOutline } from 'ionicons/icons';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';
import { Appointment, Barber, Service, User } from '../../core/models';
import { fa } from '../../core/i18n/fa';
import { EmptyStateComponent } from '../../shared/components/empty-state.component';
import { UiInputComponent, UiButtonComponent } from '../../shared/ui/ui';
import { extractMessage } from '../../core/utils/error';
import { InfiniteScrollDirective } from '../../shared/directives/infinite-scroll.directive';
import { unwrapPaginated } from '../../core/api/utils';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [FormsModule, IonContent, IonCard, IonCardContent, IonList, IonLabel, IonButton, IonSpinner, IonSegment, IonSegmentButton, IonBadge, IonIcon, EmptyStateComponent, UiInputComponent, UiButtonComponent, InfiniteScrollDirective],
  template: `
    <ion-content [fullscreen]="true">
      <div class="page-wrap" dir="rtl">
        <div class="section-head"><h3>{{ t.title }}</h3></div>
        <ion-segment [value]="tab" (ionChange)="onTab($event)" style="width:100%;--background:var(--card-bg)" scrollable>
          <ion-segment-button value="dash">{{ t.dashboard }}</ion-segment-button>
          <ion-segment-button value="users">{{ t.users }}</ion-segment-button>
          <ion-segment-button value="barbers">{{ t.barbers }}</ion-segment-button>
          <ion-segment-button value="appointments">{{ t.appointments }}</ion-segment-button>
          <ion-segment-button value="settings">{{ t.settings }}</ion-segment-button>
        </ion-segment>

        @if (tab === 'dash') {
          @if (dashLoading()) { <div class="dark-card" style="text-align:center;padding:20px"><ion-spinner></ion-spinner><p class="muted">{{ c.loading }}</p></div> }
          @if (dash()) {
            <div class="grid-2" style="margin-top:12px">
              <ion-card class="stat-card"><ion-card-content><b style="color:var(--text-primary)">{{ dash()!.totalUsers }}</b><p class="muted">{{ t.totalUsers }}</p></ion-card-content></ion-card>
              <ion-card class="stat-card"><ion-card-content><b style="color:var(--text-primary)">{{ dash()!.totalBarbers }}</b><p class="muted">{{ t.totalBarbers }}</p></ion-card-content></ion-card>
              <ion-card class="stat-card"><ion-card-content><b style="color:var(--text-primary)">{{ dash()!.totalAppointments }}</b><p class="muted">{{ t.totalAppointments }}</p></ion-card-content></ion-card>
              <ion-card class="stat-card"><ion-card-content><b style="color:var(--text-primary)">{{ dash()!.totalBarbershops }}</b><p class="muted">{{ t.totalShops }}</p></ion-card-content></ion-card>
            </div>
          }
          <app-ui-button size="small" fill="outline" icon="refresh-outline" (pressed)="loadDash()">{{ t.refresh }}</app-ui-button>
        }

        @if (tab === 'users') {
          <div class="dark-card" style="margin-top:12px;display:flex;gap:8px;align-items:center;flex-wrap:wrap">
            <app-ui-input [label]="t.search" [(ngModel)]="uq.search" style="flex:1;min-width:140px" />
            <select [(ngModel)]="uq.role" style="background:var(--card-bg);border:1px solid var(--card-border);border-radius:8px;padding:8px;color:var(--text-primary);font-family:inherit;min-width:110px">
              <option value="">{{ t.roleAll }}</option>
              <option value="customer">customer</option>
              <option value="user">user</option>
              <option value="barber">barber</option>
              <option value="admin">admin</option>
              <option value="super_admin">super_admin</option>
            </select>
            <select [(ngModel)]="uq.isActive" style="background:var(--card-bg);border:1px solid var(--card-border);border-radius:8px;padding:8px;color:var(--text-primary);font-family:inherit;min-width:110px">
              <option value="">{{ t.statusAll }}</option>
              <option value="true">{{ t.active }}</option>
              <option value="false">{{ t.inactive }}</option>
            </select>
            <ion-button (click)="loadUsers()" style="--background:var(--accent);--color:var(--accent-contrast)"><ion-icon name="search-outline" slot="icon-only"></ion-icon></ion-button>
          </div>
          @if (usersLoading() && !users().length) { <div class="dark-card" style="text-align:center;padding:16px;margin-top:10px"><ion-spinner></ion-spinner></div> }
          @if (!usersLoading() && !usersLoadingMore() && !users().length) { <app-empty-state [message]="c.empty" /> }
          <ion-list lines="none" style="background:transparent;margin-top:8px;width:100%">
            @for (u of users(); track u.id) {
              <ion-card style="margin-bottom:8px">
                <ion-card-content style="display:flex;flex-direction:column;gap:10px">
                  <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px">
                    <ion-label style="min-width:0;flex:1"><h3 style="font-weight:800;color:var(--text-primary);font-size:13px">{{ u.username }} <span class="muted">({{ u.role }})</span></h3><p class="muted" style="font-size:11px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">{{ u.name }} {{ u.family }} · {{ u.phoneNumber }} @if(u.email){· {{ u.email }}}</p><p class="muted" style="font-size:11px"><ion-badge [color]="u.isActive ? 'success' : 'medium'" style="font-size:10px">{{ u.isActive ? t.active : t.inactive }}</ion-badge></p></ion-label>
                    <div style="display:flex;gap:4px;flex-shrink:0;flex-wrap:wrap">
                      <ion-button size="small" fill="outline" (click)="startUsernameEdit(u)" [disabled]="userBusy()===u.id"><ion-icon name="pencil-outline" slot="icon-only"></ion-icon></ion-button>
                      <ion-button size="small" [color]="u.isActive ? 'warning' : 'success'" fill="outline" (click)="toggleUser(u)" [disabled]="userBusy()===u.id"><ion-icon name="power-outline" slot="icon-only"></ion-icon></ion-button>
                      <ion-button size="small" fill="outline" (click)="startResetUser(u)" [disabled]="userBusy()===u.id"><ion-icon name="key-outline" slot="icon-only"></ion-icon></ion-button>
                      <ion-button size="small" fill="clear" color="danger" (click)="delUser(u.id)" [disabled]="userBusy()===u.id"><ion-icon name="trash-outline" slot="icon-only"></ion-icon></ion-button>
                    </div>
                  </div>
                  @if (usernameEditId()===u.id) {
                    <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;background:var(--card-bg);border:1px solid var(--card-border);border-radius:8px;padding:8px">
                      <input [(ngModel)]="usernameEditVal" placeholder="{{ t.usernamePlaceholder }}" style="flex:1;min-width:140px;background:var(--card-bg);border:1px solid var(--card-border);border-radius:8px;padding:8px;color:var(--text-primary);font-size:12px" />
                      <ion-button size="small" (click)="confirmUsername(u)" [disabled]="userBusy()===u.id" style="--background:var(--accent);--color:var(--accent-contrast)">{{ c.save }}</ion-button>
                      <ion-button size="small" fill="clear" (click)="usernameEditId.set(null)">{{ c.cancel }}</ion-button>
                    </div>
                  }
                  @if (resetUserId()===u.id) {
                    <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;background:var(--card-bg);border:1px solid var(--card-border);border-radius:8px;padding:8px">
                      <input [(ngModel)]="resetUserPwd" type="password" placeholder="{{ t.newPassword }} (≥6)" style="flex:1;min-width:140px;background:var(--card-bg);border:1px solid var(--card-border);border-radius:8px;padding:8px;color:var(--text-primary);font-size:12px" />
                      <ion-button size="small" (click)="confirmResetUser(u)" [disabled]="userBusy()===u.id" style="--background:var(--accent);--color:var(--accent-contrast)">{{ c.save }}</ion-button>
                      <ion-button size="small" fill="clear" (click)="resetUserId.set(null)">{{ c.cancel }}</ion-button>
                    </div>
                  }
                </ion-card-content>
              </ion-card>
            }
          </ion-list>
          @if (usersLoadingMore()) { <div style="text-align:center;padding:14px"><ion-spinner></ion-spinner></div> }
          @if (usersHasMore() && users().length) { <div appInfiniteScroll (scrolled)="loadMoreUsers()" [disabled]="usersLoading() || usersLoadingMore()" style="height:1px"></div> }
        }

        @if (tab === 'barbers') {
          <div class="dark-card" style="margin-top:12px;display:flex;gap:8px;align-items:center;flex-wrap:wrap">
            <app-ui-input [label]="t.search" [(ngModel)]="bq.search" style="flex:1;min-width:140px" />
            <select [(ngModel)]="bq.status" style="background:var(--card-bg);border:1px solid var(--card-border);border-radius:8px;padding:8px;color:var(--text-primary);font-family:inherit;min-width:110px">
              <option value="">{{ t.statusAll }}</option>
              <option value="active">{{ t.active }}</option>
              <option value="inactive">{{ t.inactive }}</option>
            </select>
            <select [(ngModel)]="bq.isActive" style="background:var(--card-bg);border:1px solid var(--card-border);border-radius:8px;padding:8px;color:var(--text-primary);font-family:inherit;min-width:110px">
              <option value="">{{ t.statusAll }}</option>
              <option value="true">{{ t.active }}</option>
              <option value="false">{{ t.inactive }}</option>
            </select>
            <ion-button (click)="loadBarbers()" style="--background:var(--accent);--color:var(--accent-contrast)"><ion-icon name="search-outline" slot="icon-only"></ion-icon></ion-button>
          </div>
          @if (barbersLoading() && !barbers().length) { <div class="dark-card" style="text-align:center;padding:16px;margin-top:10px"><ion-spinner></ion-spinner></div> }
          @if (!barbersLoading() && !barbersLoadingMore() && !barbers().length) { <app-empty-state [message]="c.empty" /> }
          <ion-list lines="none" style="background:transparent;margin-top:8px;width:100%">
            @for (b of barbers(); track b.id) {
              <ion-card style="margin-bottom:8px">
                <ion-card-content style="display:flex;flex-direction:column;gap:10px">
                  <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px">
                    <ion-label style="min-width:0;flex:1"><h3 style="font-weight:800;color:var(--text-primary);font-size:13px">{{ b.fullName }} <span class="muted">({{ b.status }})</span></h3><p class="muted" style="font-size:11px">{{ b.user?.username ?? b.userId.slice(0,8) }} · {{ b.barbershop?.name ?? b.barbershopId.slice(0,8) }}</p><p class="muted" style="font-size:11px"><ion-badge [color]="b.isActive ? 'success' : 'medium'" style="font-size:10px">{{ b.isActive ? t.active : t.inactive }}</ion-badge></p></ion-label>
                    <div style="display:flex;gap:4px;flex-shrink:0;flex-wrap:wrap">
                      <ion-button size="small" fill="outline" (click)="startBarberUsernameEdit(b)" [disabled]="barberBusy()===b.id || !b.userId"><ion-icon name="pencil-outline" slot="icon-only"></ion-icon></ion-button>
                      <ion-button size="small" [color]="b.isActive ? 'warning' : 'success'" fill="outline" (click)="toggleBarber(b)" [disabled]="barberBusy()===b.id"><ion-icon name="power-outline" slot="icon-only"></ion-icon></ion-button>
                      <ion-button size="small" fill="outline" (click)="startResetBarber(b)" [disabled]="barberBusy()===b.id"><ion-icon name="key-outline" slot="icon-only"></ion-icon></ion-button>
                      <ion-button size="small" fill="clear" color="danger" (click)="delBarber(b.id)" [disabled]="barberBusy()===b.id"><ion-icon name="trash-outline" slot="icon-only"></ion-icon></ion-button>
                    </div>
                  </div>
                  @if (barberUsernameEditId()===b.id) {
                    <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;background:var(--card-bg);border:1px solid var(--card-border);border-radius:8px;padding:8px">
                      <input [(ngModel)]="barberUsernameEditVal" placeholder="{{ t.usernamePlaceholder }}" style="flex:1;min-width:140px;background:var(--card-bg);border:1px solid var(--card-border);border-radius:8px;padding:8px;color:var(--text-primary);font-size:12px" />
                      <ion-button size="small" (click)="confirmBarberUsername(b)" [disabled]="barberBusy()===b.id" style="--background:var(--accent);--color:var(--accent-contrast)">{{ c.save }}</ion-button>
                      <ion-button size="small" fill="clear" (click)="barberUsernameEditId.set(null)">{{ c.cancel }}</ion-button>
                    </div>
                  }
                  @if (resetBarberId()===b.id) {
                    <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;background:var(--card-bg);border:1px solid var(--card-border);border-radius:8px;padding:8px">
                      <input [(ngModel)]="resetBarberPwd" type="password" placeholder="{{ t.newPassword }} (≥6)" style="flex:1;min-width:140px;background:var(--card-bg);border:1px solid var(--card-border);border-radius:8px;padding:8px;color:var(--text-primary);font-size:12px" />
                      <ion-button size="small" (click)="confirmResetBarber(b)" [disabled]="barberBusy()===b.id" style="--background:var(--accent);--color:var(--accent-contrast)">{{ c.save }}</ion-button>
                      <ion-button size="small" fill="clear" (click)="resetBarberId.set(null)">{{ c.cancel }}</ion-button>
                    </div>
                  }
                </ion-card-content>
              </ion-card>
            }
          </ion-list>
          @if (barbersLoadingMore()) { <div style="text-align:center;padding:14px"><ion-spinner></ion-spinner></div> }
          @if (barbersHasMore() && barbers().length) { <div appInfiniteScroll (scrolled)="loadMoreBarbers()" [disabled]="barbersLoading() || barbersLoadingMore()" style="height:1px"></div> }
        }

        @if (tab === 'appointments') {
          <div class="dark-card" style="margin-top:12px;display:flex;gap:8px;flex-wrap:wrap;align-items:center">
            <select [(ngModel)]="apptStatus" (ngModelChange)="loadAppts()" style="flex:1;min-width:140px;background:var(--card-bg);border:1px solid var(--card-border);border-radius:8px;padding:8px;color:var(--text-primary);font-family:inherit">
              <option value="">همه وضعیت‌ها</option>
              <option value="pending">در انتظار</option>
              <option value="confirmed">تایید شده</option>
              <option value="cancelled">لغو شده</option>
              <option value="completed">انجام شده</option>
              <option value="no_show">عدم حضور</option>
            </select>
            <ion-button size="small" (click)="loadAppts()" style="--background:var(--accent);--color:var(--accent-contrast)">به‌روزرسانی</ion-button>
          </div>
          <div class="dark-card" style="margin-top:10px;padding:12px;display:flex;flex-direction:column;gap:8px">
            <b style="font-size:12px;color:var(--text-primary)">ایجاد نوبت (مدیر)</b>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
              <input [(ngModel)]="newAppt.barberId" placeholder="barberId" style="background:var(--card-bg);border:1px solid var(--card-border);border-radius:8px;padding:8px;color:var(--text-primary);font-size:12px" />
              <input [(ngModel)]="newAppt.serviceId" placeholder="serviceId" style="background:var(--card-bg);border:1px solid var(--card-border);border-radius:8px;padding:8px;color:var(--text-primary);font-size:12px" />
              <input [(ngModel)]="newAppt.date" placeholder="2026-09-30" style="background:var(--card-bg);border:1px solid var(--card-border);border-radius:8px;padding:8px;color:var(--text-primary);font-size:12px" />
              <input [(ngModel)]="newAppt.startTime" placeholder="09:00 (HH:mm)" style="background:var(--card-bg);border:1px solid var(--card-border);border-radius:8px;padding:8px;color:var(--text-primary);font-size:12px" />
              <input [(ngModel)]="newAppt.endTime" placeholder="09:30 (HH:mm)" style="background:var(--card-bg);border:1px solid var(--card-border);border-radius:8px;padding:8px;color:var(--text-primary);font-size:12px" />
              <input [(ngModel)]="newAppt.notes" placeholder="یادداشت" style="background:var(--card-bg);border:1px solid var(--card-border);border-radius:8px;padding:8px;color:var(--text-primary);font-size:12px" />
            </div>
            <ion-button size="small" (click)="createAppt()" [disabled]="creating()" style="--background:var(--accent);--color:var(--accent-contrast)">ایجاد</ion-button>
          </div>
          @if (apptLoading() && !appts().length) { <div class="dark-card" style="text-align:center;padding:16px;margin-top:10px"><ion-spinner></ion-spinner></div> }
          @if (apptError()) { <div class="dark-card" style="text-align:center;padding:12px;margin-top:10px;color:#ef4444;font-size:12px">{{ apptError() }}</div> }
          @if (!apptLoading() && !apptLoadingMore() && !appts().length) { <app-empty-state [message]="c.empty" /> }
          <ion-list lines="none" style="background:transparent;margin-top:8px;width:100%">
            @for (a of appts(); track a.id) {
              <ion-card style="margin-bottom:8px">
                <ion-card-content style="display:flex;flex-direction:column;gap:10px">
                  <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px">
                    <ion-label style="min-width:0"><h3 style="font-weight:800;color:var(--text-primary);font-size:12px">{{ a.date.slice(0,10) }} {{ a.startTime.slice(11,16) || a.startTime }} - {{ a.endTime.slice(11,16) || a.endTime }}</h3><p class="muted" style="font-size:11px">{{ a.barber?.fullName ?? a.barberId.slice(0,8) }} · {{ a.service?.name ?? a.serviceId.slice(0,8) }} · {{ a.user?.username ?? a.userId.slice(0,8) }}</p>@if(a.notes){<p class="muted" style="font-size:11px;white-space:pre-wrap">📝 {{ a.notes }}</p>}</ion-label>
                    <ion-badge style="font-size:10px;flex-shrink:0">{{ a.status }}</ion-badge>
                  </div>
                  <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">
                    <select [value]="a.status" (change)="updateStatus(a, $any($event.target).value)" [disabled]="apptBusy()===a.id" style="background:var(--card-bg);border:1px solid var(--card-border);border-radius:8px;padding:6px;font-size:11px;color:var(--text-primary)">
                      <option value="pending">pending</option>
                      <option value="confirmed">confirmed</option>
                      <option value="cancelled">cancelled</option>
                      <option value="completed">completed</option>
                      <option value="no_show">no_show</option>
                    </select>
                    <ion-button fill="outline" size="small" (click)="startEditAppt(a)" [disabled]="apptBusy()===a.id">ویرایش</ion-button>
                    @if (a.status!=='cancelled' && a.status!=='completed' && a.status!=='no_show') { <ion-button fill="clear" size="small" color="warning" (click)="cancelAppt(a)" [disabled]="apptBusy()===a.id">لغو</ion-button> }
                    <ion-button fill="clear" size="small" color="danger" (click)="deleteAppt(a)" [disabled]="apptBusy()===a.id"><ion-icon name="trash-outline" slot="icon-only"></ion-icon></ion-button>
                  </div>
                    @if (editId()===a.id) {
                    <div style="display:flex;flex-direction:column;gap:8px;background:var(--card-bg);border:1px solid var(--card-border);border-radius:10px;padding:10px">
                      @if (!editOptsLoaded()) { <div style="text-align:center;padding:8px"><ion-spinner></ion-spinner></div> }
                      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
                        <select [(ngModel)]="editForm.barberId" (ngModelChange)="onEditBarberChange()" style="background:var(--card-bg);border:1px solid var(--card-border);border-radius:8px;padding:8px;color:var(--text-primary);font-family:inherit;font-size:12px">
                          @for (b of allBarbers(); track b.id) { <option [value]="b.id">{{ b.fullName }}</option> }
                        </select>
                        <select [(ngModel)]="editForm.serviceId" style="background:var(--card-bg);border:1px solid var(--card-border);border-radius:8px;padding:8px;color:var(--text-primary);font-family:inherit;font-size:12px">
                          @for (s of editServicesFiltered(); track s.id) { <option [value]="s.id">{{ s.name }} — {{ s.duration }}m</option> }
                        </select>
                        <input type="date" [(ngModel)]="editForm.date" (ngModelChange)="loadEditSlots()" style="background:var(--card-bg);border:1px solid var(--card-border);border-radius:8px;padding:8px;color:var(--text-primary);font-size:12px" />
                        <select [(ngModel)]="editForm.slotKey" style="background:var(--card-bg);border:1px solid var(--card-border);border-radius:8px;padding:8px;color:var(--text-primary);font-family:inherit;font-size:12px">
                          <option value="">{{ editSlotLabel() || '— ساعت —' }}</option>
                          @for (sl of editSlots(); track sl.startTime) { <option [value]="sl.startTime + '|' + sl.endTime">{{ sl.startTime.slice(11,16) }} - {{ sl.endTime.slice(11,16) }} @if(sl.status!=='available' && sl.status!=='free'){({{ sl.status }})}</option> }
                        </select>
                      </div>
                      @if (editSlotsLoading()) { <div style="text-align:center"><ion-spinner></ion-spinner></div> }
                      @if (editSlotReason()) { <p class="muted" style="margin:0;font-size:11px">{{ editSlotReason() }}</p> }
                      <select [(ngModel)]="editForm.status" style="background:var(--card-bg);border:1px solid var(--card-border);border-radius:8px;padding:8px;color:var(--text-primary);font-family:inherit;font-size:12px">
                        <option value="pending">pending</option>
                        <option value="confirmed">confirmed</option>
                        <option value="cancelled">cancelled</option>
                        <option value="completed">completed</option>
                        <option value="no_show">no_show</option>
                      </select>
                      <textarea [(ngModel)]="editForm.notes" placeholder="یادداشت" maxlength="500" rows="2" style="width:100%;background:var(--card-bg);border:1px solid var(--card-border);border-radius:8px;padding:8px;font-size:12px;color:var(--text-primary);font-family:inherit;resize:vertical"></textarea>
                      <div style="display:flex;gap:8px">
                        <ion-button size="small" (click)="saveEdit(a)" [disabled]="apptBusy()===a.id || !canSaveEdit()" style="--background:var(--accent);--color:var(--accent-contrast)">ذخیره</ion-button>
                        <ion-button size="small" fill="clear" (click)="editId.set(null)">انصراف</ion-button>
                      </div>
                    </div>
                  }
                </ion-card-content>
              </ion-card>
            }
          </ion-list>
          @if (apptLoadingMore()) { <div style="text-align:center;padding:14px"><ion-spinner></ion-spinner></div> }
          @if (apptHasMore() && appts().length) { <div appInfiniteScroll (scrolled)="loadMoreAppts()" [disabled]="apptLoading() || apptLoadingMore()" style="height:1px"></div> }
        }

        @if (tab === 'settings') {
          <div class="dark-card" style="margin-top:12px;display:flex;gap:8px;flex-wrap:wrap">
            <app-ui-input [label]="t.key" [(ngModel)]="newKey" style="flex:1;min-width:120px" />
            <app-ui-input [label]="t.value" [(ngModel)]="newVal" style="flex:1;min-width:120px" />
            <ion-button (click)="createSetting()" style="--background:var(--accent);--color:var(--accent-contrast)"><ion-icon name="add-outline" slot="icon-only"></ion-icon></ion-button>
          </div>
          <ion-list lines="none" style="background:transparent;margin-top:8px;width:100%">
            @for (s of settings(); track s.key) {
              <ion-card style="margin-bottom:8px"><ion-card-content style="display:flex;justify-content:space-between;align-items:center"><ion-label style="color:var(--text-primary);font-size:12px">{{ s.key }} = {{ s.value }}</ion-label><ion-button fill="clear" color="danger" (click)="delSetting(s.key)"><ion-icon name="trash-outline" slot="icon-only"></ion-icon></ion-button></ion-card-content></ion-card>
            }
          </ion-list>
        }
      </div>
    </ion-content>`,
})
export class AdminPage implements OnInit {
  private api = inject(ApiService);
  private toast = inject(ToastService);
  t = fa.admin;
  c = fa.common;
  tab = 'dash';
  dash = signal<{ totalUsers: number; totalBarbers: number; totalAppointments: number; totalBarbershops: number; appointmentsByStatus: Record<string, number> } | null>(null);
  dashLoading = signal(false);
  users = signal<User[]>([]);
  usersLoading = signal(false);
  usersLoadingMore = signal(false);
  usersHasMore = signal(true);
  private usersPage = 1;
  private usersLimit = 20;
  userBusy = signal<string | null>(null);
  resetUserId = signal<string | null>(null);
  resetUserPwd = '';
  usernameEditId = signal<string | null>(null);
  usernameEditVal = '';
  barberUsernameEditId = signal<string | null>(null);
  barberUsernameEditVal = '';
  barbers = signal<Barber[]>([]);
  barbersLoading = signal(false);
  barbersLoadingMore = signal(false);
  barbersHasMore = signal(true);
  private barbersPage = 1;
  private barbersLimit = 20;
  barberBusy = signal<string | null>(null);
  resetBarberId = signal<string | null>(null);
  resetBarberPwd = '';
  appts = signal<Appointment[]>([]);
  apptLoading = signal(false);
  apptLoadingMore = signal(false);
  apptHasMore = signal(true);
  private apptPage = 1;
  private apptLimit = 20;
  apptError = signal('');
  apptBusy = signal<string | null>(null);
  apptStatus = '';
  editId = signal<string | null>(null);
  allBarbers = signal<Barber[]>([]);
  allServices = signal<Service[]>([]);
  editOptsLoaded = signal(false);
  editSlots = signal<{ startTime: string; endTime: string; status: string }[]>([]);
  editSlotsLoading = signal(false);
  editSlotReason = signal('');
  editForm: { barberId: string; serviceId: string; date: string; slotKey: string; status: string; notes: string } = { barberId: '', serviceId: '', date: '', slotKey: '', status: 'pending', notes: '' };
  newAppt: Record<string,string> = { barberId:'', serviceId:'', date:'', startTime:'', endTime:'', notes:'' };
  creating = signal(false);
  settings = signal<{ key: string; value?: string | null }[]>([]);
  uq: Record<string, string> = { search: '', role: '', isActive: '' };
  bq: Record<string, string> = { search: '', status: '', isActive: '' };
  newKey = '';
  newVal = '';
  constructor() { addIcons({ refreshOutline, trashOutline, addOutline, searchOutline, powerOutline, keyOutline, checkmarkCircleOutline, closeCircleOutline, pencilOutline, createOutline, closeOutline, checkmarkOutline }); }
  ngOnInit() { this.loadDash(); this.loadUsers(); this.loadBarbers(); this.loadSettings(); }
  onTab(e: CustomEvent) { this.tab = (e.detail.value ?? 'dash').toString(); if (this.tab==='appointments' && !this.appts().length) this.loadAppts(); if (this.tab==='barbers' && !this.barbers().length) this.loadBarbers(); if (this.tab==='users' && !this.users().length) this.loadUsers(); }
  loadDash() { this.dashLoading.set(true); this.api.admin.dashboard().subscribe({ next: (v) => { this.dash.set(v as never); this.dashLoading.set(false); }, error: () => this.dashLoading.set(false) }); }
  loadUsers(reset = true) {
    if (reset) { this.usersPage = 1; this.usersHasMore.set(true); this.usersLoading.set(true); } else this.usersLoadingMore.set(true);
    const p: Record<string, unknown> = { page: this.usersPage, limit: this.usersLimit };
    if (this.uq.search?.trim()) p['search'] = this.uq.search.trim();
    if (this.uq.role) p['role'] = this.uq.role;
    if (this.uq.isActive) p['isActive'] = this.uq.isActive;
    this.api.admin.users(p).subscribe({
      next: (v) => {
        const pg = unwrapPaginated<unknown>(v);
        const arr = pg.data as unknown as User[];
        if (reset) this.users.set(arr); else this.users.update((a) => [...a, ...arr]);
        const more = arr.length === this.usersLimit && (pg.total ? this.users().length < pg.total : true);
        if (arr.length) this.usersPage++;
        this.usersHasMore.set(more);
        this.usersLoading.set(false); this.usersLoadingMore.set(false);
      },
      error: (e) => { this.usersLoading.set(false); this.usersLoadingMore.set(false); this.usersHasMore.set(false); this.toast.error(extractMessage(e, fa.common.failed)); },
    });
  }
  loadMoreUsers() { if (!this.usersHasMore() || this.usersLoading() || this.usersLoadingMore()) return; this.loadUsers(false); }
  toggleUser(u: User) {
    this.userBusy.set(u.id);
    const next = !u.isActive;
    this.api.admin.toggleUserActive(u.id, next).subscribe({
      next: () => { this.toast.success(fa.admin.toggleSuccess); this.userBusy.set(null); this.loadUsers(); this.loadBarbers(); },
      error: (e) => { this.toast.error(extractMessage(e, fa.common.failed)); this.userBusy.set(null); },
    });
  }
  startResetUser(u: User) { this.resetUserId.set(u.id); this.resetUserPwd = ''; }
  confirmResetUser(u: User) {
    const pwd = this.resetUserPwd.trim();
    if (pwd.length < 6) { this.toast.warning('رمز عبور حداقل ۶ کاراکتر'); return; }
    this.userBusy.set(u.id);
    this.api.admin.resetUserPassword(u.id, pwd).subscribe({
      next: () => { this.toast.success(fa.admin.passwordResetSuccess); this.resetUserId.set(null); this.resetUserPwd = ''; this.userBusy.set(null); },
      error: (e) => { this.toast.error(extractMessage(e, fa.common.failed)); this.userBusy.set(null); },
    });
  }
  delUser(id: string) {
    if (!confirm(fa.admin.confirmDelete)) return;
    this.userBusy.set(id);
    this.api.admin.deleteUser(id).subscribe({
      next: () => { this.toast.success(fa.admin.userDeleteSuccess); this.userBusy.set(null); this.loadUsers(); this.loadDash(); },
      error: (e) => { this.toast.error(extractMessage(e, fa.common.failed)); this.userBusy.set(null); },
    });
  }
  startUsernameEdit(u: User) { this.usernameEditId.set(u.id); this.usernameEditVal = u.username ?? ''; this.resetUserId.set(null); }
  confirmUsername(u: User) {
    const v = this.usernameEditVal.trim();
    if (!v) { this.toast.warning(fa.admin.usernameRequired); return; }
    if (!/^[a-zA-Z0-9_.-]{3,30}$/.test(v)) { this.toast.warning(fa.admin.usernameInvalid); return; }
    if (v === u.username) { this.usernameEditId.set(null); return; }
    this.userBusy.set(u.id);
    this.api.admin.updateUser(u.id, { username: v }).subscribe({
      next: () => { this.toast.success(fa.admin.usernameUpdateSuccess); this.usernameEditId.set(null); this.userBusy.set(null); this.loadUsers(); this.loadBarbers(); },
      error: (e: unknown) => { const m = extractMessage(e, fa.common.failed); this.toast.error(m.includes('taken') || m.includes('exists') ? fa.admin.usernameExists : m); this.userBusy.set(null); },
    });
  }
  startBarberUsernameEdit(b: Barber) { const cur = (b.user as User | undefined)?.username ?? ''; this.barberUsernameEditId.set(b.id); this.barberUsernameEditVal = cur; this.resetBarberId.set(null); }
  confirmBarberUsername(b: Barber) {
    const uid = (b as unknown as { userId: string }).userId;
    if (!uid) { this.toast.error(fa.common.failed); return; }
    const v = this.barberUsernameEditVal.trim();
    if (!v) { this.toast.warning(fa.admin.usernameRequired); return; }
    if (!/^[a-zA-Z0-9_.-]{3,30}$/.test(v)) { this.toast.warning(fa.admin.usernameInvalid); return; }
    if (v === (b.user as User | undefined)?.username) { this.barberUsernameEditId.set(null); return; }
    this.barberBusy.set(b.id);
    this.api.admin.updateUser(uid, { username: v }).subscribe({
      next: () => { this.toast.success(fa.admin.usernameUpdateSuccess); this.barberUsernameEditId.set(null); this.barberBusy.set(null); this.loadBarbers(); this.loadUsers(); },
      error: (e: unknown) => { const m = extractMessage(e, fa.common.failed); this.toast.error(m.includes('taken') || m.includes('exists') ? fa.admin.usernameExists : m); this.barberBusy.set(null); },
    });
  }
  loadBarbers(reset = true) {
    if (reset) { this.barbersPage = 1; this.barbersHasMore.set(true); this.barbersLoading.set(true); } else this.barbersLoadingMore.set(true);
    const p: Record<string, unknown> = { page: this.barbersPage, limit: this.barbersLimit };
    if (this.bq.search?.trim()) p['search'] = this.bq.search.trim();
    if (this.bq.status) p['status'] = this.bq.status;
    if (this.bq.isActive) p['isActive'] = this.bq.isActive;
    this.api.admin.barbers(p).subscribe({
      next: (v) => {
        const pg = unwrapPaginated<unknown>(v);
        const arr = pg.data as unknown as Barber[];
        if (reset) this.barbers.set(arr); else this.barbers.update((a) => [...a, ...arr]);
        const more = arr.length === this.barbersLimit && (pg.total ? this.barbers().length < pg.total : true);
        if (arr.length) this.barbersPage++;
        this.barbersHasMore.set(more);
        this.barbersLoading.set(false); this.barbersLoadingMore.set(false);
      },
      error: (e) => { this.barbersLoading.set(false); this.barbersLoadingMore.set(false); this.barbersHasMore.set(false); this.toast.error(extractMessage(e, fa.common.failed)); },
    });
  }
  loadMoreBarbers() { if (!this.barbersHasMore() || this.barbersLoading() || this.barbersLoadingMore()) return; this.loadBarbers(false); }
  toggleBarber(b: Barber) {
    this.barberBusy.set(b.id);
    const next = !b.isActive;
    this.api.admin.toggleBarberActive(b.id, next).subscribe({
      next: () => { this.toast.success(fa.admin.toggleSuccess); this.barberBusy.set(null); this.loadBarbers(); this.loadUsers(); },
      error: (e) => { this.toast.error(extractMessage(e, fa.common.failed)); this.barberBusy.set(null); },
    });
  }
  startResetBarber(b: Barber) { this.resetBarberId.set(b.id); this.resetBarberPwd = ''; }
  confirmResetBarber(b: Barber) {
    const pwd = this.resetBarberPwd.trim();
    if (pwd.length < 6) { this.toast.warning('رمز عبور حداقل ۶ کاراکتر'); return; }
    this.barberBusy.set(b.id);
    this.api.admin.resetBarberPassword(b.id, pwd).subscribe({
      next: () => { this.toast.success(fa.admin.passwordResetSuccess); this.resetBarberId.set(null); this.resetBarberPwd = ''; this.barberBusy.set(null); },
      error: (e) => { this.toast.error(extractMessage(e, fa.common.failed)); this.barberBusy.set(null); },
    });
  }
  delBarber(id: string) {
    if (!confirm(fa.admin.confirmDelete)) return;
    this.barberBusy.set(id);
    this.api.admin.deleteBarber(id).subscribe({
      next: () => { this.toast.success(fa.admin.barberDeleteSuccess); this.barberBusy.set(null); this.loadBarbers(); this.loadDash(); },
      error: (e) => { this.toast.error(extractMessage(e, fa.common.failed)); this.barberBusy.set(null); },
    });
  }
  loadAppts(reset = true) {
    if (reset) { this.apptPage = 1; this.apptHasMore.set(true); this.apptLoading.set(true); } else this.apptLoadingMore.set(true);
    this.apptError.set('');
    const p: Record<string, unknown> = { page: this.apptPage, limit: this.apptLimit };
    if (this.apptStatus) p['status']=this.apptStatus;
    this.api.admin.adminAppointments(p).subscribe({
      next: (v) => {
        const pg = unwrapPaginated<Appointment>(v);
        if (reset) this.appts.set(pg.data as Appointment[]); else this.appts.update((a) => [...a, ...pg.data as Appointment[]]);
        const more = pg.data.length === this.apptLimit && (pg.total ? this.appts().length < pg.total : true);
        if (pg.data.length) this.apptPage++;
        this.apptHasMore.set(more);
        this.apptLoading.set(false); this.apptLoadingMore.set(false);
      },
      error: (e) => { this.apptError.set((e?.error as {message?:string})?.message ?? 'خطا'); this.apptLoading.set(false); this.apptLoadingMore.set(false); this.apptHasMore.set(false); },
    });
  }
  loadMoreAppts() { if (!this.apptHasMore() || this.apptLoading() || this.apptLoadingMore()) return; this.loadAppts(false); }
  updateStatus(a: Appointment, status: string) {
    this.apptBusy.set(a.id);
    this.api.admin.updateAppointmentStatus(a.id, status).subscribe({
      next: () => { this.toast.success(fa.appointments.statusSuccess); this.apptBusy.set(null); this.loadAppts(); },
      error: (e) => { this.toast.error((e?.error as {message?:string})?.message ?? fa.common.failed); this.apptBusy.set(null); },
    });
  }
  cancelAppt(a: Appointment) {
    this.apptBusy.set(a.id);
    this.api.admin.cancelAppointment(a.id).subscribe({
      next: () => { this.toast.success(fa.appointments.cancelSuccess); this.apptBusy.set(null); this.loadAppts(); },
      error: (e) => { this.toast.error((e?.error as {message?:string})?.message ?? fa.common.failed); this.apptBusy.set(null); },
    });
  }
  deleteAppt(a: Appointment) {
    this.apptBusy.set(a.id);
    this.api.admin.deleteAppointment(a.id).subscribe({
      next: () => { this.toast.success(fa.common.success); this.apptBusy.set(null); this.loadAppts(); },
      error: (e) => { this.toast.error((e?.error as {message?:string})?.message ?? fa.common.failed); this.apptBusy.set(null); },
    });
  }
  editServicesFiltered(): Service[] {
    const bid = this.editForm.barberId;
    if (!bid) return this.allServices();
    const filtered = this.allServices().filter(s => s.barberId === bid);
    return filtered.length ? filtered : this.allServices();
  }
  editSlotLabel(): string {
    if (this.editSlotsLoading()) return 'در حال بارگذاری…';
    if (!this.editForm.date || !this.editForm.barberId) return 'تاریخ/آرایشگر را انتخاب کنید';
    if (!this.editSlots().length) return '— اسلاتی یافت نشد —';
    return '';
  }
  canSaveEdit(): boolean {
    return !!this.editForm.barberId && !!this.editForm.serviceId && !!this.editForm.date;
  }
  onEditBarberChange() {
    const all = this.allServices();
    if (this.editForm.barberId && !all.some(s => s.id === this.editForm.serviceId && s.barberId === this.editForm.barberId)) {
      const hit = all.find(s => s.barberId === this.editForm.barberId);
      if (hit) this.editForm.serviceId = hit.id;
    }
    this.editForm.slotKey = '';
    this.loadEditSlots();
  }
  loadEditSlots() {
    this.editSlotReason.set('');
    if (!this.editForm.barberId || !this.editForm.date) { this.editSlots.set([]); return; }
    this.editSlotsLoading.set(true);
    const p: Record<string, string> = { barberId: this.editForm.barberId, date: this.editForm.date };
    if (this.editForm.serviceId) p['serviceId'] = this.editForm.serviceId;
    this.api.appointments.slots(p).subscribe({
      next: (v) => {
        const r = v as { slots?: { startTime: string; endTime: string; status: string }[]; reason?: string };
        const slots = r.slots ?? [];
        const cur = this.editForm.slotKey;
        if (cur && !slots.some(s => `${s.startTime}|${s.endTime}` === cur)) {
          const [st, et] = cur.split('|');
          if (st && et) slots.unshift({ startTime: st, endTime: et, status: 'current' });
        }
        this.editSlots.set(slots);
        this.editSlotReason.set(r.reason ?? '');
        this.editSlotsLoading.set(false);
      },
      error: () => { this.editSlots.set([]); this.editSlotsLoading.set(false); },
    });
  }
  private ensureEditOpts() {
    if (this.editOptsLoaded()) return;
    let done = 0;
    const check = () => { done++; if (done >= 2) this.editOptsLoaded.set(true); };
    this.api.barbers.list().subscribe({
      next: (v) => {
        const arr = Array.isArray(v) ? v as Barber[] : ((v as { data: Barber[] }).data ?? []);
        this.allBarbers.set(arr as Barber[]);
        check();
      },
      error: () => check(),
    });
    this.api.services.list().subscribe({
      next: (v) => {
        const arr = Array.isArray(v) ? v as Service[] : ((v as { data: Service[] }).data ?? []);
        this.allServices.set(arr as Service[]);
        check();
      },
      error: () => check(),
    });
  }
  startEditAppt(a: Appointment) {
    this.editId.set(a.id);
    const d = a.date?.slice(0, 10) ?? new Date().toISOString().slice(0, 10);
    this.editForm = {
      barberId: a.barberId,
      serviceId: a.serviceId,
      date: d,
      slotKey: `${a.startTime}|${a.endTime}`,
      status: a.status,
      notes: a.notes ?? '',
    };
    this.ensureEditOpts();
    this.loadEditSlots();
  }
  saveEdit(a: Appointment) {
    if (!this.canSaveEdit()) { this.toast.warning('فیلدهای الزامی را پر کنید'); return; }
    this.apptBusy.set(a.id);
    const f = this.editForm;
    const dto: Record<string, unknown> = {
      barberId: f.barberId,
      serviceId: f.serviceId,
      date: f.date,
      notes: f.notes || null,
    };
    if (f.slotKey && f.slotKey.includes('|')) {
      const [st, et] = f.slotKey.split('|');
      dto['startTime'] = st;
      dto['endTime'] = et;
    }
    const statusChanged = f.status !== a.status;
    const patch$ = this.api.admin.updateAppointment(a.id, dto);
    patch$.subscribe({
      next: () => {
        if (statusChanged) {
          this.api.admin.updateAppointmentStatus(a.id, f.status).subscribe({
            next: () => { this.toast.success(fa.common.success); this.editId.set(null); this.apptBusy.set(null); this.loadAppts(); },
            error: (e) => { this.toast.error((e?.error as { message?: string })?.message ?? fa.common.failed); this.apptBusy.set(null); },
          });
        } else {
          this.toast.success(fa.common.success); this.editId.set(null); this.apptBusy.set(null); this.loadAppts();
        }
      },
      error: (e) => { this.toast.error((e?.error as { message?: string })?.message ?? fa.common.failed); this.apptBusy.set(null); },
    });
  }
  createAppt() {
    const d = this.newAppt.date?.slice(0,10);
    const s = this.newAppt.startTime?.trim();
    const e = this.newAppt.endTime?.trim();
    if (!this.newAppt.barberId || !this.newAppt.serviceId || !d || !s || !e) { this.toast.warning('فیلدهای الزامی را پر کنید'); return; }
    const startTime = s.includes('T') ? s : `${d}T${s.length===5?s+':00':s}.000Z`;
    const endTime = e.includes('T') ? e : `${d}T${e.length===5?e+':00':e}.000Z`;
    this.creating.set(true);
    this.api.appointments.create({ barberId: this.newAppt.barberId, serviceId: this.newAppt.serviceId, date: d, startTime, endTime, notes: this.newAppt.notes || undefined }).subscribe({
      next: () => { this.toast.success(fa.appointments.createSuccess); this.creating.set(false); this.newAppt={barberId:'',serviceId:'',date:'',startTime:'',endTime:'',notes:''}; this.loadAppts(); },
      error: (err) => { this.toast.error((err?.error as {message?:string})?.message ?? fa.common.failed); this.creating.set(false); },
    });
  }
  loadSettings() { this.api.admin.settings().subscribe({ next: (v) => this.settings.set(v as { key: string; value?: string | null }[]) }); }
  createSetting() {
    if (!this.newKey.trim()) { this.toast.warning(fa.common.required); return; }
    this.api.admin.createSetting({ key: this.newKey.trim(), value: this.newVal }).subscribe({
      next: () => { this.toast.success(fa.admin.createSuccess); this.newKey = ''; this.newVal = ''; this.loadSettings(); },
      error: (e) => this.toast.error(extractMessage(e, fa.common.failed)),
    });
  }
  delSetting(k: string) { this.api.admin.deleteSetting(k).subscribe({ next: () => { this.toast.success(fa.admin.deleteSuccess); this.loadSettings(); }, error: (e) => this.toast.error(extractMessage(e, fa.common.failed)) }); }
}

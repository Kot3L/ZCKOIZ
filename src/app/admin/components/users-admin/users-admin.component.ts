import { Component, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../../../core/services/supabase.service';
import { UserRole, Profile } from '../../../core/models/database.types';

@Component({
  selector: 'app-users-admin',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="space-y-6">
      <div>
        <h1 class="text-3xl text-ink mb-1">Użytkownicy</h1>
        <p class="text-gray-500">Zarządzaj rolami i dostępem do panelu (tylko administrator)</p>
      </div>

      @if (message()) {
        <div [class]="messageType() === 'error' ? 'bg-red-50 text-red-700 border-red-500' : 'bg-green-50 text-green-700 border-green-500'"
             class="p-4 border-2 rounded-lg text-sm">{{ message() }}</div>
      }

      <div class="comic-card">
        <h2 class="font-heading text-xl text-orange-primary mb-4">Zaproś użytkownika / nadaj rolę</h2>
        <form (submit)="inviteUser($event)" class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input [(ngModel)]="newUserEmail" name="email" type="email" required placeholder="Email użytkownika" class="md:col-span-2 px-4 py-2.5 border-2 border-ink rounded-lg" />
          <select [(ngModel)]="newUserRole" name="role" class="px-4 py-2.5 border-2 border-ink rounded-lg bg-surface">
            <option value="editor">Redaktor</option>
            <option value="admin">Administrator</option>
          </select>
          <button type="submit" class="comic-btn-primary text-sm md:col-span-3 justify-center">Zaproś i nadaj rolę</button>
        </form>
      </div>

      <div class="bg-surface comic-border overflow-hidden">
        <table class="w-full text-left text-sm">
          <thead>
            <tr class="bg-cream-dark border-b-2 border-ink">
              <th class="px-4 py-3 font-heading uppercase text-xs">Użytkownik</th>
              <th class="px-4 py-3 font-heading uppercase text-xs">Email</th>
              <th class="px-4 py-3 font-heading uppercase text-xs">Role</th>
              <th class="px-4 py-3 font-heading uppercase text-xs text-right">Akcje</th>
            </tr>
          </thead>
          <tbody>
            @for (user of users(); track user.id) {
              <tr class="border-b border-ink/10 hover:bg-cream transition-colors">
                <td class="px-4 py-3 font-medium">{{ user.full_name || '—' }}</td>
                <td class="px-4 py-3 text-gray-600">{{ user.email }}</td>
                <td class="px-4 py-3">
                  <div class="flex gap-1 flex-wrap">
                    @for (role of rolesFor(user.id); track role) {
                      <span class="badge-petrol text-[10px]">{{ role }}</span>
                    } @empty {
                      <span class="text-gray-400 text-xs">brak ról</span>
                    }
                  </div>
                </td>
                <td class="px-4 py-3">
                  <div class="flex justify-end gap-2">
                    <button (click)="toggleRole(user.id, 'editor', 'editor')" class="comic-btn text-xs !py-1.5 !px-3 bg-surface text-ink">Editor</button>
                    <button (click)="toggleRole(user.id, 'admin', 'admin')" class="comic-btn text-xs !py-1.5 !px-3 bg-surface text-ink">Admin</button>
                  </div>
                </td>
              </tr>
            } @empty {
              <tr><td colspan="4" class="px-4 py-8 text-center text-gray-500">Brak użytkowników</td></tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
})
export class UsersAdminComponent implements OnInit {
  users = signal<Profile[]>([]);
  roles = signal<UserRole[]>([]);
  newUserEmail = '';
  newUserRole = 'editor';
  message = signal<string | null>(null);
  messageType = signal<'success' | 'error'>('success');

  constructor(private supabase: SupabaseService) {}

  async ngOnInit() {
    await Promise.all([this.loadUsers(), this.loadRoles()]);
  }

  async loadUsers() {
    const { data } = await this.supabase.supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    this.users.set((data as Profile[]) ?? []);
  }

  async loadRoles() {
    const { data } = await this.supabase.supabase.from('user_roles').select('*');
    this.roles.set((data as UserRole[]) ?? []);
  }

  rolesFor = (userId: string) => this.roles().filter(r => r.user_id === userId).map(r => r.role);

  async inviteUser(event: Event) {
    event.preventDefault();
    if (!this.newUserEmail) return;

    const { error } = await this.supabase.supabase.auth.admin.inviteUserByEmail(this.newUserEmail);
    if (error) {
      this.setMessage('Błąd zaproszenia: ' + error.message, 'error');
      return;
    }

    await this.supabase.supabase.from('user_roles').insert([{
      user_id: this.newUserEmail,
      role: this.newUserRole,
    }]);

    this.setMessage('Użytkownik zaproszony. Po rejestracji nadaj rolę w tabeli poniżej.', 'success');
    this.newUserEmail = '';
  }

  async toggleRole(userId: string, role: 'admin' | 'editor', roleKey: 'admin' | 'editor') {
    const has = this.rolesFor(userId).includes(roleKey);
    if (has) {
      await this.supabase.supabase.from('user_roles').delete().eq('user_id', userId).eq('role', roleKey);
      this.setMessage('Rola usunięta.', 'success');
    } else {
      await this.supabase.supabase.from('user_roles').insert([{ user_id: userId, role: roleKey }]);
      this.setMessage('Rola nadana.', 'success');
    }
    await this.loadRoles();
  }

  setMessage(msg: string, type: 'success' | 'error') {
    this.message.set(msg);
    this.messageType.set(type);
    setTimeout(() => this.message.set(null), 5000);
  }
}

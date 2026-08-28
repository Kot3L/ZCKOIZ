import { Component, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../../../core/services/supabase.service';
import { SiteSettings } from '../../../core/models/database.types';

@Component({
  selector: 'app-settings-admin',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="space-y-6">
      <div>
        <h1 class="text-3xl text-ink mb-1">Ustawienia</h1>
        <p class="text-gray-500">Dane kontaktowe i ustawienia ogólne serwisu</p>
      </div>

      @if (message()) {
        <div [class]="messageType() === 'error' ? 'bg-red-50 text-red-700 border-red-500' : 'bg-green-50 text-green-700 border-green-500'"
             class="p-4 border-2 rounded-lg text-sm">{{ message() }}</div>
      }

      <div class="comic-card max-w-2xl">
        <h2 class="font-heading text-xl text-orange-primary mb-4">Dane kontaktowe</h2>
        <form (submit)="save($event)" class="space-y-4">
          <div>
            <label class="block text-sm font-semibold mb-1">Adres</label>
            <input [(ngModel)]="form.contact_address" name="contact_address" class="w-full px-4 py-2.5 border-2 border-ink rounded-lg" />
          </div>
          <div>
            <label class="block text-sm font-semibold mb-1">Email</label>
            <input [(ngModel)]="form.contact_email" name="contact_email" class="w-full px-4 py-2.5 border-2 border-ink rounded-lg" />
          </div>
          <div>
            <label class="block text-sm font-semibold mb-1">Telefon</label>
            <input [(ngModel)]="form.contact_phone" name="contact_phone" class="w-full px-4 py-2.5 border-2 border-ink rounded-lg" />
          </div>
          <button type="submit" class="comic-btn-primary text-sm">Zapisz ustawienia</button>
        </form>
      </div>
    </div>
  `,
})
export class SettingsAdminComponent implements OnInit {
  form = { contact_address: '', contact_email: '', contact_phone: '' };
  message = signal<string | null>(null);
  messageType = signal<'success' | 'error'>('success');

  constructor(private supabase: SupabaseService) {}

  async ngOnInit() {
    const { data } = await this.supabase.supabase.from('site_settings').select('*');
    if (data) {
      const map: Record<string, string> = {};
      (data as SiteSettings[]).forEach(s => map[s.key] = s.value);
      this.form = {
        contact_address: map['contact_address'] ?? '',
        contact_email: map['contact_email'] ?? '',
        contact_phone: map['contact_phone'] ?? '',
      };
    }
  }

  async save(event: Event) {
    event.preventDefault();
    const entries = [
      { key: 'contact_address', value: this.form.contact_address },
      { key: 'contact_email', value: this.form.contact_email },
      { key: 'contact_phone', value: this.form.contact_phone },
    ];
    for (const entry of entries) {
      const { data: existing } = await this.supabase.supabase.from('site_settings').select('id').eq('key', entry.key).maybeSingle();
      if (existing) {
        await this.supabase.supabase.from('site_settings').update({ value: entry.value, updated_at: new Date().toISOString() }).eq('key', entry.key);
      } else {
        await this.supabase.supabase.from('site_settings').insert([{ key: entry.key, value: entry.value }]);
      }
    }
    this.setMessage('Ustawienia zapisane.', 'success');
  }

  setMessage(msg: string, type: 'success' | 'error') {
    this.message.set(msg);
    this.messageType.set(type);
    setTimeout(() => this.message.set(null), 5000);
  }
}

import { Component, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SkeletonComponent } from '../../../shared/components/skeleton/skeleton.component';
import { FirebaseService } from '../../../core/services/firebase.service';
import { SiteSettings } from '../../../core/models/database.types';

@Component({
  selector: 'app-settings-admin',
  standalone: true,
  imports: [FormsModule, SkeletonComponent],
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

      @if (loading()) {
        <div class="comic-card max-w-2xl space-y-4" aria-busy="true">
          <app-skeleton type="title" [style.width]="'35%'"/>
          <app-skeleton type="button"/>
          <app-skeleton type="button"/>
          <app-skeleton type="button"/>
          <app-skeleton type="button" [style.width]="'160px'"/>
        </div>
      } @else {
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
      }
    </div>
  `,
})
export class SettingsAdminComponent implements OnInit {
  form = { contact_address: '', contact_email: '', contact_phone: '' };
  message = signal<string | null>(null);
  messageType = signal<'success' | 'error'>('success');
  loading = signal(true);

  constructor(private fb: FirebaseService) {}

  async ngOnInit() {
    try {
      const data = await this.fb.listSettings();
      const map: Record<string, string> = {};
      data.forEach(s => map[s.key] = s.value);
      this.form = {
        contact_address: map['contact_address'] ?? '',
        contact_email: map['contact_email'] ?? '',
        contact_phone: map['contact_phone'] ?? '',
      };
    } finally {
      this.loading.set(false);
    }
  }

  async save(event: Event) {
    event.preventDefault();
    const entries = [
      { key: 'contact_address', value: this.form.contact_address },
      { key: 'contact_email', value: this.form.contact_email },
      { key: 'contact_phone', value: this.form.contact_phone },
    ];
    try {
      const settings = await this.fb.listSettings();
      for (const entry of entries) {
        const existing = settings.find(s => s.key === entry.key);
        await this.fb.saveSetting({ key: entry.key, value: entry.value }, existing?.id);
      }
      this.setMessage('Ustawienia zapisane.', 'success');
    } catch (e: any) {
      this.setMessage('Błąd: ' + (e.message ?? e), 'error');
    }
  }

  setMessage(msg: string, type: 'success' | 'error') {
    this.message.set(msg);
    this.messageType.set(type);
    setTimeout(() => this.message.set(null), 5000);
  }
}

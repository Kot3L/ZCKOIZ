import { Component, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FirebaseService } from '../../../core/services/firebase.service';
import { Staff } from '../../../core/models/database.types';

@Component({
  selector: 'app-staff-admin',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl text-ink mb-1">Kadra</h1>
          <p class="text-gray-500">Zarządzaj listą pracowników i dyrekcji</p>
        </div>
        <button (click)="toggleEditor(null)" class="comic-btn-primary text-sm">+ Dodaj pracownika</button>
      </div>

      @if (message()) {
        <div [class]="messageType() === 'error' ? 'bg-red-50 text-red-700 border-red-500' : 'bg-green-50 text-green-700 border-green-500'"
             class="p-4 border-2 rounded-lg text-sm">{{ message() }}</div>
      }

      @if (editing()) {
        <div class="comic-card">
          <h2 class="font-heading text-xl text-orange-primary mb-4">{{ form.id ? 'Edytuj pracownika' : 'Nowy pracownik' }}</h2>
          <form (submit)="saveItem($event)" class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-semibold mb-1">Imię i nazwisko</label>
                <input [(ngModel)]="form.full_name" name="full_name" required class="w-full px-4 py-2.5 border-2 border-ink rounded-lg" />
              </div>
              <div>
                <label class="block text-sm font-semibold mb-1">Stanowisko</label>
                <input [(ngModel)]="form.position" name="position" required class="w-full px-4 py-2.5 border-2 border-ink rounded-lg" />
              </div>
            </div>
            <div class="flex items-center gap-4">
              <label class="inline-flex items-center gap-2 cursor-pointer">
                <input type="checkbox" [(ngModel)]="form.is_management" name="is_management" class="w-5 h-5" />
                <span class="text-sm font-semibold">Członek dyrekcji</span>
              </label>
              <label class="text-sm font-semibold">Kolejność: 
                <input type="number" [(ngModel)]="form.display_order" name="display_order" class="w-20 px-2 py-1 border-2 border-ink rounded-lg ml-1" />
              </label>
            </div>
            <div>
              <label class="block text-sm font-semibold mb-1">Oddział / dział</label>
              <input [(ngModel)]="form.department" name="department" class="w-full px-4 py-2.5 border-2 border-ink rounded-lg" placeholder="np. Informatyka, Matematyka" />
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-semibold mb-1">Email</label>
                <input [(ngModel)]="form.email" name="email" class="w-full px-4 py-2.5 border-2 border-ink rounded-lg" />
              </div>
              <div>
                <label class="block text-sm font-semibold mb-1">Telefon</label>
                <input [(ngModel)]="form.phone" name="phone" class="w-full px-4 py-2.5 border-2 border-ink rounded-lg" />
              </div>
            </div>
            <div>
              <label class="block text-sm font-semibold mb-1">URL zdjęcia</label>
              <div class="flex gap-2">
                <input [(ngModel)]="form.photo_url" name="photo_url" class="flex-1 px-4 py-2.5 border-2 border-ink rounded-lg" placeholder="https://..." />
                <button type="button" (click)="fileInput.click()" class="comic-btn text-sm bg-surface text-ink">Upload</button>
                <input #fileInput type="file" accept="image/*" class="hidden" (change)="uploadPhoto($event)" />
              </div>
            </div>
            <div class="flex gap-3">
              <button type="submit" class="comic-btn-primary text-sm">Zapisz</button>
              <button type="button" (click)="toggleEditor(null)" class="comic-btn text-sm bg-surface text-ink">Anuluj</button>
            </div>
          </form>
        </div>
      }

      <div class="bg-surface comic-border overflow-hidden">
        <table class="w-full text-left text-sm">
          <thead>
            <tr class="bg-cream-dark border-b-2 border-ink">
              <th class="px-4 py-3 font-heading uppercase text-xs">Pracownik</th>
              <th class="px-4 py-3 font-heading uppercase text-xs">Stanowisko</th>
              <th class="px-4 py-3 font-heading uppercase text-xs">Typ</th>
              <th class="px-4 py-3 font-heading uppercase text-xs text-right">Akcje</th>
            </tr>
          </thead>
          <tbody>
            @for (item of items(); track item.id) {
              <tr class="border-b border-ink/10 hover:bg-cream transition-colors">
                <td class="px-4 py-3 font-medium">{{ item.full_name }}</td>
                <td class="px-4 py-3 text-gray-600">{{ item.position }}</td>
                <td class="px-4 py-3">
                  <span [class]="item.is_management ? 'badge-orange' : 'badge-petrol'">{{ item.is_management ? 'Dyrekcja' : 'Nauczyciel' }}</span>
                </td>
                <td class="px-4 py-3">
                  <div class="flex justify-end gap-2">
                    <button (click)="toggleEditor(item)" class="comic-btn text-xs !py-1.5 !px-3 bg-surface text-ink">Edytuj</button>
                    <button (click)="deleteItem(item)" class="comic-btn text-xs !py-1.5 !px-3 bg-red-50 text-red-600 !shadow-[2px_2px_0_#991b1b] !border-red-600">Usuń</button>
                  </div>
                </td>
              </tr>
            } @empty {
              <tr><td colspan="4" class="px-4 py-8 text-center text-gray-500">Brak pracowników</td></tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
})
export class StaffAdminComponent implements OnInit {
  items = signal<Staff[]>([]);
  editing = signal(false);
  message = signal<string | null>(null);
  messageType = signal<'success' | 'error'>('success');

  form = {
    id: '', full_name: '', position: '', department: '', email: '', phone: '', photo_url: '',
    display_order: 0, is_management: false,
  };

  constructor(private fb: FirebaseService) {}

  async ngOnInit() {
    await this.load();
  }

  async load() {
    this.items.set(await this.fb.listStaff());
  }

  toggleEditor(item: Staff | null) {
    if (item) {
      this.form = {
        id: item.id, full_name: item.full_name, position: item.position,
        department: item.department ?? '', email: item.email ?? '', phone: item.phone ?? '',
        photo_url: item.photo_url ?? '', display_order: item.display_order, is_management: item.is_management,
      };
    } else {
      this.form = { id: '', full_name: '', position: '', department: '', email: '', phone: '', photo_url: '', display_order: this.items().length + 1, is_management: false };
    }
    this.editing.set(true);
  }

  async saveItem(event: Event) {
    event.preventDefault();
    const payload: any = {
      full_name: this.form.full_name,
      position: this.form.position,
      department: this.form.department || null,
      email: this.form.email || null,
      phone: this.form.phone || null,
      photo_url: this.form.photo_url || null,
      display_order: this.form.display_order,
      is_management: this.form.is_management,
    };
    let error: any;
    try {
      await this.fb.saveStaff(payload, this.form.id || undefined);
    } catch (e) {
      error = e;
    }
    if (error) this.setMessage('Błąd: ' + error.message, 'error');
    else { this.setMessage('Zapisano.', 'success'); this.editing.set(false); await this.load(); }
  }

  async deleteItem(item: Staff) {
    if (!confirm(`Usunąć pracownika "${item.full_name}"?`)) return;
    try {
      await this.fb.deleteStaff(item.id);
    } catch (e: any) {
      this.setMessage('Błąd: ' + e.message, 'error');
      return;
    }
    this.setMessage('Usunięto.', 'success');
    await this.load();
  }

  async uploadPhoto(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    const path = `staff/${Date.now()}.${file.name.split('.').pop()}`;
    try {
      this.form.photo_url = await this.fb.uploadFile(path, file);
    } catch (e: any) {
      this.setMessage('Upload failed: ' + e.message, 'error');
    }
  }

  setMessage(msg: string, type: 'success' | 'error') {
    this.message.set(msg);
    this.messageType.set(type);
    setTimeout(() => this.message.set(null), 5000);
  }
}

import { Component, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../../../core/services/supabase.service';
import { Program } from '../../../core/models/database.types';

@Component({
  selector: 'app-programs-admin',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl text-ink mb-1">Kierunki kształcenia</h1>
          <p class="text-gray-500">Zarządzaj kierunkami i ich kolejnością wyświetlania</p>
        </div>
        <button (click)="toggleEditor(null)" class="comic-btn-primary text-sm">+ Dodaj kierunek</button>
      </div>

      @if (message()) {
        <div [class]="messageType() === 'error' ? 'bg-red-50 text-red-700 border-red-500' : 'bg-green-50 text-green-700 border-green-500'"
             class="p-4 border-2 rounded-lg text-sm">{{ message() }}</div>
      }

      @if (editing()) {
        <div class="comic-card">
          <h2 class="font-heading text-xl text-orange-primary mb-4">{{ form.id ? 'Edytuj kierunek' : 'Nowy kierunek' }}</h2>
          <form (submit)="saveItem($event)" class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-semibold mb-1">Nazwa kierunku</label>
                <input [(ngModel)]="form.title" name="title" required class="w-full px-4 py-2.5 border-2 border-ink rounded-lg focus:outline-none focus:border-petrol" />
              </div>
              <div>
                <label class="block text-sm font-semibold mb-1">Slug (URL)</label>
                <input [(ngModel)]="form.slug" name="slug" class="w-full px-4 py-2.5 border-2 border-ink rounded-lg focus:outline-none focus:border-petrol" placeholder="auto" />
              </div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label class="block text-sm font-semibold mb-1">Typ szkoły</label>
                <select [(ngModel)]="form.school_type" name="school_type" class="w-full px-4 py-2.5 border-2 border-ink rounded-lg bg-surface">
                  <option value="technikum">Technikum</option>
                  <option value="branzowa">Branżowa I stopnia</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-semibold mb-1">Kolejność</label>
                <input type="number" [(ngModel)]="form.display_order" name="display_order" class="w-full px-4 py-2.5 border-2 border-ink rounded-lg" />
              </div>
              <div class="flex items-end pb-2">
                <label class="inline-flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" [(ngModel)]="form.is_active" name="is_active" class="w-5 h-5" />
                  <span class="text-sm font-semibold">Aktywny</span>
                </label>
              </div>
            </div>
            <div>
              <label class="block text-sm font-semibold mb-1">Opis</label>
              <textarea [(ngModel)]="form.description" name="description" rows="3" class="w-full px-4 py-2.5 border-2 border-ink rounded-lg"></textarea>
            </div>
            <div>
              <label class="block text-sm font-semibold mb-1">Czego się uczysz?</label>
              <textarea [(ngModel)]="form.what_you_learn" name="what_you_learn" rows="3" class="w-full px-4 py-2.5 border-2 border-ink rounded-lg"></textarea>
            </div>
            <div>
              <label class="block text-sm font-semibold mb-1">Perspektywy pracy</label>
              <textarea [(ngModel)]="form.career_prospects" name="career_prospects" rows="3" class="w-full px-4 py-2.5 border-2 border-ink rounded-lg"></textarea>
            </div>
            <div>
              <label class="block text-sm font-semibold mb-1">URL grafiki</label>
              <div class="flex gap-2">
                <input [(ngModel)]="form.cover_image_url" name="cover_image_url" class="flex-1 px-4 py-2.5 border-2 border-ink rounded-lg" placeholder="https://..." />
                <button type="button" (click)="imgInput.click()" class="comic-btn text-sm bg-surface text-ink">Upload</button>
                <input #imgInput type="file" accept="image/*" class="hidden" (change)="uploadImage($event)" />
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
              <th class="px-4 py-3 font-heading uppercase text-xs">Kierunek</th>
              <th class="px-4 py-3 font-heading uppercase text-xs">Typ</th>
              <th class="px-4 py-3 font-heading uppercase text-xs">Kolejność</th>
              <th class="px-4 py-3 font-heading uppercase text-xs">Status</th>
              <th class="px-4 py-3 font-heading uppercase text-xs text-right">Akcje</th>
            </tr>
          </thead>
          <tbody>
            @for (item of items(); track item.id) {
              <tr class="border-b border-ink/10 hover:bg-cream transition-colors">
                <td class="px-4 py-3 font-medium">{{ item.title }}</td>
                <td class="px-4 py-3">
                  <span [class]="item.school_type === 'technikum' ? 'badge-petrol' : 'badge-orange'">{{ item.school_type === 'technikum' ? 'Technikum' : 'Branżowa' }}</span>
                </td>
                <td class="px-4 py-3 text-gray-500">{{ item.display_order }}</td>
                <td class="px-4 py-3">
                  <span [class]="item.is_active ? 'badge-petrol' : 'badge-yellow'">{{ item.is_active ? 'Aktywny' : 'Nieaktywny' }}</span>
                </td>
                <td class="px-4 py-3">
                  <div class="flex justify-end gap-2">
                    <button (click)="toggleEditor(item)" class="comic-btn text-xs !py-1.5 !px-3 bg-surface text-ink">Edytuj</button>
                    <button (click)="deleteItem(item)" class="comic-btn text-xs !py-1.5 !px-3 bg-red-50 text-red-600 !shadow-[2px_2px_0_#991b1b] !border-red-600">Usuń</button>
                  </div>
                </td>
              </tr>
            } @empty {
              <tr><td colspan="5" class="px-4 py-8 text-center text-gray-500">Brak kierunków</td></tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
})
export class ProgramsAdminComponent implements OnInit {
  items = signal<Program[]>([]);
  editing = signal(false);
  message = signal<string | null>(null);
  messageType = signal<'success' | 'error'>('success');

  form = {
    id: '',
    title: '',
    slug: '',
    description: '',
    what_you_learn: '',
    career_prospects: '',
    school_type: 'technikum',
    cover_image_url: '',
    display_order: 0,
    is_active: true,
  };

  constructor(private supabase: SupabaseService) {}

  async ngOnInit() {
    await this.load();
  }

  async load() {
    const { data } = await this.supabase.supabase
      .from('programs')
      .select('*')
      .order('display_order', { ascending: true });
    this.items.set((data as Program[]) ?? []);
  }

  toggleEditor(item: Program | null) {
    if (item) {
      this.form = {
        id: item.id,
        title: item.title,
        slug: item.slug,
        description: item.description,
        what_you_learn: item.what_you_learn,
        career_prospects: item.career_prospects,
        school_type: item.school_type,
        cover_image_url: item.cover_image_url ?? '',
        display_order: item.display_order,
        is_active: item.is_active,
      };
    } else {
      this.form = { id: '', title: '', slug: '', description: '', what_you_learn: '', career_prospects: '', school_type: 'technikum', cover_image_url: '', display_order: this.items().length + 1, is_active: true };
    }
    this.editing.set(true);
  }

  async saveItem(event: Event) {
    event.preventDefault();
    const slug = this.form.slug || this.form.title.toLowerCase().replace(/[^a-z0-9ąęśćżźół]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');

    const payload = {
      title: this.form.title,
      slug,
      description: this.form.description,
      what_you_learn: this.form.what_you_learn,
      career_prospects: this.form.career_prospects,
      school_type: this.form.school_type,
      cover_image_url: this.form.cover_image_url || null,
      display_order: this.form.display_order,
      is_active: this.form.is_active,
      updated_at: new Date().toISOString(),
    };

    const { error } = this.form.id
      ? await this.supabase.supabase.from('programs').update(payload).eq('id', this.form.id)
      : await this.supabase.supabase.from('programs').insert([payload]);

    if (error) {
      this.setMessage('Błąd: ' + error.message, 'error');
    } else {
      this.setMessage('Zapisano.', 'success');
      this.editing.set(false);
      await this.load();
    }
  }

  async deleteItem(item: Program) {
    if (!confirm(`Usunąć kierunek "${item.title}"?`)) return;
    const { error } = await this.supabase.supabase.from('programs').delete().eq('id', item.id);
    if (error) this.setMessage('Błąd: ' + error.message, 'error');
    else { this.setMessage('Usunięto.', 'success'); await this.load(); }
  }

  async uploadImage(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    const path = `programs/${Date.now()}.${file.name.split('.').pop()}`;
    const { error } = await this.supabase.supabase.storage.from('media').upload(path, file);
    if (error) { this.setMessage('Upload failed: ' + error.message, 'error'); return; }
    const { data } = this.supabase.supabase.storage.from('media').getPublicUrl(path);
    this.form.cover_image_url = data.publicUrl;
  }

  setMessage(msg: string, type: 'success' | 'error') {
    this.message.set(msg);
    this.messageType.set(type);
    setTimeout(() => this.message.set(null), 5000);
  }
}

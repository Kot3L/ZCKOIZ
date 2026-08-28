import { Component, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { SupabaseService } from '../../../core/services/supabase.service';
import { News } from '../../../core/models/database.types';

@Component({
  selector: 'app-news-admin',
  standalone: true,
  imports: [FormsModule, DatePipe],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl text-ink mb-1">Aktualności</h1>
          <p class="text-gray-500">Zarządzaj treściami na stronie głównej i liście aktualności</p>
        </div>
        <button (click)="toggleEditor(null)" class="comic-btn-primary text-sm">
          + Dodaj aktualność
        </button>
      </div>

      @if (message()) {
        <div [class]="messageType() === 'error' ? 'bg-red-50 text-red-700 border-red-500' : 'bg-green-50 text-green-700 border-green-500'"
             class="p-4 border-2 rounded-lg text-sm">
          {{ message() }}
        </div>
      }

      @if (editing()) {
        <div class="comic-card">
          <h2 class="font-heading text-xl text-orange-primary mb-4">
            {{ form.id ? 'Edytuj aktualność' : 'Nowa aktualność' }}
          </h2>
          <form (submit)="saveItem($event)" class="space-y-4">
            <div>
              <label class="block text-sm font-semibold mb-1">Tytuł</label>
              <input [(ngModel)]="form.title" name="title" required class="w-full px-4 py-2.5 border-2 border-ink rounded-lg focus:outline-none focus:border-petrol" />
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-semibold mb-1">Slug (URL)</label>
                <input [(ngModel)]="form.slug" name="slug" class="w-full px-4 py-2.5 border-2 border-ink rounded-lg focus:outline-none focus:border-petrol" placeholder="auto" />
              </div>
              <div>
                <label class="block text-sm font-semibold mb-1">Status</label>
                <select [(ngModel)]="form.status" name="status" class="w-full px-4 py-2.5 border-2 border-ink rounded-lg bg-surface">
                  <option value="published">Opublikowana</option>
                  <option value="draft">Szkic</option>
                </select>
              </div>
            </div>
            <div>
              <label class="block text-sm font-semibold mb-1">Zajawka (excerpt)</label>
              <textarea [(ngModel)]="form.excerpt" name="excerpt" rows="2" class="w-full px-4 py-2.5 border-2 border-ink rounded-lg focus:outline-none focus:border-petrol"></textarea>
            </div>
            <div>
              <label class="block text-sm font-semibold mb-1">Treść</label>
              <textarea [(ngModel)]="form.content" name="content" rows="8" class="w-full px-4 py-2.5 border-2 border-ink rounded-lg focus:outline-none focus:border-petrol"></textarea>
            </div>
            <div>
              <label class="block text-sm font-semibold mb-1">URL obrazka wyróżniającego</label>
              <div class="flex gap-2">
                <input [(ngModel)]="form.cover_image_url" name="cover_image_url" class="flex-1 px-4 py-2.5 border-2 border-ink rounded-lg focus:outline-none focus:border-petrol" placeholder="https://..." />
                <button type="button" (click)="fileInput.click()" class="comic-btn text-sm bg-surface text-ink">Upload</button>
                <input #fileInput type="file" accept="image/*" class="hidden" (change)="uploadCoverImage($event)" />
              </div>
            </div>
            <div class="flex gap-3 pt-2">
              <button type="submit" class="comic-btn-primary text-sm">Zapisz</button>
              <button type="button" (click)="toggleEditor(null)" class="comic-btn text-sm bg-surface text-ink">Anuluj</button>
            </div>
          </form>
        </div>
      }

      <!-- News List -->
      <div class="bg-surface comic-border overflow-hidden">
        <table class="w-full text-left text-sm">
          <thead>
            <tr class="bg-cream-dark border-b-2 border-ink">
              <th class="px-4 py-3 font-heading uppercase text-xs">Tytuł</th>
              <th class="px-4 py-3 font-heading uppercase text-xs">Status</th>
              <th class="px-4 py-3 font-heading uppercase text-xs hidden md:table-cell">Data</th>
              <th class="px-4 py-3 font-heading uppercase text-xs text-right">Akcje</th>
            </tr>
          </thead>
          <tbody>
            @for (item of items(); track item.id) {
              <tr class="border-b border-ink/10 hover:bg-cream transition-colors">
                <td class="px-4 py-3 font-medium">{{ item.title }}</td>
                <td class="px-4 py-3">
                  <span [class]="item.status === 'published' ? 'badge-petrol' : 'badge-yellow'">{{ item.status === 'published' ? 'Opublikowana' : 'Szkic' }}</span>
                </td>
                <td class="px-4 py-3 hidden md:table-cell text-gray-500">{{ item.published_at || item.created_at | date:'dd.MM.yyyy' }}</td>
                <td class="px-4 py-3">
                  <div class="flex justify-end gap-2">
                    <button (click)="toggleEditor(item)" class="comic-btn text-xs !py-1.5 !px-3 bg-surface text-ink">Edytuj</button>
                    <button (click)="deleteItem(item)" class="comic-btn text-xs !py-1.5 !px-3 bg-red-50 text-red-600 !shadow-[2px_2px_0_#991b1b] !border-red-600">Usuń</button>
                  </div>
                </td>
              </tr>
            } @empty {
              <tr><td colspan="4" class="px-4 py-8 text-center text-gray-500">Brak aktualności</td></tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
})
export class NewsAdminComponent implements OnInit {
  items = signal<News[]>([]);
  editing = signal(false);
  message = signal<string | null>(null);
  messageType = signal<'success' | 'error'>('success');

  form = {
    id: '',
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    cover_image_url: '',
    status: 'published' as 'published' | 'draft',
  };

  constructor(private supabase: SupabaseService) {}

  async ngOnInit() {
    await this.load();
  }

  async load() {
    const { data } = await this.supabase.supabase
      .from('news')
      .select('*')
      .order('created_at', { ascending: false });
    this.items.set((data as News[]) ?? []);
  }

  toggleEditor(item: News | null) {
    if (item) {
      this.form = {
        id: item.id,
        title: item.title,
        slug: item.slug,
        excerpt: item.excerpt,
        content: item.content,
        cover_image_url: item.cover_image_url ?? '',
        status: item.status,
      };
    } else {
      this.form = { id: '', title: '', slug: '', excerpt: '', content: '', cover_image_url: '', status: 'published' };
    }
    this.editing.set(!!this.form.id || !item);
    this.editing.set(true);
  }

  async saveItem(event: Event) {
    event.preventDefault();
    this.message.set(null);

    const slug = this.form.slug || this.form.title.toLowerCase().replace(/[^a-z0-9ąęśćżźół]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');

    let error: any;

    if (this.form.id) {
      const payload: any = {
        title: this.form.title,
        slug,
        excerpt: this.form.excerpt,
        content: this.form.content,
        cover_image_url: this.form.cover_image_url || null,
        status: this.form.status,
        updated_at: new Date().toISOString(),
      };
      if (this.form.status === 'published') {
        payload.published_at = new Date().toISOString();
      }
      const { error: e } = await this.supabase.supabase
        .from('news')
        .update(payload)
        .eq('id', this.form.id);
      error = e;
    } else {
      const payload: any = {
        title: this.form.title,
        slug,
        excerpt: this.form.excerpt,
        content: this.form.content,
        cover_image_url: this.form.cover_image_url || null,
        status: this.form.status,
      };
      if (this.form.status === 'published') {
        payload.published_at = new Date().toISOString();
      }
      const { error: e } = await this.supabase.supabase
        .from('news')
        .insert([payload]);
      error = e;
    }

    if (error) {
      this.setMessage('Błąd zapisu: ' + error.message, 'error');
    } else {
      this.setMessage('Zapisano pomyślnie.', 'success');
      this.editing.set(false);
      await this.load();
    }
  }

  async deleteItem(item: News) {
    if (!confirm(`Czy na pewno usunąć aktualność "${item.title}"?`)) return;
    const { error } = await this.supabase.supabase.from('news').delete().eq('id', item.id);
    if (error) {
      this.setMessage('Błąd usuwania: ' + error.message, 'error');
    } else {
      this.setMessage('Usunięto.', 'success');
      await this.load();
    }
  }

  async uploadCoverImage(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    const ext = file.name.split('.').pop();
    const path = `news/${Date.now()}.${ext}`;
    const { error: uploadError } = await this.supabase.supabase.storage
      .from('media')
      .upload(path, file);
    if (uploadError) {
      this.setMessage('Upload failed: ' + uploadError.message, 'error');
      return;
    }
    const { data } = this.supabase.supabase.storage.from('media').getPublicUrl(path);
    this.form.cover_image_url = data.publicUrl;
  }

  setMessage(msg: string, type: 'success' | 'error') {
    this.message.set(msg);
    this.messageType.set(type);
    setTimeout(() => this.message.set(null), 5000);
  }
}

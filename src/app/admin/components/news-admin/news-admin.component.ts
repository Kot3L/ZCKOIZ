import { Component, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { FirebaseService } from '../../../core/services/firebase.service';
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
            <div>
              <label class="block text-sm font-semibold mb-1">Treść</label>
              <textarea [(ngModel)]="form.content" name="content" rows="8" class="w-full px-4 py-2.5 border-2 border-ink rounded-lg focus:outline-none focus:border-petrol"></textarea>
            </div>
            <div>
              <label class="block text-sm font-semibold mb-1">Obrazek wyróżniający</label>
              <div class="flex gap-2">
                <input [(ngModel)]="form.cover_image_url" name="cover_image_url" class="flex-1 px-4 py-2.5 border-2 border-ink rounded-lg focus:outline-none focus:border-petrol" placeholder="https://... lub wgraj plik" />
                <button type="button" (click)="fileInput.click()" class="comic-btn text-sm bg-surface text-ink">Upload</button>
                <input #fileInput type="file" accept="image/*" class="hidden" (change)="uploadCoverImage($event)" />
              </div>
              @if (form.cover_image_url) {
                <div class="mt-3">
                  <img [src]="form.cover_image_url" class="max-h-48 w-auto border-2 border-ink rounded-lg object-cover shadow-[2px_2px_0_var(--color-ink)]" alt="Podgląd obrazka" />
                </div>
              }
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
              <th class="px-4 py-3 font-heading uppercase text-xs hidden md:table-cell">Data</th>
              <th class="px-4 py-3 font-heading uppercase text-xs text-right">Akcje</th>
            </tr>
          </thead>
          <tbody>
            @for (item of items(); track item.id) {
              <tr class="border-b border-ink/10 hover:bg-cream transition-colors">
                <td class="px-4 py-3 font-medium">{{ item.title }}</td>
                <td class="px-4 py-3 hidden md:table-cell text-gray-500">{{ item.created_at | date:'dd.MM.yyyy' }}</td>
                <td class="px-4 py-3">
                  <div class="flex justify-end gap-2">
                    <button (click)="toggleEditor(item)" class="comic-btn text-xs !py-1.5 !px-3 bg-surface text-ink">Edytuj</button>
                    <button (click)="deleteItem(item)" class="comic-btn text-xs !py-1.5 !px-3 bg-red-50 text-red-600 !shadow-[2px_2px_0_#991b1b] !border-red-600">Usuń</button>
                  </div>
                </td>
              </tr>
            } @empty {
              <tr><td colspan="3" class="px-4 py-8 text-center text-gray-500">Brak aktualności</td></tr>
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
    content: '',
    cover_image_url: '',
  };

  constructor(private fb: FirebaseService) {}

  async ngOnInit() {
    await this.load();
  }

  async load() {
    this.items.set(await this.fb.listNews());
  }

  toggleEditor(item: News | null) {
    if (item) {
      this.form = {
        id: item.id,
        title: item.title,
        content: item.content,
        cover_image_url: item.cover_image_url ?? '',
      };
    } else {
      this.form = { id: '', title: '', content: '', cover_image_url: '' };
    }
    this.editing.set(true);
  }

  private slugify(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9ąęśćżźół]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  async saveItem(event: Event) {
    event.preventDefault();
    this.message.set(null);

    const now = new Date().toISOString();
    let error: any;

    const payload: any = {
      title: this.form.title,
      content: this.form.content,
      cover_image_url: this.form.cover_image_url || null,
      slug: this.slugify(this.form.title),
      status: 'published',
      published_at: now,
    };

    try {
      if (this.form.id) {
        await this.fb.saveNews(payload, this.form.id);
      } else {
        await this.fb.saveNews(payload);
      }
    } catch (e) {
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
    try {
      await this.fb.deleteNews(item.id);
    } catch (e: any) {
      this.setMessage('Błąd usuwania: ' + e.message, 'error');
      return;
    }
    this.setMessage('Usunięto.', 'success');
    await this.load();
  }

  async uploadCoverImage(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    const ext = file.name.split('.').pop();
    const path = `news/${Date.now()}.${ext}`;
    try {
      this.form.cover_image_url = await this.fb.uploadFile(path, file);
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

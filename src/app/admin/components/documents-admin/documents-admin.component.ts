import { Component, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FirebaseService } from '../../../core/services/firebase.service';
import { Document } from '../../../core/models/database.types';

@Component({
  selector: 'app-documents-admin',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl text-ink mb-1">Dokumenty</h1>
          <p class="text-gray-500">Upload i zarządzanie plikami PDF do pobrania</p>
        </div>
        <button (click)="toggleEditor(null)" class="comic-btn-primary text-sm">+ Dodaj dokument</button>
      </div>

      @if (message()) {
        <div [class]="messageType() === 'error' ? 'bg-red-50 text-red-700 border-red-500' : 'bg-green-50 text-green-700 border-green-500'"
             class="p-4 border-2 rounded-lg text-sm">{{ message() }}</div>
      }

      @if (editing()) {
        <div class="comic-card">
          <h2 class="font-heading text-xl text-orange-primary mb-4">{{ form.id ? 'Edytuj dokument' : 'Nowy dokument' }}</h2>
          <form (submit)="saveItem($event)" class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-semibold mb-1">Tytuł</label>
                <input [(ngModel)]="form.title" name="title" required class="w-full px-4 py-2.5 border-2 border-ink rounded-lg" />
              </div>
              <div>
                <label class="block text-sm font-semibold mb-1">Kategoria</label>
                <select [(ngModel)]="form.category" name="category" class="w-full px-4 py-2.5 border-2 border-ink rounded-lg bg-surface">
                  <option>Rekrutacja</option>
                  <option>Statut</option>
                  <option>Regulaminy</option>
                  <option>Szkolenia</option>
                  <option>Współpraca</option>
                  <option>Inne</option>
                </select>
              </div>
            </div>
            <div>
              <label class="block text-sm font-semibold mb-1">Opis</label>
              <input [(ngModel)]="form.description" name="description" class="w-full px-4 py-2.5 border-2 border-ink rounded-lg" />
            </div>
            <div>
              <label class="block text-sm font-semibold mb-1">Plik PDF</label>
              <div class="flex gap-2">
                <input [(ngModel)]="form.file_url" name="file_url" class="flex-1 px-4 py-2.5 border-2 border-ink rounded-lg" placeholder="URL pliku" />
                <button type="button" (click)="fileInput.click()" class="comic-btn text-sm bg-surface text-ink">Upload PDF</button>
                <input #fileInput type="file" accept="application/pdf" class="hidden" (change)="uploadFile($event)" />
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
              <th class="px-4 py-3 font-heading uppercase text-xs">Dokument</th>
              <th class="px-4 py-3 font-heading uppercase text-xs">Kategoria</th>
              <th class="px-4 py-3 font-heading uppercase text-xs text-right">Akcje</th>
            </tr>
          </thead>
          <tbody>
            @for (item of items(); track item.id) {
              <tr class="border-b border-ink/10 hover:bg-cream transition-colors">
                <td class="px-4 py-3 font-medium">{{ item.title }}</td>
                <td class="px-4 py-3"><span class="badge-petrol">{{ item.category }}</span></td>
                <td class="px-4 py-3">
                  <div class="flex justify-end gap-2">
                    <a [href]="item.file_url" target="_blank" class="comic-btn text-xs !py-1.5 !px-3 bg-surface text-ink">Otwórz</a>
                    <button (click)="editItem(item)" class="comic-btn text-xs !py-1.5 !px-3 bg-surface text-ink">Edytuj</button>
                    <button (click)="deleteItem(item)" class="comic-btn text-xs !py-1.5 !px-3 bg-red-50 text-red-600 !shadow-[2px_2px_0_#991b1b] !border-red-600">Usuń</button>
                  </div>
                </td>
              </tr>
            } @empty {
              <tr><td colspan="3" class="px-4 py-8 text-center text-gray-500">Brak dokumentów</td></tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
})
export class DocumentsAdminComponent implements OnInit {
  items = signal<Document[]>([]);
  editing = signal(false);
  message = signal<string | null>(null);
  messageType = signal<'success' | 'error'>('success');

  form = { id: '', title: '', description: '', file_url: '', category: 'Rekrutacja' };

  constructor(private fb: FirebaseService) {}

  async ngOnInit() {
    await this.load();
  }

  async load() {
    this.items.set(await this.fb.listDocuments());
  }

  toggleEditor(item: Document | null) {
    if (item) {
      this.form = { id: item.id, title: item.title, description: item.description ?? '', file_url: item.file_url, category: item.category };
    } else {
      this.form = { id: '', title: '', description: '', file_url: '', category: 'Rekrutacja' };
    }
    this.editing.set(true);
  }

  editItem(item: Document) {
    this.toggleEditor(item);
  }

  async saveItem(event: Event) {
    event.preventDefault();
    const payload = { title: this.form.title, description: this.form.description || null, file_url: this.form.file_url, category: this.form.category };
    try {
      await this.fb.saveDocument(payload as Document, this.form.id || undefined);
      this.setMessage('Zapisano.', 'success');
      this.editing.set(false);
      await this.load();
    } catch (e: any) {
      this.setMessage('Błąd: ' + (e.message ?? e), 'error');
    }
  }

  async deleteItem(item: Document) {
    if (!confirm(`Usunąć dokument "${item.title}"?`)) return;
    try {
      await this.fb.deleteDocument(item.id);
      this.setMessage('Usunięto.', 'success');
      await this.load();
    } catch (e: any) {
      this.setMessage('Błąd: ' + (e.message ?? e), 'error');
    }
  }

  async uploadFile(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    const path = `documents/${Date.now()}.pdf`;
    try {
      this.form.file_url = await this.fb.uploadFile(path, file);
    } catch (e: any) {
      this.setMessage('Upload failed: ' + (e.message ?? e), 'error');
    }
  }

  setMessage(msg: string, type: 'success' | 'error') {
    this.message.set(msg);
    this.messageType.set(type);
    setTimeout(() => this.message.set(null), 5000);
  }
}

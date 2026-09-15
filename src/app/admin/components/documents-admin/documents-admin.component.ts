import { Component, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { SkeletonComponent } from '../../../shared/components/skeleton/skeleton.component';
import { FirebaseService } from '../../../core/services/firebase.service';
import { Document } from '../../../core/models/database.types';
import { dataUrlToBlobUrl } from '../../../shared/utils/pdf.utils';

@Component({
  selector: 'app-documents-admin',
  standalone: true,
  imports: [FormsModule, SkeletonComponent],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl text-ink mb-1">Dokumenty</h1>
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
              <label class="block text-sm font-semibold mb-1">Plik PDF lub ZIP</label>
              <div class="flex gap-2">
                <input [(ngModel)]="form.file_url" name="file_url" class="flex-1 px-4 py-2.5 border-2 border-ink rounded-lg" placeholder="URL pliku" />
                <button type="button" (click)="fileInput.click()" class="comic-btn text-sm bg-surface text-ink">Prześlij</button>
                <input #fileInput type="file" accept="application/pdf,.zip,application/zip" class="hidden" (change)="uploadFile($event)" />
              </div>
              @if (pendingPdf() || form.file_url) {
                <div class="mt-4 border-2 border-ink rounded-lg p-3 bg-cream-dark">
                  <div class="flex items-center justify-between gap-3 mb-3">
                    <div class="min-w-0">
                      <p class="font-semibold text-sm truncate">{{ currentFileName() }}</p>
                      @if (pendingPdf()) {
                        <p class="text-xs text-gray-500">{{ formatFileSize(pendingPdf()!.data) }}</p>
                      }
                    </div>
                    <div class="flex items-center gap-2 shrink-0">
                      <span class="badge-petrol">{{ isPdf(currentFileName()) ? 'PDF' : 'ZIP' }}</span>
                      <button type="button" (click)="removeSelectedFile(fileInput)" class="comic-icon-btn !w-7 !h-7 !min-w-0 !p-0 text-red-600 !border-red-600 !shadow-[2px_2px_0_#991b1b]" aria-label="Usuń wybrany plik" title="Usuń plik">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 6l12 12M18 6L6 18"/></svg>
                      </button>
                    </div>
                  </div>
                  @if (isPdf(currentFileName()) && pdfPreviewSrc()) {
                    <iframe [src]="pdfPreviewSrc()" title="Podgląd PDF" class="w-full h-64 bg-white border border-ink rounded"></iframe>
                  } @else {
                    <p class="text-sm text-gray-600">{{ isPdf(currentFileName()) ? 'Podgląd dostępny po wczytaniu pliku.' : 'Plik ZIP jest gotowy do zapisania.' }}</p>
                  }
                </div>
              }
            </div>
            <div class="flex gap-3">
              <button type="submit" class="comic-btn-primary text-sm">Zapisz</button>
              <button type="button" (click)="editing.set(false)" class="comic-btn text-sm bg-surface text-ink">Anuluj</button>
            </div>
          </form>
        </div>
      }

      @if (loading()) {
        <div class="bg-surface comic-border overflow-hidden" aria-busy="true">
          <div class="p-5 space-y-4">
            @for (r of [1,2,3,4,5]; track r) {
              <div class="space-y-2">
                <app-skeleton type="title" [style.width]="'35%'"/>
                <app-skeleton type="text" [style.width]="'20%'"/>
              </div>
            }
          </div>
        </div>
      } @else {
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
            @for (item of listItems(); track item.id) {
              <tr class="border-b border-ink/10 hover:bg-cream transition-colors">
                <td class="px-4 py-3 font-medium">{{ item.title }}</td>
                <td class="px-4 py-3"><span class="badge-petrol">{{ item.category }}</span></td>
                <td class="px-4 py-3">
                  <div class="flex justify-end gap-2">
                    <button type="button" (click)="openDocument(item)" class="comic-btn text-xs !py-1.5 !px-3 bg-surface text-ink">Otwórz</button>
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
      }
    </div>
  `,
})
export class DocumentsAdminComponent implements OnInit {
  items = signal<Document[]>([]);
  editing = signal(false);
  message = signal<string | null>(null);
  messageType = signal<'success' | 'error'>('success');
  loading = signal(true);

  form = { id: '', title: '', description: '', file_url: '', file_name: '', category: 'Rekrutacja' };
  pendingPdf = signal<{ data: string; name: string } | null>(null);

  constructor(
    private fb: FirebaseService,
    private sanitizer: DomSanitizer,
  ) {}

  async ngOnInit() {
    try {
      await this.load();
    } finally {
      this.loading.set(false);
    }
  }

  async load() {
    this.items.set(await this.fb.listDocuments());
  }

  listItems(): Document[] {
    const editingId = this.editing() ? this.form.id : '';
    return editingId ? this.items().filter((item) => item.id !== editingId) : this.items();
  }

  toggleEditor(item: Document | null) {
    if (item) {
      this.form = { id: item.id, title: item.title, description: item.description ?? '', file_url: item.file_url, file_name: item.file_name ?? '', category: item.category };
    } else {
      this.form = { id: '', title: '', description: '', file_url: '', file_name: '', category: 'Rekrutacja' };
    }
    this.pendingPdf.set(null);
    this.editing.set(true);
    if (item?.file_name && !item.file_url) this.loadExistingFile(item.id, item.file_name);
  }

  editItem(item: Document) {
    this.toggleEditor(item);
  }

  async saveItem(event: Event) {
    event.preventDefault();
    const payload = { title: this.form.title, description: this.form.description || null, file_url: this.form.file_url, file_name: this.form.file_name || null, category: this.form.category };
    if (!this.form.file_url && !this.pendingPdf()) {
      this.setMessage('Dodaj plik PDF lub ZIP przed zapisaniem dokumentu.', 'error');
      return;
    }
    try {
      const id = await this.fb.saveDocument(payload as Document, this.form.id || undefined);
      if (!id) throw new Error('Nie udało się zapisać dokumentu.');
      const pdf = this.pendingPdf();
      if (pdf) await this.fb.saveDocumentPdf(id, pdf.data, pdf.name);
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
      await this.fb.deleteDocumentPdf(item.id);
      this.setMessage('Usunięto.', 'success');
      await this.load();
    } catch (e: any) {
      this.setMessage('Błąd: ' + (e.message ?? e), 'error');
    }
  }

  async openDocument(item: Document): Promise<void> {
    try {
      if (item.file_url) {
        window.open(item.file_url, '_blank', 'noopener');
        return;
      }

      const popup = window.open('', '_blank');
      if (!popup) throw new Error('Przeglądarka zablokowała nowe okno. Zezwól na wyskakujące okna dla tej strony.');
      const storedFile = await this.fb.getDocumentPdf(item.id);
      if (!storedFile?.data) throw new Error('Nie znaleziono pliku dokumentu.');
      popup.location.href = dataUrlToBlobUrl(storedFile.data);
    } catch (e: any) {
      this.setMessage('Nie udało się otworzyć pliku: ' + (e.message ?? e), 'error');
    }
  }

  async uploadFile(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    if (file.type !== 'application/pdf' && file.type !== 'application/zip' && !file.name.toLowerCase().endsWith('.zip')) {
      this.setMessage('Dozwolone są tylko pliki PDF i ZIP.', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const data = typeof reader.result === 'string' ? reader.result : null;
      if (!data) {
        this.setMessage('Nie udało się odczytać pliku PDF.', 'error');
        return;
      }
      this.form.file_url = '';
      this.form.file_name = file.name;
      this.pendingPdf.set({ data, name: file.name });
      this.setMessage('Plik dodany. Zapisz dokument, aby go opublikować.', 'success');
    };
    reader.onerror = () => this.setMessage('Nie udało się odczytać pliku.', 'error');
    reader.readAsDataURL(file);
  }

  isPdf(name: string): boolean {
    return name.toLowerCase().endsWith('.pdf');
  }

  formatFileSize(dataUrl: string): string {
    const base64 = dataUrl.split(',')[1] ?? '';
    const bytes = Math.max(0, Math.round(base64.length * 0.75));
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  pdfPreviewSrc(): SafeResourceUrl | null {
    const file = this.pendingPdf();
    if (file && this.isPdf(file.name)) {
      return this.sanitizer.bypassSecurityTrustResourceUrl(file.data);
    }
    if (this.form.file_url && this.isPdf(this.form.file_name || this.form.file_url)) {
      return this.sanitizer.bypassSecurityTrustResourceUrl(this.form.file_url);
    }
    return null;
  }

  removeSelectedFile(input: HTMLInputElement): void {
    input.value = '';
    this.pendingPdf.set(null);
    this.form.file_url = '';
    this.form.file_name = '';
  }

  currentFileName(): string {
    return this.pendingPdf()?.name || this.form.file_name || this.form.file_url.split('/').pop() || 'Dokument';
  }

  async loadExistingFile(id: string, name: string): Promise<void> {
    const file = await this.fb.getDocumentPdf(id);
    if (file && this.form.id === id) {
      this.pendingPdf.set({ data: file.data, name: name || file.name });
    }
  }

  setMessage(msg: string, type: 'success' | 'error') {
    this.message.set(msg);
    this.messageType.set(type);
    setTimeout(() => this.message.set(null), 5000);
  }
}

import { Component, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { SkeletonComponent } from '../../../shared/components/skeleton/skeleton.component';
import { FirebaseService } from '../../../core/services/firebase.service';
import { News, GalleryAlbum } from '../../../core/models/database.types';
import { dataUrlToBlobUrl, revokeBlobUrl, fileNameFromUrl } from '../../../shared/utils/pdf.utils';

@Component({
  selector: 'app-news-admin',
  standalone: true,
  imports: [FormsModule, DatePipe, SkeletonComponent],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl text-ink mb-1">Aktualności</h1>
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
              <label class="block text-sm font-semibold mb-1">Obrazek wyróżniający (URL)</label>
              <input [(ngModel)]="form.cover_image_url" name="cover_image_url" class="w-full px-4 py-2.5 border-2 border-ink rounded-lg focus:outline-none focus:border-petrol" placeholder="https://..." />
              <p class="text-xs text-gray-500 mt-1">Wklej bezpośredni link do obrazka (np. .jpg / .png).</p>
              @if (form.cover_image_url) {
                <div class="mt-3 relative inline-block group">
                  <img [src]="form.cover_image_url" class="max-h-48 w-auto border-2 border-ink rounded-lg object-cover shadow-[2px_2px_0_var(--color-ink)]" alt="Podgląd obrazka" />
                  <button type="button" (click)="removeCoverImage()" title="Usuń zdjęcie"
                    class="absolute -top-2 -right-2 w-6 h-6 bg-red-600 text-white rounded-full text-xs font-bold hidden group-hover:flex items-center justify-center border border-ink">×</button>
                </div>
              }
            </div>
            <div>
              <label class="block text-sm font-semibold mb-1">Zdjęcia pod tekstem (URL)</label>
              <div class="space-y-3">
                @for (img of form.content_images; track $index) {
                  <div class="flex gap-3 items-center">
                    <div class="relative group shrink-0">
                      @if (form.content_images[$index].trim()) {
                        <img [src]="form.content_images[$index]" class="w-20 h-16 object-cover rounded border-2 border-ink" alt="Podgląd" />
                        <button type="button" (click)="removeContentImage($index)" title="Usuń zdjęcie"
                          class="absolute -top-2 -right-2 w-6 h-6 bg-red-600 text-white rounded-full text-xs font-bold hidden group-hover:flex items-center justify-center border border-ink">×</button>
                      } @else {
                        <div class="w-20 h-16 rounded border-2 border-dashed border-ink/40 flex items-center justify-center text-gray-400 text-2xl">+</div>
                      }
                    </div>
                    <input [(ngModel)]="form.content_images[$index]" [name]="'content_images_' + $index"
                      class="flex-1 px-3 py-2 text-sm border-2 border-ink rounded-lg focus:outline-none focus:border-petrol" placeholder="https://..." />
                  </div>
                }
              </div>
              <button type="button" (click)="addContentImage()"
                class="comic-btn text-sm bg-surface text-ink mt-3">+ Dodaj zdjęcie</button>
            </div>
            <div>
              <label class="block text-sm font-semibold mb-1">Filmy YouTube</label>
              <div class="space-y-3">
                @for (link of form.youtube_urls; track $index) {
                  <div class="flex gap-3 items-center">
                    <div class="shrink-0 w-9">
                      <svg class="w-9 h-6 rounded" viewBox="0 0 24 24"><path fill="#FF0000" d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                    </div>
                    <input [(ngModel)]="form.youtube_urls[$index]" [name]="'youtube_' + $index"
                      class="flex-1 px-3 py-2 text-sm border-2 border-ink rounded-lg focus:outline-none focus:border-petrol" placeholder="https://www.youtube.com/watch?v=..." />
                    <button type="button" (click)="removeYoutube($index)" title="Usuń film"
                      class="w-7 h-7 shrink-0 bg-red-600 text-white rounded-full text-sm font-bold border border-ink">×</button>
                  </div>
                }
              </div>
              <button type="button" (click)="addYoutube()"
                class="comic-btn text-sm bg-surface text-ink mt-3">+ Dodaj film YouTube</button>
              <p class="text-xs text-gray-500 mt-1">Wklej link do filmu — zostanie osadzony w artykule (np. https://www.youtube.com/watch?v=XXXXX lub https://youtu.be/XXXXX).</p>
            </div>
            <div>
              <label class="block text-sm font-semibold mb-1">Plik PDF do pobrania</label>
              @if (form.pdf_url || pdfDataUrl()) {
                <div class="border-2 border-ink rounded-lg bg-surface overflow-hidden">
                  <div class="flex items-center justify-between gap-3 px-3 py-2.5 border-b-2 border-ink">
                    <span class="inline-flex items-center gap-2 text-sm font-semibold text-ink min-w-0">
                      <svg class="w-5 h-5 shrink-0 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                      <span class="truncate">{{ form.pdf_name || fileNameFromUrl(form.pdf_url!, 'plik.pdf') }}</span>
                    </span>
                    <span class="inline-flex items-center gap-2 shrink-0">
                      <a [href]="pdfHref()" target="_blank" rel="noopener" title="Otwórz / pobierz"
                        class="text-xs font-semibold text-petrol hover:underline">Otwórz</a>
                      <button type="button" (click)="removePdf()" title="Usuń plik"
                        class="w-6 h-6 bg-red-600 text-white rounded-full text-xs font-bold border border-ink">×</button>
                    </span>
                  </div>
                  @if (pdfPreviewSrc()) {
                    <iframe [src]="pdfPreviewSrc()" title="Podgląd PDF" class="w-full h-72 bg-white"></iframe>
                  }
                </div>
                <p class="text-xs text-gray-500 mt-1">Plik jest zapisywany w bazie danych. Po usunięciu (×) możesz dodać inny.</p>
              } @else {
                <div class="flex gap-2">
                  <input [(ngModel)]="form.pdf_url" name="pdf_url" placeholder="URL pliku PDF (np. https://.../plik.pdf)"
                    class="flex-1 px-4 py-2.5 border-2 border-ink rounded-lg focus:outline-none focus:border-petrol" />
                  <button type="button" (click)="pdfInput.click()" class="comic-btn text-sm bg-surface text-ink shrink-0">Upload PDF</button>
                  <input #pdfInput type="file" accept="application/pdf" class="hidden" (change)="uploadPdf($event)" />
                </div>
                <p class="text-xs text-gray-500 mt-1">Wklej link do pliku albo wgraj PDF ze swojego urządzenia. Plik zostanie zapisany w bazie danych i pokazany w panelu oraz artykule.</p>
              }
            </div>
            <div>
              <label class="block text-sm font-semibold mb-1">Album ze zdjęciami (karuzela)</label>
              <div class="flex gap-2 items-center">
                <select [(ngModel)]="form.album_id" name="album_id" class="flex-1 px-4 py-2.5 border-2 border-ink rounded-lg bg-surface">
                  <option [ngValue]="null">— bez albumu —</option>
                  @for (album of albums(); track album.id) {
                    <option [ngValue]="album.id">{{ album.title }}</option>
                  }
                </select>
                @if (form.album_id) {
                  <button type="button" (click)="form.album_id = null"
                    class="comic-btn-danger text-xs !py-2 !px-3 shrink-0">Usuń album</button>
                }
              </div>
              <p class="text-xs text-gray-500 mt-1">Wybrany album zostanie wyświetlony w aktualności jako karuzela zdjęć.</p>
            </div>
            <div class="flex gap-3 pt-2">
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
              <div class="flex items-center gap-4">
                <app-skeleton type="rect" [style]="{ width: '64px', height: '48px', 'aspect-ratio': 'auto' }" class="shrink-0"/>
                <div class="flex-1 space-y-2">
                  <app-skeleton type="title" [style.width]="'40%'"/>
                  <app-skeleton type="text" [style.width]="'20%'"/>
                </div>
              </div>
            }
          </div>
        </div>
      } @else {
      <div class="bg-surface comic-border overflow-hidden">
        <table class="w-full text-left text-sm">
          <thead>
            <tr class="bg-cream-dark border-b-2 border-ink">
              <th class="px-4 py-3 font-heading uppercase text-xs">Obrazek</th>
              <th class="px-4 py-3 font-heading uppercase text-xs">Tytuł</th>
              <th class="px-4 py-3 font-heading uppercase text-xs hidden md:table-cell">Data</th>
              <th class="px-4 py-3 font-heading uppercase text-xs text-right">Akcje</th>
            </tr>
          </thead>
          <tbody>
            @for (item of items(); track item.id) {
              <tr class="border-b border-ink/10 hover:bg-cream transition-colors">
                <td class="px-4 py-3">
                  @if (item.cover_image_url) {
                    <img [src]="item.cover_image_url" class="w-16 h-12 object-cover rounded border-2 border-ink/40" alt="Obrazek" />
                  } @else {
                    <span class="text-gray-400 text-xs">—</span>
                  }
                </td>
                <td class="px-4 py-3 font-medium">{{ item.title }}</td>
                <td class="px-4 py-3 hidden md:table-cell text-gray-500">{{ item.created_at | date:'dd.MM.yyyy' }}</td>
                <td class="px-4 py-3">
                  <div class="flex justify-end gap-2">
                    <button (click)="toggleEditor(item)" class="comic-btn text-xs !py-1.5 !px-3 bg-surface text-ink">Edytuj</button>
                    <button (click)="deleteItem(item)" class="comic-btn-danger text-xs !py-1.5 !px-3">Usuń</button>
                  </div>
                </td>
              </tr>
            } @empty {
              <tr><td colspan="4" class="px-4 py-8 text-center text-gray-500">Brak aktualności</td></tr>
            }
          </tbody>
        </table>
      </div>
      }
    </div>
  `,
})
export class NewsAdminComponent implements OnInit {
  items = signal<News[]>([]);
  albums = signal<GalleryAlbum[]>([]);
  editing = signal(false);
  message = signal<string | null>(null);
  messageType = signal<'success' | 'error'>('success');
  loading = signal(true);

  form = {
    id: '',
    title: '',
    content: '',
    cover_image_url: '',
    content_images: [] as string[],
    youtube_urls: [] as string[],
    pdf_url: null as string | null,
    pdf_name: null as string | null,
    album_id: null as string | null,
  };

  pdfDataUrl = signal<string | null>(null);
  pdfBlobUrl = signal<string | null>(null);

  constructor(
    private fb: FirebaseService,
    private sanitizer: DomSanitizer,
  ) {}

  async ngOnInit() {
    try {
      await Promise.all([this.load(), this.loadAlbums()]);
    } finally {
      this.loading.set(false);
    }
  }

  async load() {
    this.items.set(await this.fb.listNews());
  }

  async loadAlbums() {
    this.albums.set(await this.fb.listAlbums());
  }

  toggleEditor(item: News | null) {
    revokeBlobUrl(this.pdfBlobUrl());
    this.pdfBlobUrl.set(null);
    this.pdfDataUrl.set(null);
    if (item) {
      this.form = {
        id: item.id,
        title: item.title,
        content: item.content,
        cover_image_url: item.cover_image_url ?? '',
        content_images: [...(item.content_images ?? [])],
        youtube_urls: [...(item.youtube_urls ?? [])],
        pdf_url: item.pdf_url ?? null,
        pdf_name: item.pdf_name ?? null,
        album_id: item.album_id ?? null,
      };
      if (item.pdf_name && !item.pdf_url) {
        this.loadPdfData(item.id).catch((e) =>
          this.setMessage('Nie udało się wczytać pliku PDF: ' + (e.message ?? e), 'error'),
        );
      }
    } else {
      this.form = { id: '', title: '', content: '', cover_image_url: '', content_images: [], youtube_urls: [], pdf_url: null, pdf_name: null, album_id: null };
    }
    this.editing.set(true);
  }

  async loadPdfData(newsId: string) {
    const pdf = await this.fb.getNewsPdf(newsId);
    if (pdf?.data) {
      this.pdfDataUrl.set(pdf.data);
      this.pdfBlobUrl.set(dataUrlToBlobUrl(pdf.data));
    }
  }

  private slugify(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9ąęśćżźół]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  addContentImage() {
    this.form.content_images.push('');
  }

  removeContentImage(index: number) {
    this.form.content_images.splice(index, 1);
  }

  addYoutube() {
    this.form.youtube_urls.push('');
  }

  removeYoutube(index: number) {
    this.form.youtube_urls.splice(index, 1);
  }

  async uploadPdf(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    const MAX_BYTES = 10 * 1024 * 1024;
    if (file.size > MAX_BYTES) {
      this.setMessage(`Plik jest za duży (max ${(MAX_BYTES / 1024 / 1024).toFixed(1)} MB).`, 'error');
      input.value = '';
      return;
    }

    try {
      const dataUrl: string = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error('Nie udało się odczytać pliku.'));
        reader.readAsDataURL(file);
      });
      revokeBlobUrl(this.pdfBlobUrl());
      this.pdfDataUrl.set(dataUrl);
      this.pdfBlobUrl.set(dataUrlToBlobUrl(dataUrl));
      this.form.pdf_url = null;
      this.form.pdf_name = file.name;
      this.setMessage('Plik PDF został dodany.', 'success');
    } catch (e: any) {
      this.setMessage('Błąd: ' + (e.message ?? e), 'error');
    }
    input.value = '';
  }

  removePdf() {
    revokeBlobUrl(this.pdfBlobUrl());
    this.pdfBlobUrl.set(null);
    this.pdfDataUrl.set(null);
    this.form.pdf_url = null;
    this.form.pdf_name = null;
  }

  pdfHref(): string {
    return this.pdfBlobUrl() ?? this.form.pdf_url ?? '';
  }

  pdfPreviewSrc(): SafeResourceUrl | null {
    if (this.pdfBlobUrl()) {
      return this.sanitizer.bypassSecurityTrustResourceUrl(this.pdfBlobUrl()!);
    }
    const url = this.form.pdf_url;
    if (url && (url.startsWith('http') || url.startsWith('/'))) {
      return this.sanitizer.bypassSecurityTrustResourceUrl(url);
    }
    return null;
  }

  fileNameFromUrl = fileNameFromUrl;

  removeCoverImage() {
    this.form.cover_image_url = '';
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
      content_images: this.form.content_images.filter(u => u.trim()),
      youtube_urls: this.form.youtube_urls.map(u => u.trim()).filter(u => u),
      pdf_url: this.form.pdf_url || null,
      pdf_name: this.form.pdf_name || null,
      album_id: this.form.album_id || null,
      slug: this.slugify(this.form.title),
      status: 'published',
      published_at: now,
    };

    try {
      let newsId = this.form.id;
      if (newsId) {
        await this.fb.saveNews(payload, newsId);
      } else {
        newsId = (await this.fb.saveNews(payload)) ?? '';
      }

      const pdfUploaded = this.pdfDataUrl();
      if (pdfUploaded) {
        await this.fb.saveNewsPdf(newsId, pdfUploaded, this.form.pdf_name || 'plik.pdf');
      }
      if (!pdfUploaded && newsId && (this.form.pdf_url || !this.form.pdf_name)) {
        await this.fb.deleteNewsPdf(newsId);
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
      await this.fb.deleteNewsSafe(item.id);
    } catch (e: any) {
      this.setMessage('Błąd usuwania: ' + e.message, 'error');
      return;
    }
    this.setMessage('Usunięto.', 'success');
    await this.load();
  }

  setMessage(msg: string, type: 'success' | 'error') {
    this.message.set(msg);
    this.messageType.set(type);
    setTimeout(() => this.message.set(null), 5000);
  }
}

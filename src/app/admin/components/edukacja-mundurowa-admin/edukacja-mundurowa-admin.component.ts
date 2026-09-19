import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FirebaseService } from '../../../core/services/firebase.service';
import { EducationPage } from '../../../core/models/database.types';
import { SkeletonComponent } from '../../../shared/components/skeleton/skeleton.component';

const SETTING_KEY = 'edukacja_mundurowa';
const DEFAULT_PAGE: EducationPage = {
  title: 'Edukacja mundurowa',
  content: 'Edukacja mundurowa rozwija dyscyplinę, odpowiedzialność, sprawność fizyczną oraz umiejętność współpracy w zespole.\n\nZajęcia łączą wiedzę teoretyczną z praktycznymi ćwiczeniami i przygotowują uczniów do dalszego kształcenia oraz pracy w służbach mundurowych i instytucjach związanych z bezpieczeństwem publicznym.',
  cover_image_url: null,
  content_images: [],
  youtube_urls: [],
  pdf_url: null,
  pdf_name: null,
};

@Component({
  selector: 'app-edukacja-mundurowa-admin',
  standalone: true,
  imports: [FormsModule, SkeletonComponent],
  template: `
    <div class="space-y-6">
      <div><h1 class="text-3xl text-ink mb-1">Edukacja mundurowa</h1><p class="text-sm text-gray-500">Edytor działa tak jak edycja aktualności.</p></div>
      @if (message()) { <div [class]="messageType() === 'error' ? 'bg-red-50 text-red-700 border-red-500' : 'bg-green-50 text-green-700 border-green-500'" class="p-4 border-2 rounded-lg text-sm">{{ message() }}</div> }
      @if (loading()) {
        <div class="comic-card space-y-4" aria-busy="true"><app-skeleton type="title" /><app-skeleton type="text" /><app-skeleton type="rect" /></div>
      } @else {
        <form (submit)="save($event)" class="comic-card space-y-5">
          <div><label class="block text-sm font-semibold mb-1">Tytuł</label><input [(ngModel)]="form.title" name="title" required class="w-full px-4 py-2.5 border-2 border-ink rounded-lg" /></div>
          <div><label class="block text-sm font-semibold mb-1">Treść</label><textarea [(ngModel)]="form.content" name="content" rows="12" class="w-full px-4 py-2.5 border-2 border-ink rounded-lg"></textarea></div>

          <div>
            <label class="block text-sm font-semibold mb-1">Obrazek wyróżniający</label>
            <div class="flex gap-2"><input [(ngModel)]="form.cover_image_url" name="cover_image_url" class="flex-1 px-4 py-2.5 border-2 border-ink rounded-lg" placeholder="https://..." /><input #coverInput type="file" accept="image/*" class="hidden" (change)="uploadCover($event)" /><button type="button" (click)="coverInput.click()" class="comic-btn text-sm bg-surface text-ink">Dodaj z dysku</button></div>
            @if (form.cover_image_url) { <div class="mt-3 relative inline-block group"><img [src]="form.cover_image_url" class="max-h-48 max-w-full object-contain border-2 border-ink rounded-lg bg-cream-dark" alt="Podgląd" /><button type="button" (click)="form.cover_image_url = ''" class="absolute -top-2 -right-2 w-6 h-6 bg-red-600 text-white rounded-full text-xs font-bold border border-ink">×</button></div> }
          </div>

          <div>
            <label class="block text-sm font-semibold mb-1">Zdjęcia pod tekstem</label>
            <div class="space-y-3">@for (image of form.content_images; track $index) { <div class="flex gap-3 items-center"><img [src]="image" class="w-20 h-16 object-contain bg-cream-dark rounded border-2 border-ink" alt="Podgląd" /><input [(ngModel)]="form.content_images[$index]" [name]="'image_' + $index" class="flex-1 px-3 py-2 border-2 border-ink rounded-lg" placeholder="https://..." /><button type="button" (click)="removeImage($index)" class="w-7 h-7 bg-red-600 text-white rounded-full font-bold border border-ink">×</button></div> }</div>
            <button type="button" (click)="addImage()" class="comic-btn text-sm bg-surface text-ink mt-3">+ Dodaj zdjęcie URL</button><input #imageInput type="file" accept="image/*" multiple class="hidden" (change)="uploadImages($event)" /><button type="button" (click)="imageInput.click()" class="comic-btn text-sm bg-surface text-ink mt-3 ml-2">Dodaj zdjęcia z dysku</button>
          </div>

          <div><label class="block text-sm font-semibold mb-1">Filmy YouTube</label><div class="space-y-2">@for (url of form.youtube_urls; track $index) { <div class="flex gap-2"><input [(ngModel)]="form.youtube_urls[$index]" [name]="'youtube_' + $index" class="flex-1 px-3 py-2 border-2 border-ink rounded-lg" placeholder="https://www.youtube.com/watch?v=..." /><button type="button" (click)="removeYoutube($index)" class="w-7 h-7 bg-red-600 text-white rounded-full font-bold border border-ink">×</button></div> }</div><button type="button" (click)="form.youtube_urls.push('')" class="comic-btn text-sm bg-surface text-ink mt-3">+ Dodaj film YouTube</button></div>
          <div><label class="block text-sm font-semibold mb-1">Link do pliku PDF</label><input [(ngModel)]="form.pdf_url" name="pdf_url" class="w-full px-4 py-2.5 border-2 border-ink rounded-lg" placeholder="https://..." /></div>
          <button type="submit" class="comic-btn-primary text-sm">Zapisz zmiany</button>
        </form>
      }
    </div>
  `,
})
export class EdukacjaMundurowaAdminComponent implements OnInit {
  form: EducationPage = { ...DEFAULT_PAGE, content_images: [], youtube_urls: [] };
  loading = signal(true);
  message = signal<string | null>(null);
  messageType = signal<'success' | 'error'>('success');

  constructor(private fb: FirebaseService) {}

  async ngOnInit() {
    try {
      const setting = await this.fb.getSetting(SETTING_KEY);
      if (setting) {
        const data = JSON.parse(setting.value) as Partial<EducationPage>;
        this.form = { ...DEFAULT_PAGE, ...data, content_images: [...(data.content_images ?? [])], youtube_urls: [...(data.youtube_urls ?? [])] };
      }
    } catch (e: any) {
      this.setMessage('Błąd ładowania: ' + (e.message ?? e), 'error');
    } finally {
      this.loading.set(false);
    }
  }

  addImage() { this.form.content_images.push(''); }
  removeImage(index: number) { this.form.content_images.splice(index, 1); }
  removeYoutube(index: number) { this.form.youtube_urls.splice(index, 1); }

  async uploadCover(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0]; input.value = '';
    if (file) this.form.cover_image_url = await this.uploadImage(file, 'cover');
  }

  async uploadImages(event: Event) {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? []); input.value = '';
    for (const file of files) {
      const url = await this.uploadImage(file, 'content');
      if (url) this.form.content_images.push(url);
    }
  }

  async uploadImage(file: File, kind: string): Promise<string> {
    if (!file.type.startsWith('image/')) { this.setMessage('Wybierz plik graficzny.', 'error'); return ''; }
    if (file.size > 10 * 1024 * 1024) { this.setMessage('Maksymalny rozmiar zdjęcia to 10 MB.', 'error'); return ''; }
    try {
      const safeName = file.name.toLowerCase().replace(/[^a-z0-9._-]+/g, '-');
      const url = await this.fb.uploadFile(`edukacja-mundurowa/${kind}-${Date.now()}-${safeName}`, file);
      this.setMessage('Zdjęcie dodane.', 'success');
      return url;
    } catch (e: any) {
      this.setMessage('Nie udało się przesłać zdjęcia: ' + (e.message ?? e), 'error'); return '';
    }
  }

  async save(event: Event) {
    event.preventDefault();
    try {
      const existing = await this.fb.getSetting(SETTING_KEY);
      await this.fb.saveSetting({ key: SETTING_KEY, value: JSON.stringify({ ...this.form, content_images: this.form.content_images.filter(Boolean), youtube_urls: this.form.youtube_urls.filter(Boolean) }) }, existing?.id);
      this.setMessage('Zapisano edukację mundurową.', 'success');
    } catch (e: any) { this.setMessage('Błąd zapisu: ' + (e.message ?? e), 'error'); }
  }

  setMessage(message: string, type: 'success' | 'error') {
    this.message.set(message); this.messageType.set(type); setTimeout(() => this.message.set(null), 5000);
  }
}

import { Component, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FirebaseService } from '../../../core/services/firebase.service';
import { GalleryAlbum, GalleryImage } from '../../../core/models/database.types';

@Component({
  selector: 'app-gallery-admin',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl text-ink mb-1">Galeria</h1>
          <p class="text-gray-500">Zarządzaj albumami i zdjęciami</p>
        </div>
      </div>

      @if (message()) {
        <div [class]="messageType() === 'error' ? 'bg-red-50 text-red-700 border-red-500' : 'bg-green-50 text-green-700 border-green-500'"
             class="p-4 border-2 rounded-lg text-sm">{{ message() }}</div>
      }

      <div class="comic-card">
        <h2 class="font-heading text-xl text-orange-primary mb-4">Nowy album</h2>
        <form (submit)="createAlbum($event)" class="flex flex-wrap md:flex-nowrap items-center gap-2 md:gap-3">
          <input [(ngModel)]="newAlbumTitle" name="albumTitle" required placeholder="Tytuł albumu" class="w-full md:w-auto md:flex-1 px-3 py-2 text-sm border-2 border-ink rounded-lg" />
          <input [(ngModel)]="newAlbumDesc" name="albumDesc" placeholder="Opis" class="w-full md:w-auto md:flex-1 px-3 py-2 text-sm border-2 border-ink rounded-lg" />
          <label class="flex items-center gap-2 shrink-0 text-sm text-ink font-semibold cursor-pointer">
            <input type="checkbox" [(ngModel)]="newAlbumVisible" name="albumVisible" id="albumVisible" class="w-4 h-4" />
            Pokaż w galerii
          </label>
          <button type="submit" class="comic-btn-primary text-xs !py-2 !px-4 shrink-0">Utwórz</button>
        </form>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        @for (album of albums(); track album.id) {
          <div class="comic-card">
            <div class="flex items-start justify-between mb-4">
              <div>
                <h3 class="font-heading text-lg text-ink">{{ album.title }}</h3>
                @if (album.description) {
                  <p class="text-sm text-gray-500">{{ album.description }}</p>
                }
                <label class="inline-flex items-center gap-2 mt-2 cursor-pointer">
                  <input type="checkbox" [checked]="album.is_visible !== false"
                    (change)="toggleVisibility(album, $event)" class="w-4 h-4" />
                  <span class="text-sm text-ink font-medium">Pokaż w galerii</span>
                </label>
              </div>
              <button (click)="deleteAlbum(album)" class="comic-btn text-xs !py-1.5 !px-3 bg-red-50 text-red-600 !shadow-[2px_2px_0_#991b1b] !border-red-600">Usuń</button>
            </div>

            <div class="flex flex-wrap gap-2 mb-4">
              @for (img of imagesByAlbum(album.id); track img.id) {
                <div class="relative group">
                  <img [src]="img.image_url" class="w-24 h-20 object-cover rounded border-2 border-ink" />
                  <button
                    (click)="deleteImage(img)"
                    class="absolute -top-2 -right-2 w-6 h-6 bg-red-600 text-white rounded-full text-xs font-bold hidden group-hover:flex items-center justify-center border border-ink">×</button>
                </div>
              } @empty {
                <p class="text-gray-400 text-sm w-full">Brak zdjęć</p>
              }
            </div>

            <div class="flex items-center gap-2">
              <input #fileInput type="file" accept="image/*" multiple class="hidden"
                (change)="uploadImages(fileInput, album.id)" />
              <button (click)="fileInput.click()" class="comic-btn text-sm bg-surface text-ink">+ Dodaj zdjęcia</button>
            </div>
          </div>
        } @empty {
          <div class="col-span-full text-center py-16 comic-card">
            <p class="text-gray-500">Utwórz pierwszy album, aby dodać zdjęcia.</p>
          </div>
        }
      </div>
    </div>
  `,
})
export class GalleryAdminComponent implements OnInit {
  albums = signal<GalleryAlbum[]>([]);
  images = signal<GalleryImage[]>([]);
  newAlbumTitle = '';
  newAlbumDesc = '';
  newAlbumVisible = true;
  message = signal<string | null>(null);
  messageType = signal<'success' | 'error'>('success');

  constructor(private fb: FirebaseService) {}

  async ngOnInit() {
    await Promise.all([this.loadAlbums(), this.loadImages()]);
  }

  async loadAlbums() {
    this.albums.set(await this.fb.listAlbums());
  }

  async loadImages() {
    this.images.set(await this.fb.listAllImages());
  }

  imagesByAlbum = (albumId: string) => this.images().filter(i => i.album_id === albumId);

  async createAlbum(event: Event) {
    event.preventDefault();
    if (!this.newAlbumTitle.trim()) return;
    const slug = this.newAlbumTitle.toLowerCase().replace(/[^a-z0-9ąęśćżźół]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
    try {
      await this.fb.saveAlbum({
        title: this.newAlbumTitle,
        slug,
        description: this.newAlbumDesc || null,
        display_order: this.albums().length + 1,
        is_visible: this.newAlbumVisible,
      });
      this.newAlbumTitle = '';
      this.newAlbumDesc = '';
      this.newAlbumVisible = true;
      this.setMessage('Album utworzony.', 'success');
      await this.loadAlbums();
    } catch (e: any) {
      this.setMessage('Błąd: ' + (e.message ?? e), 'error');
    }
  }

  async toggleVisibility(album: GalleryAlbum, event: Event) {
    const visible = (event.target as HTMLInputElement).checked;
    try {
      await this.fb.saveAlbum({ is_visible: visible }, album.id);
      await this.loadAlbums();
      this.setMessage(visible ? 'Album widoczny w galerii.' : 'Album ukryty w galerii.', 'success');
    } catch (e: any) {
      this.setMessage('Błąd: ' + (e.message ?? e), 'error');
    }
  }

  async deleteAlbum(album: GalleryAlbum) {
    if (!confirm(`Usunąć album "${album.title}" wraz ze zdjęciami?`)) return;
    try {
      for (const img of this.imagesByAlbum(album.id)) {
        await this.fb.deleteImage(img.id);
      }
      await this.fb.deleteAlbum(album.id);
      this.setMessage('Usunięto.', 'success');
      await Promise.all([this.loadAlbums(), this.loadImages()]);
    } catch (e: any) {
      this.setMessage('Błąd: ' + (e.message ?? e), 'error');
    }
  }

  async uploadImages(input: HTMLInputElement, albumId: string) {
    const files = input.files;
    if (!files || files.length === 0) return;
    let firstError: any = null;
    let uploaded = 0;
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const ext = file.name.split('.').pop() || 'jpg';
      const path = `gallery/${albumId}/${Date.now()}-${i}.${ext}`;
      try {
        const url = await this.fb.uploadFile(path, file);
        await this.fb.saveImage({
          album_id: albumId,
          image_url: url,
          display_order: i,
        });
        uploaded++;
      } catch (e: any) {
        firstError = firstError ?? e;
      }
    }
    if (firstError) {
      this.setMessage('Błąd przesyłania zdjęć: ' + (firstError?.message ?? firstError), 'error');
      console.error('Upload gallery error', firstError);
    } else {
      this.setMessage('Dodano ' + uploaded + ' zdjęć.', 'success');
    }
    input.value = '';
    await this.loadImages();
  }

  async deleteImage(img: GalleryImage) {
    try {
      await this.fb.deleteImage(img.id);
      this.setMessage('Usunięto.', 'success');
      await this.loadImages();
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

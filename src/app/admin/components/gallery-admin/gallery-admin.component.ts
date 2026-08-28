import { Component, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../../../core/services/supabase.service';
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
        <form (submit)="createAlbum($event)" class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input [(ngModel)]="newAlbumTitle" name="albumTitle" required placeholder="Tytuł albumu" class="md:col-span-2 px-4 py-2.5 border-2 border-ink rounded-lg" />
          <input [(ngModel)]="newAlbumDesc" name="albumDesc" placeholder="Opis" class="px-4 py-2.5 border-2 border-ink rounded-lg" />
          <button type="submit" class="comic-btn-primary text-sm">Utwórz</button>
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
  message = signal<string | null>(null);
  messageType = signal<'success' | 'error'>('success');

  constructor(private supabase: SupabaseService) {}

  async ngOnInit() {
    await Promise.all([this.loadAlbums(), this.loadImages()]);
  }

  async loadAlbums() {
    const { data } = await this.supabase.supabase
      .from('gallery_albums')
      .select('*')
      .order('display_order', { ascending: true });
    this.albums.set((data as GalleryAlbum[]) ?? []);
  }

  async loadImages() {
    const { data } = await this.supabase.supabase
      .from('gallery_images')
      .select('*')
      .order('display_order', { ascending: true });
    this.images.set((data as GalleryImage[]) ?? []);
  }

  imagesByAlbum = (albumId: string) => this.images().filter(i => i.album_id === albumId);

  async createAlbum(event: Event) {
    event.preventDefault();
    if (!this.newAlbumTitle.trim()) return;
    const slug = this.newAlbumTitle.toLowerCase().replace(/[^a-z0-9ąęśćżźół]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
    const { error } = await this.supabase.supabase.from('gallery_albums').insert([{
      title: this.newAlbumTitle,
      slug,
      description: this.newAlbumDesc || null,
      display_order: this.albums().length + 1,
    }]);
    if (error) { this.setMessage('Błąd: ' + error.message, 'error'); }
    else {
      this.newAlbumTitle = '';
      this.newAlbumDesc = '';
      this.setMessage('Album utworzony.', 'success');
      await this.loadAlbums();
    }
  }

  async deleteAlbum(album: GalleryAlbum) {
    if (!confirm(`Usunąć album "${album.title}" wraz ze zdjęciami?`)) return;
    await this.supabase.supabase.from('gallery_images').delete().eq('album_id', album.id);
    const { error } = await this.supabase.supabase.from('gallery_albums').delete().eq('id', album.id);
    if (error) this.setMessage('Błąd: ' + error.message, 'error');
    else { this.setMessage('Usunięto.', 'success'); await Promise.all([this.loadAlbums(), this.loadImages()]); }
  }

  async uploadImages(input: HTMLInputElement, albumId: string) {
    const files = input.files;
    if (!files || files.length === 0) return;
    let uploadError: any = null;
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const path = `gallery/${albumId}/${Date.now()}-${i}.${file.name.split('.').pop()}`;
      const { error } = await this.supabase.supabase.storage.from('media').upload(path, file);
      if (error) { uploadError = error; continue; }
      const { data } = this.supabase.supabase.storage.from('media').getPublicUrl(path);
      await this.supabase.supabase.from('gallery_images').insert([{
        album_id: albumId,
        image_url: data.publicUrl,
        display_order: i,
      }]);
    }
    if (uploadError) this.setMessage('Część zdjęć nie została przesłana.', 'error');
    else this.setMessage('Zdjęcia dodane.', 'success');
    input.value = '';
    await this.loadImages();
  }

  async deleteImage(img: GalleryImage) {
    const { error } = await this.supabase.supabase.from('gallery_images').delete().eq('id', img.id);
    if (error) this.setMessage('Błąd: ' + error.message, 'error');
    else { this.setMessage('Usunięto.', 'success'); await this.loadImages(); }
  }

  setMessage(msg: string, type: 'success' | 'error') {
    this.message.set(msg);
    this.messageType.set(type);
    setTimeout(() => this.message.set(null), 5000);
  }
}

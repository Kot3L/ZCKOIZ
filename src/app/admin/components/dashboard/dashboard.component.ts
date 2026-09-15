import { Component, signal, OnInit } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { DatePipe } from '@angular/common';
import { SkeletonComponent } from '../../../shared/components/skeleton/skeleton.component';
import { FirebaseService } from '../../../core/services/firebase.service';
import { AdminStateService } from '../../../core/services/admin-state.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, DatePipe, SkeletonComponent],
  template: `
    <div class="admin-dashboard space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
        <div>
          <p class="text-xs font-heading uppercase tracking-widest text-petrol mb-1">Panel administracyjny</p>
          <h1 class="text-3xl text-ink">Dashboard</h1>
        </div>
      </div>

      @if (loading()) {
        <div class="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3" aria-busy="true">
          @for (s of [1,2,3,4,5,6]; track s) {
            <div class="comic-card !p-4 space-y-2">
              <app-skeleton type="text" [style.width]="'55%'"/>
              <app-skeleton type="title" [style.width]="'35%'"/>
            </div>
          }
        </div>
      } @else {
      <div class="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        @for (stat of dashboardStats(); track stat.label) {
          <div class="comic-card !p-4">
            <p class="text-xs font-heading uppercase tracking-wide text-gray-500 truncate">{{ stat.label }}</p>
            <p class="font-heading text-3xl text-petrol leading-none mt-2">{{ stat.value }}</p>
          </div>
        }
      </div>
      }

      <div class="grid grid-cols-1 xl:grid-cols-[0.9fr_1.1fr] gap-4">
        <div class="comic-card !p-5">
          <div class="flex items-center justify-between mb-4">
            <h2 class="font-heading text-xl text-orange-primary">Szybkie akcje</h2>
            <span class="text-xs text-gray-500">Najczęściej używane</span>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <a [routerLink]="base() + '/aktualnosci'" class="comic-btn-secondary justify-between !py-3">
              <span>Dodaj aktualność</span><span aria-hidden="true">→</span>
            </a>
            <a [routerLink]="base() + '/kierunki'" class="comic-btn-primary justify-between !py-3">
              <span>Zarządzaj kierunkami</span><span aria-hidden="true">→</span>
            </a>
            <a [routerLink]="base() + '/galeria'" class="comic-btn justify-between !py-3 bg-surface text-ink">
              <span>Dodaj zdjęcia</span><span aria-hidden="true">→</span>
            </a>
            <a [routerLink]="base() + '/dokumenty'" class="comic-btn justify-between !py-3 bg-surface text-ink">
              <span>Dodaj dokument</span><span aria-hidden="true">→</span>
            </a>
          </div>
        </div>

        <div class="comic-card !p-5">
          <div class="flex items-center justify-between mb-2">
            <h2 class="font-heading text-xl text-petrol">Ostatnie aktualności</h2>
            <a [routerLink]="base() + '/aktualnosci'" class="text-xs font-semibold text-petrol hover:underline">Wszystkie</a>
          </div>
          @if (loading()) {
            <div class="space-y-3" aria-busy="true">
              @for (s of [1,2,3]; track s) {
                <div class="space-y-2">
                  <app-skeleton type="title" [style.width]="'50%'"/>
                  <app-skeleton type="text" [style.width]="'35%'"/>
                </div>
              }
            </div>
          } @else if (recentNews().length > 0) {
            <ul class="divide-y divide-ink/10">
              @for (item of recentNews(); track item.id) {
                <li class="py-2.5 flex items-center justify-between gap-4">
                  <p class="font-semibold text-ink text-sm truncate">{{ item.title }}</p>
                  <p class="text-xs text-gray-500">
                    {{ item.status === 'published' ? 'Opublikowano' : 'Szkic' }} · {{ (item.published_at || item.created_at) | date:'dd.MM.yyyy' }}
                  </p>
                </li>
              }
            </ul>
          } @else {
            <p class="text-gray-500 text-sm">Brak aktualności</p>
          }
        </div>
      </div>

      @if (!loading()) {
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div class="comic-card !p-5">
            <div class="flex items-center justify-between mb-4">
              <h2 class="font-heading text-xl text-petrol">Stan strony</h2>
              <span class="text-xs text-gray-500">Aktualne dane</span>
            </div>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div class="rounded-lg border-2 border-ink/15 bg-cream-dark p-3">
                <p class="text-xs text-gray-500">Aktywne kierunki</p>
                <p class="font-heading text-2xl text-ink mt-1">{{ activePrograms() }}</p>
              </div>
              <div class="rounded-lg border-2 border-ink/15 bg-cream-dark p-3">
                <p class="text-xs text-gray-500">Widoczne albumy</p>
                <p class="font-heading text-2xl text-ink mt-1">{{ visibleAlbums() }}</p>
              </div>
              <div class="rounded-lg border-2 border-ink/15 bg-cream-dark p-3">
                <p class="text-xs text-gray-500">Dokumenty</p>
                <p class="font-heading text-2xl text-ink mt-1">{{ stats().documents }}</p>
              </div>
              <div class="rounded-lg border-2 border-ink/15 bg-cream-dark p-3">
                <p class="text-xs text-gray-500">Zdjęcia</p>
                <p class="font-heading text-2xl text-ink mt-1">{{ stats().images }}</p>
              </div>
            </div>
          </div>

          <div class="comic-card !p-5">
            <div class="flex items-center justify-between mb-4">
              <h2 class="font-heading text-xl text-orange-primary">Wymaga uwagi</h2>
              <span class="text-xs text-gray-500">Szybki przegląd</span>
            </div>
            <div class="space-y-2 text-sm">
              <a [routerLink]="base() + '/aktualnosci'" class="flex items-center justify-between gap-4 rounded-lg border-2 border-ink/10 px-3 py-2 hover:bg-cream-dark transition-colors">
                <span>Szkice aktualności</span>
                <span class="font-heading text-lg text-orange-primary">{{ draftNews() }}</span>
              </a>
              <a [routerLink]="base() + '/kierunki'" class="flex items-center justify-between gap-4 rounded-lg border-2 border-ink/10 px-3 py-2 hover:bg-cream-dark transition-colors">
                <span>Nieaktywne kierunki</span>
                <span class="font-heading text-lg text-orange-primary">{{ inactivePrograms() }}</span>
              </a>
              <a [routerLink]="base() + '/galeria'" class="flex items-center justify-between gap-4 rounded-lg border-2 border-ink/10 px-3 py-2 hover:bg-cream-dark transition-colors">
                <span>Puste albumy</span>
                <span class="font-heading text-lg text-orange-primary">{{ emptyAlbums() }}</span>
              </a>
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class DashboardComponent implements OnInit {
  stats = signal({ news: 0, programs: 0, albums: 0, images: 0, documents: 0, staff: 0 });
  recentNews = signal<any[]>([]);
  allNews = signal<any[]>([]);
  programs = signal<any[]>([]);
  albums = signal<any[]>([]);
  images = signal<any[]>([]);
  loading = signal(true);

  constructor(
    private fb: FirebaseService,
    private route: ActivatedRoute,
    private adminState: AdminStateService,
  ) {}

  base = () =>
    '/' + (this.adminState.secret() || this.route.snapshot.paramMap.get('secret') || '');

  dashboardStats = () => [
    { label: 'Aktualności', value: this.stats().news },
    { label: 'Kierunki', value: this.stats().programs },
    { label: 'Albumy', value: this.stats().albums },
    { label: 'Zdjęcia', value: this.stats().images },
    { label: 'Dokumenty', value: this.stats().documents },
    { label: 'Kadra', value: this.stats().staff },
  ];

  activePrograms = () => this.programs().filter((program) => program.is_active).length;
  inactivePrograms = () => this.programs().filter((program) => !program.is_active).length;
  visibleAlbums = () => this.albums().filter((album) => album.is_visible !== false).length;
  emptyAlbums = () => this.albums().filter((album) => !this.images().some((image) => image.album_id === album.id)).length;
  draftNews = () => this.allNews().filter((news) => news.status !== 'published').length;

  async ngOnInit() {
    try {
      const [news, programs, albums, images, docs, staff] = await Promise.all([
        this.fb.listNews(),
        this.fb.listPrograms(),
        this.fb.listAlbums(),
        this.fb.listAllImages(),
        this.fb.listDocuments(),
        this.fb.listStaff(),
      ]);

      this.stats.set({
        news: news.length,
        programs: programs.length,
        albums: albums.length,
        images: images.length,
        documents: docs.length,
        staff: staff.length,
      });
      this.programs.set(programs);
      this.albums.set(albums);
      this.images.set(images);
      this.allNews.set(news);
      this.recentNews.set(news.slice(0, 5));
    } finally {
      this.loading.set(false);
    }
  }
}

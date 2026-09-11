import { Component, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { StatCardComponent } from '../../../shared/components/stat-card/stat-card.component';
import { SkeletonComponent } from '../../../shared/components/skeleton/skeleton.component';
import { FirebaseService } from '../../../core/services/firebase.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, StatCardComponent, DatePipe, SkeletonComponent],
  template: `
    <div class="space-y-8">
      <div>
        <h1 class="text-3xl text-ink mb-1">Dashboard</h1>
      </div>

      @if (loading()) {
        <div class="grid grid-cols-2 lg:grid-cols-3 gap-4" aria-busy="true">
          @for (s of [1,2,3,4,5,6]; track s) {
            <div class="comic-card space-y-3">
              <app-skeleton type="title" [style.width]="'50%'"/>
              <app-skeleton type="title" [style.width]="'30%'"/>
            </div>
          }
        </div>
      } @else {
      <div class="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <app-stat-card [value]="stats().news" label="Aktualności" />
        <app-stat-card [value]="stats().programs" label="Kierunki" />
        <app-stat-card [value]="stats().albums" label="Albumy" />
        <app-stat-card [value]="stats().images" label="Zdjęcia" />
        <app-stat-card [value]="stats().documents" label="Dokumenty" />
        <app-stat-card [value]="stats().staff" label="Kadra" />
      </div>
      }

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="comic-card">
          <h2 class="font-heading text-xl text-orange-primary mb-4">Szybkie akcje</h2>
          <div class="space-y-3">
            <a routerLink="/admin/aktualnosci" class="comic-btn-secondary w-full justify-between !py-3">
              <span>Dodaj aktualność</span>
              <span>→</span>
            </a>
            <a routerLink="/admin/kierunki" class="comic-btn-primary w-full justify-between !py-3">
              <span>Zarządzaj kierunkami</span>
              <span>→</span>
            </a>
            <a routerLink="/admin/galeria" class="comic-btn w-full justify-between !py-3 bg-surface text-ink">
              <span>Dodaj zdjęcia</span>
              <span>→</span>
            </a>
            <a routerLink="/admin/dokumenty" class="comic-btn w-full justify-between !py-3 bg-surface text-ink">
              <span>Dodaj dokument</span>
              <span>→</span>
            </a>
          </div>
        </div>

        <div class="comic-card">
          <h2 class="font-heading text-xl text-petrol mb-4">Ostatnie aktualności</h2>
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
                <li class="py-3">
                  <p class="font-semibold text-ink text-sm">{{ item.title }}</p>
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
    </div>
  `,
})
export class DashboardComponent implements OnInit {
  stats = signal({ news: 0, programs: 0, albums: 0, images: 0, documents: 0, staff: 0 });
  recentNews = signal<any[]>([]);
  loading = signal(true);

  constructor(private fb: FirebaseService) {}

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
      this.recentNews.set(news.slice(0, 5));
    } finally {
      this.loading.set(false);
    }
  }
}

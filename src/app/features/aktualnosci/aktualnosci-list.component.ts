import { Component, signal, OnInit } from '@angular/core';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { NewsCardComponent } from '../../shared/components/news-card/news-card.component';
import { SkeletonComponent } from '../../shared/components/skeleton/skeleton.component';
import { FirebaseService } from '../../core/services/firebase.service';
import { News } from '../../core/models/database.types';

const PAGE_SIZE = 3;

@Component({
  selector: 'app-aktualnosci-list',
  standalone: true,
  imports: [PageHeaderComponent, NewsCardComponent, SkeletonComponent],
  template: `
    <app-page-header title="Aktualności" subtitle="Najnowsze wiadomości i wydarzenia ze szkoły" />

    <section class="py-12 md:py-16">
      <div class="container-main">
        <p class="text-gray-500 text-sm mb-6">
          @if (news().length > 0) {
            Wyświetlono {{ news().length }} @if (!allLoaded()) {z } aktualności
          }
        </p>
        @if (loading()) {
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" aria-busy="true" aria-label="Ładowanie aktualności">
            @for (s of [1,2,3]; track s) {
              <div class="comic-card !p-0 overflow-hidden">
                <app-skeleton type="rect" />
                <div class="p-5 space-y-3">
                  <app-skeleton type="title" />
                  <app-skeleton type="text" />
                  <app-skeleton type="text" [style.width]="'60%'"/>
                </div>
              </div>
            }
          </div>
        } @else {
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            @for (item of news(); track item.id) {
              <app-news-card [news]="item" />
            } @empty {
              <div class="col-span-full text-center py-16">
                <p class="text-gray-500 text-lg">Brak aktualności do wyświetlenia</p>
              </div>
            }
          </div>

          @if (hasMore()) {
            <div class="text-center mt-10">
              <button (click)="loadMore()" [disabled]="loadingMore()"
                class="comic-btn-secondary text-sm py-2 px-6"
                [class.opacity-60]="loadingMore()">
                @if (loadingMore()) {
                  Ładowanie…
                } @else {
                  Zobacz więcej
                }
              </button>
            </div>
          } @else if (news().length > 0) {
            <p class="text-center text-gray-400 text-sm mt-10">To wszystkie aktualności</p>
          }
        }
      </div>
    </section>
  `,
})
export class AktualnosciListComponent implements OnInit {
  news = signal<News[]>([]);
  loading = signal(true);
  loadingMore = signal(false);
  hasMore = signal(true);
  allLoaded = signal(false);

  private cursor: any = null;

  constructor(private fb: FirebaseService) {}

  async ngOnInit() {
    try {
      await this.loadMore();
    } finally {
      this.loading.set(false);
    }
  }

  async loadMore() {
    if (this.loadingMore()) return;
    this.loadingMore.set(true);
    try {
      const { items, nextCursor } = await this.fb.listPublishedNewsPage(PAGE_SIZE, this.cursor);
      this.cursor = nextCursor;
      this.news.update((xs) => [...xs, ...items]);
      this.hasMore.set(nextCursor !== null);
      this.allLoaded.set(nextCursor === null);
    } finally {
      this.loadingMore.set(false);
    }
  }
}
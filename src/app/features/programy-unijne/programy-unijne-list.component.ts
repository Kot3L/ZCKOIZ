import { Component, signal, OnInit } from '@angular/core';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { NewsCardComponent } from '../../shared/components/news-card/news-card.component';
import { SkeletonComponent } from '../../shared/components/skeleton/skeleton.component';
import { FirebaseService } from '../../core/services/firebase.service';
import { EuProgramArticle } from '../../core/models/database.types';

@Component({
  selector: 'app-programy-unijne-list',
  standalone: true,
  imports: [PageHeaderComponent, NewsCardComponent, SkeletonComponent],
  template: `
    <app-page-header title="Programy unijne" subtitle="Projekty i programy współfinansowane ze środków Unii Europejskiej w ZCKOiZ Zabrze" />
    <section class="py-12 md:py-16">
      <div class="container-main">
        @if (loading()) {
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" aria-busy="true" aria-label="Ładowanie artykułów">
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
            @for (item of articles(); track item.id) {
              <app-news-card [news]="item" [baseRoute]="'/programy_unijne'" />
            } @empty {
              <div class="col-span-full text-center py-16">
                <p class="text-gray-500 text-lg">Brak artykułów do wyświetlenia</p>
              </div>
            }
          </div>
        }
      </div>
    </section>
  `,
})
export class ProgramyUnijneListComponent implements OnInit {
  articles = signal<EuProgramArticle[]>([]);
  loading = signal(true);

  constructor(private fb: FirebaseService) {}

  async ngOnInit() {
    try {
      this.articles.set(await this.fb.listPublishedEuPrograms());
    } finally {
      this.loading.set(false);
    }
  }
}
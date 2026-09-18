import { Component, signal, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { SkeletonComponent } from '../../shared/components/skeleton/skeleton.component';
import { FirebaseService } from '../../core/services/firebase.service';
import { Program } from '../../core/models/database.types';

@Component({
  selector: 'app-program-detail',
  standalone: true,
  imports: [PageHeaderComponent, RouterLink, SkeletonComponent],
  template: `
    @if (loading()) {
      <section class="py-12">
        <div class="container-main">
          <div class="space-y-6" aria-busy="true">
            <app-skeleton type="title" [style.width]="'50%'"/>
            <app-skeleton type="text" [style.width]="'35%'"/>
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6">
              <div class="lg:col-span-2 space-y-6">
                <div class="comic-card space-y-3">
                  <app-skeleton type="title" [style.width]="'40%'"/>
                  <app-skeleton type="text"/>
                  <app-skeleton type="text"/>
                  <app-skeleton type="text" [style.width]="'80%'"/>
                </div>
                <div class="comic-card space-y-3">
                  <app-skeleton type="title" [style.width]="'40%'"/>
                  <app-skeleton type="text"/>
                  <app-skeleton type="text" [style.width]="'70%'"/>
                </div>
              </div>
              <div class="comic-card space-y-3">
                <app-skeleton type="title" [style.width]="'50%'"/>
                <app-skeleton type="text"/>
                <app-skeleton type="button"/>
              </div>
            </div>
          </div>
        </div>
      </section>
    } @else if (program()) {
      <app-page-header
        [title]="program()!.title"
        [subtitle]="program()!.school_type === 'technikum' ? 'Technikum' : 'Branżowa Szkoła I Stopnia'" />

      <section class="py-12 md:py-16">
        <div class="container-main">
          <a routerLink="/oferta" class="inline-flex items-center gap-2 text-petrol font-heading font-semibold text-sm uppercase tracking-wide mb-8 hover:gap-3 transition-all">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
            Wróć do oferty
          </a>

          <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div class="lg:col-span-2 space-y-8">
              @if (program()!.cover_image_url) {
                <div class="overflow-hidden rounded-lg border-2 border-ink shadow-[3px_3px_0_var(--color-ink)] bg-cream-dark">
                  <img [src]="program()!.cover_image_url" [alt]="'Zdjęcie kierunku ' + program()!.title" class="w-full max-h-80 object-cover" />
                </div>
              }
              <div class="comic-card">
                <h2 class="font-heading text-2xl text-orange-primary mb-4">Opis kierunku</h2>
                <p class="text-gray-700 leading-relaxed whitespace-pre-line">{{ program()!.description }}</p>
              </div>

              <div class="comic-card">
                <h2 class="font-heading text-2xl text-petrol mb-4">Czego się nauczysz?</h2>
                <p class="text-gray-700 leading-relaxed whitespace-pre-line">{{ program()!.what_you_learn }}</p>
              </div>

              <div class="comic-card">
                <h2 class="font-heading text-2xl text-yellow-accent mb-4">Perspektywy zawodowe</h2>
                <p class="text-gray-700 leading-relaxed whitespace-pre-line">{{ program()!.career_prospects }}</p>
              </div>
            </div>

            <div class="space-y-6">
              <div class="comic-card bg-orange-50">
                <h3 class="font-heading text-lg text-orange-primary mb-3">Zapisz się!</h3>
                <p class="text-gray-600 text-sm mb-4">Skontaktuj się z sekretariatem, aby uzyskać więcej informacji o rekrutacji.</p>
                <a routerLink="/kontakt" class="comic-btn-primary text-sm w-full text-center">
                  Kontakt
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    }
  `,
})
export class ProgramDetailComponent implements OnInit {
  program = signal<Program | null>(null);
  loading = signal(true);

  constructor(
    private route: ActivatedRoute,
    private fb: FirebaseService,
  ) {}

  async ngOnInit() {
    const slug = this.route.snapshot.paramMap.get('slug');
    if (!slug) return;

    try {
      const data = await this.fb.getProgramBySlug(slug);
      this.program.set(data);
    } finally {
      this.loading.set(false);
    }
  }
}

import { Component, signal, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { SupabaseService } from '../../core/services/supabase.service';
import { Program } from '../../core/models/database.types';

@Component({
  selector: 'app-program-detail',
  standalone: true,
  imports: [PageHeaderComponent, RouterLink],
  template: `
    @if (program()) {
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
              @if (program()!.cover_image_url) {
                <div class="comic-border overflow-hidden">
                  <img [src]="program()!.cover_image_url" [alt]="program()!.title" class="w-full h-48 object-cover" />
                </div>
              }
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

  constructor(
    private route: ActivatedRoute,
    private supabase: SupabaseService,
  ) {}

  async ngOnInit() {
    const slug = this.route.snapshot.paramMap.get('slug');
    if (!slug) return;

    const { data } = await this.supabase.supabase
      .from('programs')
      .select('*')
      .eq('slug', slug)
      .single();
    this.program.set(data as Program | null);
  }
}

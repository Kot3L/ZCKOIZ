import { Component, signal, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { SupabaseService } from '../../core/services/supabase.service';
import { News } from '../../core/models/database.types';

@Component({
  selector: 'app-aktualnosc-detail',
  standalone: true,
  imports: [PageHeaderComponent, RouterLink, DatePipe],
  template: `
    @if (item()) {
      <app-page-header [title]="item()!.title" />

      <section class="py-12 md:py-16">
        <div class="container-main max-w-4xl">
          <a routerLink="/aktualnosci" class="inline-flex items-center gap-2 text-petrol font-heading font-semibold text-sm uppercase tracking-wide mb-8 hover:gap-3 transition-all">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
            Wróć do aktualności
          </a>

          <article class="comic-card">
            @if (item()!.cover_image_url) {
              <div class="-mx-6 -mt-6 mb-6 border-b-2 border-ink overflow-hidden">
                <img [src]="item()!.cover_image_url" [alt]="item()!.title" class="w-full h-64 md:h-80 object-cover" />
              </div>
            }
            <div class="flex items-center gap-3 mb-6">
              @if (item()!.published_at) {
                <span class="text-sm text-gray-500">{{ item()!.published_at | date:'dd MMMM yyyy' }}</span>
              }
            </div>
            <div class="prose prose-lg max-w-none text-gray-700 leading-relaxed whitespace-pre-line">
              {{ item()!.content }}
            </div>
          </article>
        </div>
      </section>
    }
  `,
})
export class AktualnoscDetailComponent implements OnInit {
  item = signal<News | null>(null);

  constructor(
    private route: ActivatedRoute,
    private supabase: SupabaseService,
  ) {}

  async ngOnInit() {
    const slug = this.route.snapshot.paramMap.get('slug');
    if (!slug) return;

    const { data } = await this.supabase.supabase
      .from('news')
      .select('*')
      .eq('slug', slug)
      .single();
    this.item.set(data as News | null);
  }
}

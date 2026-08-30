import { Component, signal, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { FirebaseService } from '../../core/services/firebase.service';
import { SchoolPageRecord } from '../../core/models/database.types';
import { SCHOOL_PAGES, SchoolPage } from './school-content';

@Component({
  selector: 'app-school-page',
  standalone: true,
  imports: [PageHeaderComponent, RouterLink],
  template: `
    @if (loading()) {
      <div class="py-16 text-center text-gray-500">Ładowanie…</div>
    } @else if (page()) {
      <app-page-header [title]="page()!.title" [subtitle]="page()!.subtitle" />

      <section class="py-12 md:py-16">
        <div class="container-main max-w-4xl">
          @for (section of page()!.sections; track section.heading) {
            <div class="mb-10">
              <h2 class="section-heading mb-4">{{ section.heading }}</h2>
              @if (section.body) {
                <div class="space-y-3">
                  @for (paragraph of section.body; track paragraph) {
                    <p class="text-gray-700 leading-relaxed">{{ paragraph }}</p>
                  }
                </div>
              }
              @if (section.links && section.links.length > 0) {
                <div class="mt-4 space-y-2">
                  @for (link of section.links; track link.url) {
                    @if (link.external) {
                      <a [href]="link.url" target="_blank" rel="noopener"
                        class="inline-flex items-center gap-2 text-petrol font-heading font-semibold hover:gap-3 transition-all">
                        {{ link.label }}
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
                      </a>
                    } @else {
                      <a routerLink="{{ link.url }}"
                        class="inline-flex items-center gap-2 text-petrol font-heading font-semibold hover:gap-3 transition-all">
                        {{ link.label }}
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
                      </a>
                    }
                  }
                </div>
              }
            </div>
          }
        </div>
      </section>
    } @else {
      <app-page-header title="Szkoła" subtitle="Ważne informacje o naszej szkole" />
      <section class="py-12">
        <div class="container-main text-center">
          <p class="text-gray-500 text-lg">Nie znaleziono podstrony</p>
        </div>
      </section>
    }
  `,
})
export class SchoolPageComponent {
  page = signal<SchoolPage | null>(null);
  loading = signal(false);

  private route = inject(ActivatedRoute);
  private fb = inject(FirebaseService);

  ngOnDestroy() {
    this.routeSub?.unsubscribe();
  }

  private routeSub?: Subscription;

  ngOnInit() {
    this.routeSub = this.route.paramMap.subscribe((params) => {
      const slug = params.get('slug');
      this.display(slug || '');
    });
  }

  private async display(slug: string) {
    this.loading.set(true);
    this.page.set(null);
    let current: SchoolPage | null = null;
    try {
      const dbPage = await this.fb.getSchoolPage(slug);
      if (dbPage) {
        current = this.toDisplayPage(dbPage);
      }
    } catch {
      current = null;
    }
    if (!current) {
      current = SCHOOL_PAGES[slug] ?? null;
    }
    if (!current) {
      current = {
        slug,
        title: this.titleFromSlug(slug),
        subtitle: 'Informacje z Zabrzańskiego Centrum Kształcenia Ogólnego i Zawodowego',
        sections: [
          {
            heading: 'Informacje',
            body: ['Treść tej podstrony jest w przygotowaniu.'],
            links: [{ label: 'Skontaktuj się z nami', url: '/kontakt' }],
          },
        ],
      };
    }
    this.page.set(current);
    this.loading.set(false);
  }

  private titleFromSlug(slug: string): string {
    return slug
      .split('-')
      .map((w) => (w ? w.charAt(0).toUpperCase() + w.slice(1) : w))
      .join(' ');
  }

  private toDisplayPage(r: SchoolPageRecord): SchoolPage {
    return {
      slug: r.slug,
      title: r.title,
      subtitle: r.subtitle,
      sections: (r.sections ?? []).map((s) => ({
        heading: s.heading,
        body: s.body && s.body.length ? s.body : undefined,
        links: s.links && s.links.length ? s.links : undefined,
      })),
    };
  }
}

import { Component, signal, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { SkeletonComponent } from '../../shared/components/skeleton/skeleton.component';
import { FirebaseService } from '../../core/services/firebase.service';
import { SchoolMenuGroup, SchoolPageRecord } from '../../core/models/database.types';
import { SCHOOL_PAGES, DEFAULT_SCHOOL_MENU, SchoolPage } from './school-content';

@Component({
  selector: 'app-school-page',
  standalone: true,
  imports: [PageHeaderComponent, RouterLink, SkeletonComponent],
  template: `
    @if (loading()) {
      <div class="py-12">
        <div class="container-main max-w-4xl">
          <div class="space-y-6" aria-busy="true">
            <app-skeleton type="title" [style.width]="'50%'"/>
            <app-skeleton type="text" [style.width]="'35%'"/>
            <div class="comic-card mt-6 space-y-3">
              <app-skeleton type="title" [style.width]="'40%'"/>
              <app-skeleton type="text"/>
              <app-skeleton type="text"/>
              <app-skeleton type="text" [style.width]="'75%'"/>
            </div>
          </div>
        </div>
      </div>
    } @else if (page()) {
      <app-page-header [title]="page()!.title" [subtitle]="page()!.subtitle" />

      <section class="py-12 md:py-16">
        <div class="container-main grid gap-10 lg:grid-cols-[minmax(210px,260px)_minmax(0,1fr)] lg:items-start">
          @if (schoolNavGroups().length > 0) {
            <details class="lg:hidden border-2 border-ink rounded-lg bg-surface shadow-[3px_3px_0_var(--color-ink)]">
              <summary class="flex items-center justify-between gap-4 px-4 py-3 cursor-pointer list-none font-heading font-bold text-ink">
                <span class="flex items-center gap-2">
                  <span class="w-2.5 h-2.5 rounded-full bg-petrol shrink-0"></span>
                  Nawigacja szkoły
                </span>
                <span class="text-xs text-ink-light font-normal">Rozwiń</span>
              </summary>
              <nav class="border-t-2 border-ink/10 px-4 py-4 space-y-4" aria-label="Nawigacja Szkoła">
                @for (group of schoolNavGroups(); track group.heading) {
                  <div>
                    <h2 class="text-[11px] font-heading font-bold uppercase tracking-wider text-petrol mb-1.5">{{ group.heading }}</h2>
                    <ul class="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">
                      @for (item of group.items; track item.url) {
                        <li>
                          @if (item.external) {
                            <a [href]="item.url" target="_blank" rel="noopener"
                              class="block py-1.5 text-sm text-ink-light hover:text-orange-primary transition-colors">
                              {{ item.label }}
                            </a>
                          } @else {
                            <a [routerLink]="item.url"
                              class="block py-1.5 text-sm text-ink-light hover:text-orange-primary transition-colors">
                              {{ item.label }}
                            </a>
                          }
                        </li>
                      }
                    </ul>
                  </div>
                }
              </nav>
            </details>

            <aside class="hidden lg:block border-l-4 border-petrol pl-4 lg:sticky lg:top-28" aria-label="Nawigacja Szkoła">
              <p class="text-xs font-heading font-bold uppercase tracking-widest text-petrol mb-3">Szkoła</p>
              <nav class="space-y-5">
                @for (group of schoolNavGroups(); track group.heading) {
                  <div>
                    <h2 class="text-xs font-heading font-bold uppercase tracking-wider text-ink-light mb-2">{{ group.heading }}</h2>
                    <ul class="space-y-1">
                      @for (item of group.items; track item.url) {
                        <li>
                          @if (item.external) {
                            <a [href]="item.url" target="_blank" rel="noopener"
                              class="block py-1 text-sm text-ink-light hover:text-orange-primary transition-colors">
                              {{ item.label }}
                            </a>
                          } @else {
                            <a [routerLink]="item.url"
                              class="block py-1 text-sm text-ink-light hover:text-orange-primary transition-colors">
                              {{ item.label }}
                            </a>
                          }
                        </li>
                      }
                    </ul>
                  </div>
                }
              </nav>
            </aside>
          }

          <div class="max-w-4xl">
            @for (section of page()!.sections; track section.heading) {
              <div class="mb-10">
                <h2 class="section-heading mb-4">{{ section.heading }}</h2>
                @if (section.body) {
                  <div class="space-y-3">
                    @for (paragraph of section.body; track paragraph) {
                      <p class="text-gray-700 leading-relaxed whitespace-pre-line">{{ paragraph }}</p>
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
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
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
  schoolMenu = signal<SchoolMenuGroup[]>(DEFAULT_SCHOOL_MENU);

  private route = inject(ActivatedRoute);
  private fb = inject(FirebaseService);

  ngOnDestroy() {
    this.routeSub?.unsubscribe();
  }

  private routeSub?: Subscription;

  ngOnInit() {
    this.loadSchoolMenu();
    this.routeSub = this.route.paramMap.subscribe((params) => {
      const slug = params.get('slug');
      this.display(slug || '');
    });
  }

  schoolNavGroups(): SchoolMenuGroup[] {
    const currentUrl = this.page() ? `/szkola/${this.page()!.slug}` : '';
    return this.schoolMenu()
      .map((group) => ({
        ...group,
        items: group.items.filter((item) => item.external || item.url !== currentUrl),
      }))
      .filter((group) => group.items.length > 0);
  }

  private async loadSchoolMenu() {
    try {
      const menu = await this.fb.getSchoolMenu();
      if (menu?.groups?.length) this.schoolMenu.set(menu.groups);
    } catch {
      this.schoolMenu.set(DEFAULT_SCHOOL_MENU);
    }
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

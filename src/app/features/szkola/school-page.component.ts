import { Component, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { SCHOOL_PAGES, SchoolPage } from './school-content';

@Component({
  selector: 'app-school-page',
  standalone: true,
  imports: [PageHeaderComponent, RouterLink],
  template: `
    @if (page()) {
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

  constructor(private route: ActivatedRoute) {}

  ngOnDestroy() {
    this.routeSub?.unsubscribe();
  }

  private routeSub?: Subscription;

  ngOnInit() {
    this.routeSub = this.route.paramMap.subscribe((params) => {
      const slug = params.get('slug');
      this.page.set(slug ? (SCHOOL_PAGES[slug] ?? null) : null);
    });
  }
}
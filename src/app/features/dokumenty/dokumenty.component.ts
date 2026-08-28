import { Component, signal, OnInit } from '@angular/core';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { SupabaseService } from '../../core/services/supabase.service';
import { Document } from '../../core/models/database.types';

@Component({
  selector: 'app-dokumenty',
  standalone: true,
  imports: [PageHeaderComponent],
  template: `
    <app-page-header title="Dokumenty" subtitle="Pliki do pobrania - statut, rekrutacja, regulaminy i więcej" />

    <section class="py-12 md:py-16">
      <div class="container-main">
        @for (category of categories(); track category) {
          <div class="mb-10">
            <h2 class="section-heading">{{ category }}</h2>
            <div class="space-y-3">
              @for (doc of documentsByCategory(category); track doc.id) {
                <a
                  [href]="doc.file_url"
                  target="_blank"
                  rel="noopener"
                  class="comic-card flex items-center gap-4 !p-4 hover:bg-surface">
                  <div class="w-12 h-12 shrink-0 bg-petrol border-2 border-ink rounded-lg flex items-center justify-center text-white font-heading font-bold text-lg">
                    PDF
                  </div>
                  <div class="flex-1 min-w-0">
                    <h3 class="font-heading text-lg text-ink line-clamp-1">{{ doc.title }}</h3>
                    @if (doc.description) {
                      <p class="text-gray-500 text-sm line-clamp-1">{{ doc.description }}</p>
                    }
                  </div>
                  <svg class="w-6 h-6 text-petrol shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
                  </svg>
                </a>
              }
            </div>
          </div>
        } @empty {
          <div class="text-center py-16">
            <p class="text-gray-500 text-lg">Brak dokumentów do wyświetlenia</p>
          </div>
        }
      </div>
    </section>
  `,
})
export class DokumentyComponent implements OnInit {
  documents = signal<Document[]>([]);

  categories = () => {
    const unique = new Set<string>();
    this.documents().forEach(d => unique.add(d.category));
    return Array.from(unique);
  };

  documentsByCategory = (category: string) =>
    this.documents().filter(d => d.category === category);

  constructor(private supabase: SupabaseService) {}

  async ngOnInit() {
    const { data } = await this.supabase.supabase
      .from('documents')
      .select('*')
      .order('created_at', { ascending: false });
    this.documents.set((data as Document[]) ?? []);
  }
}

import { Component, signal, OnDestroy, OnInit } from '@angular/core';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { SkeletonComponent } from '../../shared/components/skeleton/skeleton.component';
import { FirebaseService } from '../../core/services/firebase.service';
import { Document } from '../../core/models/database.types';
import { dataUrlToBlobUrl, revokeBlobUrl } from '../../shared/utils/pdf.utils';

@Component({
  selector: 'app-dokumenty',
  standalone: true,
  imports: [PageHeaderComponent, SkeletonComponent],
  template: `
    <app-page-header title="Dokumenty" subtitle="Pliki do pobrania - statut, rekrutacja, regulaminy i więcej" />

    <section class="py-12 md:py-16">
      <div class="container-main">
        @if (loading()) {
          <div class="space-y-10" aria-busy="true">
            @for (g of [1,2,3]; track g) {
              <div>
                <app-skeleton type="title" [style.width]="'35%'"/>
                <div class="mt-4 space-y-3">
                  @for (d of [1,2,3]; track d) {
                    <div class="comic-card flex items-center gap-4 !p-4">
                      <div class="w-12 h-12 shrink-0"><app-skeleton type="rect" /></div>
                      <div class="flex-1 space-y-2">
                        <app-skeleton type="text" [style.width]="'45%'"/>
                        <app-skeleton type="text" [style.width]="'70%'"/>
                      </div>
                    </div>
                  }
                </div>
              </div>
            }
          </div>
        } @else {
          @for (category of categories(); track category) {
            <div class="mb-10">
              <h2 class="section-heading">{{ category }}</h2>
              <div class="space-y-3">
                @for (doc of documentsByCategory(category); track doc.id) {
                  <a
                    [href]="doc.file_url"
                    rel="noopener"
                    [attr.download]="downloadName(doc.title, doc.file_name ?? doc.file_url)"
                    (click)="downloadDocument($event, doc)"
                    class="comic-card flex items-center gap-4 !p-4 hover:bg-surface">
                    <div class="w-12 h-12 shrink-0 bg-petrol border-2 border-ink rounded-lg flex items-center justify-center text-white font-heading font-bold text-lg">
                      {{ fileTypeLabel(doc) }}
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
        }
      </div>
    </section>
  `,
})
export class DokumentyComponent implements OnInit, OnDestroy {
  documents = signal<Document[]>([]);
  loading = signal(true);
  private blobUrls: string[] = [];

  categories = () => {
    const unique = new Set<string>();
    this.documents().forEach(d => unique.add(d.category));
    return Array.from(unique);
  };

  documentsByCategory = (category: string) =>
    this.documents().filter(d => d.category === category);

  fileTypeLabel(document: Document): string {
    return this.fileExtension(document.file_name ?? document.file_url) === 'ZIP' ? 'ZIP' : 'PDF';
  }

  private fileExtension(value: string): string {
    const match = value.toLowerCase().match(/\.([a-z0-9]+)(?:\?|$)/);
    return match?.[1]?.toUpperCase() ?? 'PDF';
  }

  downloadName(title: string, source: string): string {
    const normalized = title.trim().replace(/[^a-z0-9ąćęłńóśźż\s_-]/gi, '').replace(/\s+/g, '-');
    return `${normalized || 'dokument'}.${this.fileExtension(source).toLowerCase()}`;
  }

  async downloadDocument(event: MouseEvent, document: Document) {
    event.preventDefault();

    try {
      const response = await fetch(document.file_url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const blobUrl = URL.createObjectURL(await response.blob());
      const link = window.document.createElement('a');
      link.href = blobUrl;
      link.download = this.downloadName(document.title, document.file_name ?? document.file_url);
      link.click();
      window.setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
    } catch {
      window.open(document.file_url, '_blank', 'noopener');
    }
  }

  constructor(private fb: FirebaseService) {}

  async ngOnInit() {
    try {
      const data = await this.fb.listDocuments();
      const resolved = await Promise.all(
        data.map(async (document) => ({
          ...document,
          file_url: document.file_url
            ? await this.fb.resolveDocumentUrl(document.file_url)
            : await this.loadStoredPdf(document.id),
        })),
      );
      this.documents.set(resolved);
    } finally {
      this.loading.set(false);
    }
  }

  private async loadStoredPdf(documentId: string): Promise<string> {
    const pdf = await this.fb.getDocumentPdf(documentId);
    if (!pdf) return '';
    const blobUrl = dataUrlToBlobUrl(pdf.data);
    this.blobUrls.push(blobUrl);
    return blobUrl;
  }

  ngOnDestroy() {
    this.blobUrls.forEach((url) => revokeBlobUrl(url));
  }
}

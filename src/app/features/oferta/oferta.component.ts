import { Component, signal, OnInit } from '@angular/core';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { ProgramCardComponent } from '../../shared/components/program-card/program-card.component';
import { SupabaseService } from '../../core/services/supabase.service';
import { Program } from '../../core/models/database.types';

@Component({
  selector: 'app-oferta',
  standalone: true,
  imports: [PageHeaderComponent, ProgramCardComponent],
  template: `
    <app-page-header title="Oferta edukacyjna" subtitle="Poznaj nasze kierunki kształcenia w technikum i branżowej szkole I stopnia" />

    <section class="py-12 md:py-16">
      <div class="container-main">
        <div class="flex flex-wrap gap-3 mb-8">
          <button
            (click)="filter.set('all')"
            [class]="filter() === 'all' ? 'comic-btn-primary text-sm py-2 px-4' : 'comic-btn text-sm py-2 px-4 bg-surface text-ink'">
            Wszystkie
          </button>
          <button
            (click)="filter.set('technikum')"
            [class]="filter() === 'technikum' ? 'comic-btn-primary text-sm py-2 px-4' : 'comic-btn text-sm py-2 px-4 bg-surface text-ink'">
            Technikum
          </button>
          <button
            (click)="filter.set('branzowa')"
            [class]="filter() === 'branzowa' ? 'comic-btn-primary text-sm py-2 px-4' : 'comic-btn text-sm py-2 px-4 bg-surface text-ink'">
            Branżowa I stopnia
          </button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          @for (program of filteredPrograms(); track program.id) {
            <app-program-card [program]="program" />
          } @empty {
            <div class="col-span-full text-center py-16">
              <p class="text-gray-500 text-lg">Brak kierunków do wyświetlenia</p>
            </div>
          }
        </div>
      </div>
    </section>
  `,
})
export class OfertaComponent implements OnInit {
  programs = signal<Program[]>([]);
  filter = signal<'all' | 'technikum' | 'branzowa'>('all');

  filteredPrograms = () => {
    const f = this.filter();
    if (f === 'all') return this.programs();
    return this.programs().filter(p => p.school_type === f);
  };

  constructor(private supabase: SupabaseService) {}

  async ngOnInit() {
    const { data } = await this.supabase.supabase
      .from('programs')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });
    this.programs.set((data as Program[]) ?? []);
  }
}

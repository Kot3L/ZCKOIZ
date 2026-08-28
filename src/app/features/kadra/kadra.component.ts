import { Component, signal, OnInit } from '@angular/core';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { SupabaseService } from '../../core/services/supabase.service';
import { Staff } from '../../core/models/database.types';

@Component({
  selector: 'app-kadra',
  standalone: true,
  imports: [PageHeaderComponent],
  template: `
    <app-page-header title="Kadra" subtitle="Dyrekcja, nauczyciele i pracownicy naszej szkoły" />

    <section class="py-12 md:py-16">
      <div class="container-main">
        @if (management().length > 0) {
          <div class="mb-12">
            <h2 class="section-heading">Dyrekcja</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              @for (member of management(); track member.id) {
                <div class="comic-card text-center">
                  @if (member.photo_url) {
                    <div class="w-28 h-28 mx-auto mb-4 overflow-hidden rounded-full border-3 border-ink">
                      <img [src]="member.photo_url" [alt]="member.full_name" class="w-full h-full object-cover" />
                    </div>
                  } @else {
                    <div class="w-28 h-28 mx-auto mb-4 rounded-full border-3 border-ink bg-petrol flex items-center justify-center text-white font-heading text-4xl">
                      {{ member.full_name.charAt(0) }}
                    </div>
                  }
                  <h3 class="font-heading text-lg text-ink mb-1">{{ member.full_name }}</h3>
                  <span class="badge-orange mb-3">{{ member.position }}</span>
                  @if (member.email) {
                    <p class="text-sm text-gray-500 mt-2">{{ member.email }}</p>
                  }
                </div>
              }
            </div>
          </div>
        }

        @if (teachers().length > 0) {
          <div>
            <h2 class="section-heading">Nauczyciele</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              @for (teacher of teachers(); track teacher.id) {
                <div class="comic-card text-center">
                  @if (teacher.photo_url) {
                    <div class="w-24 h-24 mx-auto mb-4 overflow-hidden rounded-full border-3 border-ink">
                      <img [src]="teacher.photo_url" [alt]="teacher.full_name" class="w-full h-full object-cover" />
                    </div>
                  } @else {
                    <div class="w-24 h-24 mx-auto mb-4 rounded-full border-3 border-ink bg-petrol flex items-center justify-center text-white font-heading text-3xl">
                      {{ teacher.full_name.charAt(0) }}
                    </div>
                  }
                  <h3 class="font-heading text-lg text-ink mb-1">{{ teacher.full_name }}</h3>
                  <p class="text-sm text-gray-600 mb-2">{{ teacher.position }}</p>
                  @if (teacher.department) {
                    <span class="badge-petrol">{{ teacher.department }}</span>
                  }
                </div>
              }
            </div>
          </div>
        }
      </div>
    </section>
  `,
})
export class KadraComponent implements OnInit {
  management = signal<Staff[]>([]);
  teachers = signal<Staff[]>([]);

  constructor(private supabase: SupabaseService) {}

  async ngOnInit() {
    const { data } = await this.supabase.supabase
      .from('staff')
      .select('*')
      .order('display_order', { ascending: true });
    const all = (data as Staff[]) ?? [];
    this.management.set(all.filter(s => s.is_management));
    this.teachers.set(all.filter(s => !s.is_management));
  }
}

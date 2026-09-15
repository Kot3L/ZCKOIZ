import { Component, signal, OnInit } from '@angular/core';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { SkeletonComponent } from '../../shared/components/skeleton/skeleton.component';
import { FirebaseService } from '../../core/services/firebase.service';
import { Staff } from '../../core/models/database.types';

@Component({
  selector: 'app-kadra',
  standalone: true,
  imports: [PageHeaderComponent, SkeletonComponent],
  template: `
    <app-page-header title="Kadra" subtitle="Dyrekcja, nauczyciele i pracownicy naszej szkoły" />

    <section class="py-12 md:py-16">
      <div class="container-main">
        @if (loading()) {
          <div class="space-y-12" aria-busy="true">
            <div>
              <app-skeleton type="title" [style.width]="'30%'"/>
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                @for (s of [1,2,3]; track s) {
                  <div class="comic-card text-center">
                    <div class="w-28 h-28 mx-auto mb-4"><app-skeleton type="circle" /></div>
                    <app-skeleton type="title" [style.width]="'60%'" class="mx-auto block"/>
                    <div class="mt-3"><app-skeleton type="button" class="mx-auto block"/></div>
                  </div>
                }
              </div>
            </div>
            <div>
              <app-skeleton type="title" [style.width]="'30%'"/>
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                @for (s of [1,2,3,4,5,6]; track s) {
                  <div class="comic-card text-center">
                    <div class="w-24 h-24 mx-auto mb-4"><app-skeleton type="circle" /></div>
                    <app-skeleton type="title" [style.width]="'60%'" class="mx-auto block"/>
                    <div class="mt-3"><app-skeleton type="text" class="mx-auto block" [style.width]="'40%'"/></div>
                  </div>
                }
              </div>
            </div>
          </div>
        } @else {
          @if (management().length > 0) {
            <div class="mb-12">
              <h2 class="section-heading">Dyrekcja</h2>
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                @for (member of management(); track member.id) {
                  <div class="comic-card text-center">
                    <div class="relative w-28 h-28 mx-auto mb-4 overflow-hidden rounded-full border-3 border-ink bg-petrol flex items-center justify-center text-white font-heading text-4xl">
                      {{ initial(member.full_name) }}
                      @if (member.photo_url && !failedPhotos().has(member.id)) {
                        <img [src]="member.photo_url" [alt]="member.full_name" (error)="onPhotoError(member.id)" class="absolute inset-0 w-full h-full object-cover" />
                      }
                    </div>
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
                    <div class="relative w-24 h-24 mx-auto mb-4 overflow-hidden rounded-full border-3 border-ink bg-petrol flex items-center justify-center text-white font-heading text-3xl">
                      {{ initial(teacher.full_name) }}
                      @if (teacher.photo_url && !failedPhotos().has(teacher.id)) {
                        <img [src]="teacher.photo_url" [alt]="teacher.full_name" (error)="onPhotoError(teacher.id)" class="absolute inset-0 w-full h-full object-cover" />
                      }
                    </div>
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
        }
      </div>
    </section>
  `,
})
export class KadraComponent implements OnInit {
  management = signal<Staff[]>([]);
  teachers = signal<Staff[]>([]);
  failedPhotos = signal<Set<string>>(new Set());
  loading = signal(true);

  constructor(private fb: FirebaseService) {}

  onPhotoError(id: string) {
    this.failedPhotos.update((photos) => new Set(photos).add(id));
  }

  initial(name: string): string {
    return name.trim().charAt(0).toUpperCase();
  }

  async ngOnInit() {
    try {
      const all = await this.fb.listStaff();
      this.management.set(all.filter(s => s.is_management));
      this.teachers.set(all.filter(s => !s.is_management));
    } finally {
      this.loading.set(false);
    }
  }
}

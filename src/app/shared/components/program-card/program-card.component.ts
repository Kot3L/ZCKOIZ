import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Program } from '../../../core/models/database.types';

@Component({
  selector: 'app-program-card',
  standalone: true,
  imports: [RouterLink],
  template: `
    <a [routerLink]="['/oferta', program().slug]" class="comic-card block group overflow-hidden">
      @if (program().cover_image_url) {
        <div class="overflow-hidden -mx-6 -mt-6 mb-4 border-b-2 border-ink">
          <img
            [src]="program().cover_image_url"
            [alt]="program().title"
            class="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-300" />
        </div>
      }
      <div class="flex items-center gap-2 mb-3">
        <span [class]="program().school_type === 'technikum' ? 'badge-petrol' : 'badge-orange'">
          {{ program().school_type === 'technikum' ? 'Technikum' : 'Branżowa I st.' }}
        </span>
      </div>
      <h3 class="font-heading text-xl text-ink group-hover:text-orange-primary transition-colors mb-2">
        {{ program().title }}
      </h3>
      <p class="text-gray-600 text-sm leading-relaxed line-clamp-3">{{ program().description }}</p>
      <span class="inline-flex items-center gap-1 text-petrol font-heading font-semibold text-sm mt-4 uppercase tracking-wide group-hover:gap-2 transition-all">
        Dowiedz się więcej
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
      </span>
    </a>
  `,
})
export class ProgramCardComponent {
  program = input.required<Program>();
}

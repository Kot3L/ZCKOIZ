import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { News } from '../../../core/models/database.types';

@Component({
  selector: 'app-news-card',
  standalone: true,
  imports: [RouterLink, DatePipe],
  template: `
    <a [routerLink]="['/aktualnosci', news().slug]" class="comic-card block group overflow-hidden">
      @if (news().cover_image_url) {
        <div class="overflow-hidden -mx-6 -mt-6 mb-4 border-b-2 border-ink">
          <img
            [src]="news().cover_image_url"
            [alt]="news().title"
            class="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300" />
        </div>
      }
      <div class="flex items-center gap-2 mb-2">
        @if (news().status === 'draft') {
          <span class="badge-yellow">Szkic</span>
        }
        @if (news().published_at) {
          <span class="text-xs text-gray-500">{{ news().published_at | date:'dd.MM.yyyy' }}</span>
        }
      </div>
      <h3 class="font-heading text-xl text-ink group-hover:text-orange-primary transition-colors mb-2">
        {{ news().title }}
      </h3>
      <p class="text-gray-600 text-sm leading-relaxed line-clamp-3">{{ news().excerpt }}</p>
      <span class="inline-flex items-center gap-1 text-petrol font-heading font-semibold text-sm mt-4 uppercase tracking-wide group-hover:gap-2 transition-all">
        Czytaj więcej
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
      </span>
    </a>
  `,
})
export class NewsCardComponent {
  news = input.required<News>();
}

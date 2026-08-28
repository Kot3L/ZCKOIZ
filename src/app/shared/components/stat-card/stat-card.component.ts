import { Component, input } from '@angular/core';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  template: `
    <div class="comic-card text-center">
      <div class="text-3xl md:text-4xl font-heading font-bold text-orange-primary mb-1">
        {{ value() }}
      </div>
      <div class="text-sm text-gray-600 font-medium uppercase tracking-wide">
        {{ label() }}
      </div>
    </div>
  `,
})
export class StatCardComponent {
  value = input.required<string | number>();
  label = input.required<string>();
}

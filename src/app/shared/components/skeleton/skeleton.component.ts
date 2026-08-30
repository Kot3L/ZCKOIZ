import { Component, HostBinding, input } from '@angular/core';

@Component({
  selector: 'app-skeleton',
  standalone: true,
  template: ``,
  styles: [],
})
export class SkeletonComponent {
  type = input<'text' | 'title' | 'circle' | 'rect' | 'button'>('text');

  @HostBinding('class') get klass(): string {
    return 'sk-block sk-' + this.type();
  }

  @HostBinding('attr.aria-hidden') ariaHidden = 'true';
}

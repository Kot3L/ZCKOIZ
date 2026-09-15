import { Directive, ElementRef, input, OnDestroy, OnInit, signal } from '@angular/core';

@Directive({
  selector: '[inview]',
  standalone: true,
  host: {
    '[class.inview-visible]': 'visible()',
    '[class.inview-hidden]': '!visible()',
  },
})
export class InviewDirective implements OnInit, OnDestroy {
  delay = input<number>(0);

  visible = signal(false);

  private observer: IntersectionObserver | null = null;
  private fallbackTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(private el: ElementRef<HTMLElement>) {}

  ngOnInit() {
    if (this.delay()) {
      this.el.nativeElement.style.transitionDelay = `${this.delay()}ms`;
    }

    if (typeof IntersectionObserver === 'undefined' || typeof window === 'undefined') {
      this.visible.set(true);
      return;
    }

    const el = this.el.nativeElement;
    const rect = el.getBoundingClientRect();
    const viewport = window.innerHeight || document.documentElement.clientHeight;
    if (rect.top < viewport && rect.bottom > 0) {
      this.visible.set(true);
      return;
    }

    this.observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            this.visible.set(true);
            this.observer?.disconnect();
          }
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' },
    );

    this.observer.observe(el);

    this.fallbackTimer = setTimeout(() => {
      if (!this.visible()) {
        this.visible.set(true);
        this.observer?.disconnect();
      }
    }, 4000);
  }

  ngOnDestroy() {
    this.observer?.disconnect();
    if (this.fallbackTimer) clearTimeout(this.fallbackTimer);
  }
}
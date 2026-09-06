import { Component, input } from '@angular/core';

@Component({
  selector: 'app-page-header',
  standalone: true,
  template: `
    <section class="relative bg-hero border-b-3 border-ink py-12 md:py-16 halftone-bg overflow-hidden">
      <div class="comic-dots absolute inset-0 opacity-30 pointer-events-none"></div>

      <img
        src="/logobig.png"
        alt="logo ZCKOiZ Zabrze"
        class="absolute right-4 sm:right-8 top-4 sm:top-6 w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 object-contain pointer-events-none animate-float bg-transparent opacity-95"
      />

      <div class="comic-star animate-float pointer-events-none"
           style="width: 46px; height: 46px; top: 20%; right: 12%; transform: rotate(10deg);"></div>
      <div class="comic-star comic-star-white animate-float pointer-events-none"
           style="width: 30px; height: 30px; top: 62%; right: 4%; transform: rotate(-14deg); animation-delay: 0.7s;"></div>
      <div class="comic-star animate-float pointer-events-none"
           style="width: 24px; height: 24px; top: 46%; right: 34%; transform: rotate(24deg); animation-delay: 1.4s;"></div>

      <div class="comic-circle animate-float pointer-events-none"
           style="width: 40px; height: 40px; top: 18%; right: 40%; animation-delay: 1s;"></div>
      <div class="comic-circle animate-float pointer-events-none"
           style="width: 24px; height: 24px; bottom: 20%; right: 18%; opacity: 0.7; animation-delay: 1.8s;"></div>

      <div class="comic-wave pointer-events-none"
           style="width: 180px; top: 12%; right: 24%; opacity: 0.8;"></div>
      <div class="comic-scribble pointer-events-none"
           style="width: 120px; bottom: 18%; right: 44%; opacity: 0.8;"></div>

      <div class="comic-speed-lines pointer-events-none"
           style="top: -70px; right: -40px; width: 260px; height: 190px; transform: rotate(-16deg);"></div>

      <div class="container-main relative z-10 pr-16 sm:pr-0">
        <h1 class="text-4xl md:text-5xl text-white mb-2">{{ title() }}</h1>
        @if (subtitle()) {
          <p class="text-blue-100 text-lg max-w-2xl">{{ subtitle() }}</p>
        }
      </div>
    </section>
  `,
})
export class PageHeaderComponent {
  title = input.required<string>();
  subtitle = input<string>();
}

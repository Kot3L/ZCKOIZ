import { Component } from '@angular/core';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';

@Component({
  selector: 'app-edukacja-mundurowa',
  standalone: true,
  imports: [PageHeaderComponent],
  template: `
    <app-page-header
      title="Edukacja mundurowa"
      subtitle="Przygotowanie do służby, odpowiedzialności i pracy zespołowej" />

    <section class="py-12 md:py-16">
      <div class="container-main">
        <div class="max-w-4xl mb-12">
          <h2 class="section-heading mb-5">Edukacja mundurowa w ZCKOiZ</h2>
          <div class="space-y-4 text-gray-700 leading-relaxed text-lg">
            <p>
              Edukacja mundurowa rozwija dyscyplinę, odpowiedzialność, sprawność fizyczną oraz umiejętność współpracy w zespole.
            </p>
            <p>
              Zajęcia łączą wiedzę teoretyczną z praktycznymi ćwiczeniami i przygotowują uczniów do dalszego kształcenia oraz pracy w służbach mundurowych i instytucjach związanych z bezpieczeństwem publicznym.
            </p>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <article class="comic-card !p-6">
            <div class="w-12 h-12 mb-5 bg-blue-primary border-2 border-ink rounded-lg flex items-center justify-center text-white font-heading font-bold text-xl">01</div>
            <h2 class="font-heading text-xl text-orange-primary mb-3">Bezpieczeństwo</h2>
            <p class="text-ink text-sm leading-relaxed">Podstawy bezpieczeństwa i reagowania w sytuacjach zagrożenia.</p>
          </article>
          <article class="comic-card !p-6">
            <div class="w-12 h-12 mb-5 bg-petrol border-2 border-ink rounded-lg flex items-center justify-center text-white font-heading font-bold text-xl">02</div>
            <h2 class="font-heading text-xl text-orange-primary mb-3">Sprawność</h2>
            <p class="text-ink text-sm leading-relaxed">Kondycja i sprawność fizyczna przydatna w służbach mundurowych.</p>
          </article>
          <article class="comic-card !p-6">
            <div class="w-12 h-12 mb-5 bg-orange-primary border-2 border-ink rounded-lg flex items-center justify-center text-white font-heading font-bold text-xl">03</div>
            <h2 class="font-heading text-xl text-orange-primary mb-3">Współpraca</h2>
            <p class="text-ink text-sm leading-relaxed">Dyscyplina, pierwsza pomoc, praca zespołowa i odpowiedzialność za powierzone zadania.</p>
          </article>
        </div>
      </div>
    </section>
  `,
})
export class EdukacjaMundurowaComponent {}

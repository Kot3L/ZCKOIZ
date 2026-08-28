import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink],
  template: `
    <footer class="bg-dark text-white mt-auto">
      <div class="container-main py-12">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <div class="flex items-center gap-3 mb-4">
              <img
                src="/wlepka100szary.png"
                alt="ZCKOiZ Zabrze"
                class="w-14 h-14 md:w-16 md:h-16 object-contain rounded-xl border-2 border-white bg-surface shadow-[2px_2px_0_rgba(255,255,255,0.3)]"
              />
              <div>
                <span class="font-heading text-lg font-bold leading-tight block">ZCKOiZ</span>
                <span class="text-xs text-gray-400">Zabrze</span>
              </div>
            </div>
            <p class="text-gray-400 text-sm leading-relaxed">
              Zespół Centrów Kształcenia Zawodowego w Zabrzu. Kształcimy profesjonalistów od lat.
            </p>
          </div>

          <div>
            <h4 class="font-heading text-sm uppercase tracking-wider text-yellow-accent mb-4">Nawigacja</h4>
            <ul class="space-y-2">
              <li><a routerLink="/oferta" class="text-gray-400 hover:text-white transition-colors text-sm">Oferta edukacyjna</a></li>
              <li><a routerLink="/aktualnosci" class="text-gray-400 hover:text-white transition-colors text-sm">Aktualności</a></li>
              <li><a routerLink="/galeria" class="text-gray-400 hover:text-white transition-colors text-sm">Galeria</a></li>
              <li><a routerLink="/dokumenty" class="text-gray-400 hover:text-white transition-colors text-sm">Dokumenty</a></li>
              <li><a routerLink="/kadra" class="text-gray-400 hover:text-white transition-colors text-sm">Kadra</a></li>
            </ul>
          </div>

          <div>
            <h4 class="font-heading text-sm uppercase tracking-wider text-yellow-accent mb-4">Kontakt</h4>
            <ul class="space-y-2 text-sm text-gray-400">
              <li class="flex items-start gap-2">
                <svg class="w-4 h-4 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                ul. Wyzwolenia 30, 41-800 Zabrze
              </li>
              <li class="flex items-start gap-2">
                <svg class="w-4 h-4 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                sekretariat&#64;zckoiz.zabrze.pl
              </li>
              <li class="flex items-start gap-2">
                <svg class="w-4 h-4 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
                (32) 271-XX-XX
              </li>
            </ul>
          </div>

          <div>
            <h4 class="font-heading text-sm uppercase tracking-wider text-yellow-accent mb-4">Godziny pracy</h4>
            <ul class="space-y-2 text-sm text-gray-400">
              <li>Poniedziałek - Piątek</li>
              <li class="text-white font-semibold">7:00 - 16:00</li>
              <li class="mt-3 text-gray-500">Sekretariat czynny w godzinach 7:30 - 15:30</li>
            </ul>
          </div>
        </div>

        <div class="border-t border-gray-700 mt-8 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p class="text-gray-500 text-xs">
            &copy; {{ currentYear }} ZCKOiZ Zabrze. Wszelkie prawa zastrzeżone.
          </p>
          <a routerLink="/admin" class="text-gray-600 hover:text-gray-400 text-xs transition-colors">
            Panel administracyjny
          </a>
        </div>
      </div>
    </footer>
  `,
})
export class FooterComponent {
  currentYear = new Date().getFullYear();
}

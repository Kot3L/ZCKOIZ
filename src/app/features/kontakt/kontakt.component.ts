import { Component, signal, OnInit } from '@angular/core';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { ContactFormComponent } from '../../shared/components/contact-form/contact-form.component';
import { SkeletonComponent } from '../../shared/components/skeleton/skeleton.component';
import { FirebaseService } from '../../core/services/firebase.service';

@Component({
  selector: 'app-kontakt',
  standalone: true,
  imports: [PageHeaderComponent, ContactFormComponent, SkeletonComponent],
  template: `
    <app-page-header title="Kontakt" subtitle="Skontaktuj się z naszą szkołą" />

    <section class="py-12 md:py-16">
      <div class="container-main">
        <div class="grid grid-cols-1 lg:grid-cols-[1.05fr_1.35fr] gap-8 mb-12 items-stretch">
          @if (loading()) {
            <div class="space-y-6">
              <div class="comic-card space-y-3">
                <app-skeleton type="title" [style.width]="'40%'"/>
                <app-skeleton type="text"/>
                <app-skeleton type="text"/>
                <app-skeleton type="text" [style.width]="'60%'"/>
              </div>
              <div class="comic-card space-y-3">
                <app-skeleton type="title" [style.width]="'45%'"/>
                <app-skeleton type="text"/>
                <app-skeleton type="text"/>
                <app-skeleton type="text"/>
                <app-skeleton type="text" [style.width]="'70%'"/>
              </div>
            </div>
          } @else {
          <div class="space-y-6">
            <div class="comic-card">
              <h2 class="font-heading text-xl text-orange-primary mb-4">Dane kontaktowe</h2>
              <ul class="space-y-3 text-ink">
                <li class="flex items-start gap-3">
                  <svg class="w-5 h-5 mt-0.5 text-petrol shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                  {{ address }}
                </li>
                <li class="flex items-start gap-3">
                  <svg class="w-5 h-5 mt-0.5 text-petrol shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                  {{ email }}
                </li>
                <li class="flex items-start gap-3">
                  <svg class="w-5 h-5 mt-0.5 text-petrol shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
                  {{ phone }}
                </li>
              </ul>
            </div>

            <div class="comic-card">
              <h2 class="font-heading text-xl text-petrol mb-4">Godziny pracy sekretariatu</h2>
              <ul class="space-y-2 text-ink">
                <li class="flex justify-between"><span>Sekretariat czynny w godzinach</span><span class="font-semibold">7:30 - 15:30</span></li>
                <li class="flex justify-between"><span>Poniedziałek - Piątek (świetlica)</span><span class="font-semibold">7:00 - 16:00</span></li>
                <li class="flex justify-between text-ink-light"><span>Sobota</span><span>nieczynne</span></li>
                <li class="flex justify-between text-ink-light"><span>Niedziela</span><span>nieczynne</span></li>
              </ul>
            </div>
          </div>
          }

          <div class="comic-border overflow-hidden min-h-[380px] h-full">
            <iframe
              src="https://maps.google.com/maps?q=ZCKOiZ%20Zabrze%20Marsza%C5%82ka%20J.%20Pi%C5%82sudskiego%2058%2C%2041-800%20Zabrze&t=&z=15&ie=UTF8&iwloc=&output=embed"
              class="w-full h-full min-h-[380px]"
              loading="lazy"
              referrerpolicy="no-referrer-when-downgrade"
              allowfullscreen>
            </iframe>
          </div>
        </div>
      </div>
    </section>
  `,
})
export class KontaktComponent implements OnInit {
  address = 'Marszałka J. Piłsudskiego 58, Zabrze 41-800';
  email = 'sekretariat@zckoiz.zabrze.pl';
  phone = '+48 32 271 27 67';
  messageSent = signal(false);
  loading = signal(true);

  constructor(private fb: FirebaseService) {}

  async ngOnInit() {
    try {
      const settings = await this.fb.listSettings();
      const get = (key: string) => settings.find(s => s.key === key)?.value;
      if (get('contact_address')) this.address = get('contact_address')!;
      if (get('contact_email')) this.email = get('contact_email')!;
      if (get('contact_phone')) this.phone = get('contact_phone')!;
    } finally {
      this.loading.set(false);
    }
  }

  onFormSubmitted() {
    this.messageSent.set(true);
    setTimeout(() => this.messageSent.set(false), 8000);
  }
}

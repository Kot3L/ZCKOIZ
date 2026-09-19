import { Component, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SkeletonComponent } from '../../../shared/components/skeleton/skeleton.component';
import { AutoResizeDirective } from '../../../shared/directives/auto-resize.directive';
import { FirebaseService } from '../../../core/services/firebase.service';
import { OrgDateEntry, Organization } from '../../../core/models/database.types';

const SETTING_KEY = 'organizacja';

@Component({
  selector: 'app-organizacja-admin',
  standalone: true,
  imports: [FormsModule, SkeletonComponent, AutoResizeDirective],
  template: `
    <div class="space-y-6">
      <div>
        <h1 class="text-3xl text-ink mb-1">Organizacja roku</h1>
      </div>

      @if (message()) {
        <div [class]="messageType() === 'error' ? 'bg-red-50 text-red-700 border-red-500' : 'bg-green-50 text-green-700 border-green-500'"
             class="p-4 border-2 rounded-lg text-sm">{{ message() }}</div>
      }

      @if (loading()) {
        <div class="comic-card space-y-4" aria-busy="true">
          <app-skeleton type="title" [style.width]="'35%'"/>
          <app-skeleton type="button"/>
          <app-skeleton type="button"/>
          <app-skeleton type="button"/>
        </div>
      } @else {
      <div class="comic-card space-y-8">
        <section>
          <h2 class="font-heading text-xl text-orange-primary mb-1">Ważne daty</h2>
          <p class="text-sm text-gray-500 mb-4">Karty wyświetlane na górze podstrony.</p>
          <div class="space-y-4">
            @for (item of wazneDaty(); track $index) {
              <div class="border-2 border-ink/10 rounded-lg p-4 space-y-3">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label class="block text-sm font-semibold mb-1">Nazwa</label>
                    <input [(ngModel)]="item.label" name="wd_label_{{ $index }}" class="w-full px-4 py-2.5 border-2 border-ink rounded-lg" />
                  </div>
                  <div>
                    <label class="block text-sm font-semibold mb-1">Data / okres</label>
                    <input [(ngModel)]="item.date" name="wd_date_{{ $index }}" class="w-full px-4 py-2.5 border-2 border-ink rounded-lg" />
                  </div>
                </div>
                <div>
                  <label class="block text-sm font-semibold mb-1">Opis</label>
                  <textarea [(ngModel)]="item.detail" name="wd_detail_{{ $index }}" rows="2" autoResize class="w-full px-4 py-2.5 border-2 border-ink rounded-lg"></textarea>
                </div>
              </div>
            }
          </div>
        </section>

        <section>
          <div class="flex items-center justify-between mb-1">
            <h2 class="font-heading text-xl text-orange-primary">Dni wolne</h2>
          </div>
          <p class="text-sm text-gray-500 mb-4">Numerowana lista artykułów z datami.</p>
          <div class="space-y-4">
            @for (item of dniWolne(); track $index) {
              <div class="border-2 border-ink/10 rounded-lg p-4 space-y-3">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label class="block text-sm font-semibold mb-1">Nazwa</label>
                    <input [(ngModel)]="item.label" name="dw_label_{{ $index }}" class="w-full px-4 py-2.5 border-2 border-ink rounded-lg" />
                  </div>
                  <div>
                    <label class="block text-sm font-semibold mb-1">Data / okres</label>
                    <input [(ngModel)]="item.date" name="dw_date_{{ $index }}" class="w-full px-4 py-2.5 border-2 border-ink rounded-lg" />
                  </div>
                </div>
                <div class="flex items-start gap-3">
                  <div class="flex-1">
                    <label class="block text-sm font-semibold mb-1">Opis</label>
                    <textarea [(ngModel)]="item.detail" name="dw_detail_{{ $index }}" rows="2" autoResize class="w-full px-4 py-2.5 border-2 border-ink rounded-lg"></textarea>
                  </div>
                  <div class="mt-6">
                    <button type="button" (click)="removeDniWolne($index)"
                      class="comic-btn-danger text-sm !py-2 !px-3"
                      aria-label="Usuń dzień">
                      Usuń
                    </button>
                  </div>
                </div>
              </div>
            }
            @if (dniWolne().length === 0) {
              <p class="text-sm text-gray-500">Brak pozycji. Kliknij „Dodaj dzień".</p>
            }
          </div>
        </section>

        <section>
          <div class="flex items-center justify-between mb-1">
            <h2 class="font-heading text-xl text-orange-primary">Rozkład materiału</h2>
            <button type="button" (click)="addRozkladMaterialu()" class="comic-btn-primary text-xs py-1.5 px-3">Dodaj punkt</button>
          </div>
          <div class="space-y-3">
            @for (item of rozkladMaterialu(); track $index) {
              <div class="flex items-center gap-3">
                <textarea [(ngModel)]="rozkladMaterialu()[$index]" name="rm_{{ $index }}" rows="2" autoResize class="flex-1 px-4 py-2.5 border-2 border-ink rounded-lg"></textarea>
                <button type="button" (click)="removeRozkladMaterialu($index)" class="comic-btn-danger text-sm !py-2 !px-3">Usuń</button>
              </div>
            }
          </div>
        </section>

        <section>
          <div class="flex items-center justify-between mb-1">
            <h2 class="font-heading text-xl text-orange-primary">Samorząd uczniowski</h2>
            <button type="button" (click)="addSamorzad()" class="comic-btn-primary text-xs py-1.5 px-3">Dodaj punkt</button>
          </div>
          <div class="space-y-3">
            @for (item of samorzad(); track $index) {
              <div class="flex items-center gap-3">
                <textarea [(ngModel)]="samorzad()[$index]" name="samorzad_{{ $index }}" rows="2" autoResize class="flex-1 px-4 py-2.5 border-2 border-ink rounded-lg"></textarea>
                <button type="button" (click)="removeSamorzad($index)" class="comic-btn-danger text-sm !py-2 !px-3">Usuń</button>
              </div>
            }
          </div>
        </section>

        <div class="flex items-center gap-3 pt-2">
          <button (click)="save()" class="comic-btn-primary text-sm">Zapisz zmiany</button>
          <button type="button" (click)="addDniWolne()" class="comic-btn-primary text-xs py-1.5 px-3">Dodaj dzień</button>
        </div>
      </div>
      }
    </div>
  `,
})
export class OrganizacjaAdminComponent implements OnInit {
  wazneDaty = signal<OrgDateEntry[]>([]);
  dniWolne = signal<OrgDateEntry[]>([]);
  rozkladMaterialu = signal<string[]>([]);
  samorzad = signal<string[]>([]);
  message = signal<string | null>(null);
  messageType = signal<'success' | 'error'>('success');
  loading = signal(true);

  constructor(private fb: FirebaseService) {}

  async ngOnInit() {
    await this.load();
  }

  async load() {
    this.loading.set(true);
    try {
      let data: Organization | null = null;
      const setting = await this.fb.getSetting(SETTING_KEY);
      if (setting) {
        try {
          data = JSON.parse(setting.value) as Organization;
        } catch {
          data = null;
        }
      }
      this.wazneDaty.set(data?.wazne_daty?.length ? data.wazne_daty : this.defaultWazneDaty());
      this.dniWolne.set(data?.dni_wolne?.length ? data.dni_wolne : this.defaultDniWolne());
      this.rozkladMaterialu.set(data?.rozklad_materialu?.length ? data.rozklad_materialu : this.defaultRozkladMaterialu());
      this.samorzad.set(data?.samorzad?.length ? data.samorzad : this.defaultSamorzad());
    } catch (e: any) {
      this.setMessage('Błąd ładowania: ' + (e.message ?? e), 'error');
    } finally {
      this.loading.set(false);
    }
  }

  defaultWazneDaty(): OrgDateEntry[] {
    return [
      {
        label: 'Dni wolne od zajęć lekcyjnych',
        date: 'wrzesień – czerwiec',
        detail: 'Dni wolne od zajęć lekcyjnych ustalają przepisy oraz decyzje dyrektora szkoły w ciągu roku szkolnego.',
      },
      {
        label: 'Organizacja roku szkolnego',
        date: 'od 1 września',
        detail: 'Zasady organizacji roku szkolnego, wymiar zajęć oraz kalendarz roku szkolnego.',
      },
      {
        label: 'Wewnątrzszkolny regulamin zachowania',
        date: 'cały rok',
        detail: 'Prawa i obowiązki ucznia wynikające z wewnątrzszkolnego regulaminu zachowania.',
      },
    ];
  }

  defaultDniWolne(): OrgDateEntry[] {
    return [
      {
        label: 'Dzień Edukacji Narodowej',
        date: '14 października',
        detail: 'Dzień wolny od zajęć dydaktyczno-wychowawczych.',
      },
      {
        label: 'Wszystkich Świętych',
        date: '1 listopada',
        detail: 'Dzień wolny od zajęć dydaktyczno-wychowawczych.',
      },
      {
        label: 'Narodowe Święto Niepodległości',
        date: '11 listopada',
        detail: 'Dzień wolny od zajęć dydaktyczno-wychowawczych.',
      },
      {
        label: 'Zimowa przerwa świąteczna',
        date: 'grudzień – styczeń',
        detail: 'Przerwa świąteczna zgodnie z kalendarzem roku szkolnego.',
      },
    ];
  }

  defaultRozkladMaterialu(): string[] {
    return [
      'Kalendarz roku szkolnego i organizacja zajęć lekcyjnych.',
      'Zmiany organizacyjne i informacje o planie zajęć.',
      'Terminy egzaminów, sprawdzianów i konsultacji.',
    ];
  }

  defaultSamorzad(): string[] {
    return [
      'Samorząd Uczniowski reprezentuje uczniów wobec dyrekcji i grona pedagogicznego.',
      'Opiekunowie Samorządu i spotkania z uczniami.',
      'Działalność, inicjatywy i akcje szkolne.',
    ];
  }

  addDniWolne() {
    this.dniWolne.update((list) => [...list, { label: '', date: '', detail: '' }]);
  }

  removeDniWolne(index: number) {
    this.dniWolne.update((list) => list.filter((_, i) => i !== index));
  }

  addRozkladMaterialu() { this.rozkladMaterialu.update((list) => [...list, '']); }
  removeRozkladMaterialu(index: number) { this.rozkladMaterialu.update((list) => list.filter((_, i) => i !== index)); }
  addSamorzad() { this.samorzad.update((list) => [...list, '']); }
  removeSamorzad(index: number) { this.samorzad.update((list) => list.filter((_, i) => i !== index)); }

  async save() {
    const data: Organization = {
      wazne_daty: this.wazneDaty(),
      dni_wolne: this.dniWolne(),
      rozklad_materialu: this.rozkladMaterialu(),
      samorzad: this.samorzad(),
    };
    try {
      const existing = await this.fb.getSetting(SETTING_KEY);
      await this.fb.saveSetting({ key: SETTING_KEY, value: JSON.stringify(data) }, existing?.id);
      this.setMessage('Zapisano organizację roku.', 'success');
    } catch (e: any) {
      this.setMessage('Błąd: ' + (e.message ?? e), 'error');
    }
  }

  setMessage(msg: string, type: 'success' | 'error') {
    this.message.set(msg);
    this.messageType.set(type);
    setTimeout(() => this.message.set(null), 5000);
  }
}
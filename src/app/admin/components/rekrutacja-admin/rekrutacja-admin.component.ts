import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SkeletonComponent } from '../../../shared/components/skeleton/skeleton.component';
import { AutoResizeDirective } from '../../../shared/directives/auto-resize.directive';
import { FirebaseService } from '../../../core/services/firebase.service';
import { OrgDateEntry, Recruitment, RecruitmentStep } from '../../../core/models/database.types';

const SETTING_KEY = 'rekrutacja';

@Component({
  selector: 'app-rekrutacja-admin',
  standalone: true,
  imports: [FormsModule, SkeletonComponent, AutoResizeDirective],
  template: `
    <div class="space-y-6">
      <div>
        <h1 class="text-3xl text-ink mb-1">Rekrutacja</h1>
        <p class="text-sm text-gray-500">Treści wyświetlane na publicznej stronie rekrutacji.</p>
      </div>

      @if (message()) {
        <div [class]="messageType() === 'error' ? 'bg-red-50 text-red-700 border-red-500' : 'bg-green-50 text-green-700 border-green-500'"
             class="p-4 border-2 rounded-lg text-sm">{{ message() }}</div>
      }

      @if (loading()) {
        <div class="comic-card space-y-4" aria-busy="true">
          <app-skeleton type="title" [style.width]="'35%'" />
          <app-skeleton type="button" />
          <app-skeleton type="button" />
          <app-skeleton type="button" />
        </div>
      } @else {
        <div class="comic-card space-y-8">
          <section>
            <div class="flex items-center justify-between mb-1">
              <h2 class="font-heading text-xl text-orange-primary">Ważne terminy</h2>
              <button type="button" (click)="addTimeline()" class="comic-btn-primary text-xs py-1.5 px-3">Dodaj termin</button>
            </div>
            <div class="space-y-4">
              @for (item of timeline(); track $index) {
                <div class="border-2 border-ink/10 rounded-lg p-4 space-y-3">
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label class="block text-sm font-semibold mb-1">Nazwa</label>
                      <input [(ngModel)]="item.label" name="timeline_label_{{ $index }}" class="w-full px-4 py-2.5 border-2 border-ink rounded-lg" />
                    </div>
                    <div>
                      <label class="block text-sm font-semibold mb-1">Data / okres</label>
                      <input [(ngModel)]="item.date" name="timeline_date_{{ $index }}" class="w-full px-4 py-2.5 border-2 border-ink rounded-lg" />
                    </div>
                  </div>
                  <div class="flex items-start gap-3">
                    <div class="flex-1">
                      <label class="block text-sm font-semibold mb-1">Opis</label>
                      <textarea [(ngModel)]="item.detail" name="timeline_detail_{{ $index }}" rows="2" autoResize class="w-full px-4 py-2.5 border-2 border-ink rounded-lg"></textarea>
                    </div>
                    <button type="button" (click)="removeTimeline($index)" class="comic-btn-danger text-sm !py-2 !px-3 mt-6">Usuń</button>
                  </div>
                </div>
              }
            </div>
          </section>

          <section>
            <div class="flex items-center justify-between mb-1">
              <h2 class="font-heading text-xl text-orange-primary">Etapy rekrutacji</h2>
              <button type="button" (click)="addStep()" class="comic-btn-primary text-xs py-1.5 px-3">Dodaj etap</button>
            </div>
            <div class="space-y-4">
              @for (item of steps(); track $index) {
                <div class="border-2 border-ink/10 rounded-lg p-4 space-y-3">
                  <div>
                    <label class="block text-sm font-semibold mb-1">Nazwa etapu</label>
                    <input [(ngModel)]="item.title" name="step_title_{{ $index }}" class="w-full px-4 py-2.5 border-2 border-ink rounded-lg" />
                  </div>
                  <div class="flex items-start gap-3">
                    <div class="flex-1">
                      <label class="block text-sm font-semibold mb-1">Opis</label>
                      <textarea [(ngModel)]="item.detail" name="step_detail_{{ $index }}" rows="2" autoResize class="w-full px-4 py-2.5 border-2 border-ink rounded-lg"></textarea>
                    </div>
                    <button type="button" (click)="removeStep($index)" class="comic-btn-danger text-sm !py-2 !px-3 mt-6">Usuń</button>
                  </div>
                </div>
              }
            </div>
          </section>

          <section>
            <div class="flex items-center justify-between mb-1">
              <h2 class="font-heading text-xl text-orange-primary">Wymagane dokumenty</h2>
              <button type="button" (click)="addRequiredDoc()" class="comic-btn-primary text-xs py-1.5 px-3">Dodaj dokument</button>
            </div>
            <div class="space-y-3">
              @for (item of requiredDocs(); track $index) {
                <div class="flex items-center gap-3">
                  <input [(ngModel)]="requiredDocs()[$index]" name="required_doc_{{ $index }}" class="flex-1 px-4 py-2.5 border-2 border-ink rounded-lg" />
                  <button type="button" (click)="removeRequiredDoc($index)" class="comic-btn-danger text-sm !py-2 !px-3">Usuń</button>
                </div>
              }
            </div>
          </section>

          <section>
            <div class="flex items-center justify-between mb-1">
              <h2 class="font-heading text-xl text-orange-primary">Dodatkowe punkty</h2>
              <button type="button" (click)="addExtraPoint()" class="comic-btn-primary text-xs py-1.5 px-3">Dodaj punkt</button>
            </div>
            <div class="space-y-3">
              @for (item of extraPoints(); track $index) {
                <div class="flex items-center gap-3">
                  <input [(ngModel)]="extraPoints()[$index]" name="extra_point_{{ $index }}" class="flex-1 px-4 py-2.5 border-2 border-ink rounded-lg" />
                  <button type="button" (click)="removeExtraPoint($index)" class="comic-btn-danger text-sm !py-2 !px-3">Usuń</button>
                </div>
              }
            </div>
          </section>

          <button type="button" (click)="save()" class="comic-btn-primary text-sm">Zapisz zmiany</button>
        </div>
      }
    </div>
  `,
})
export class RekrutacjaAdminComponent implements OnInit {
  timeline = signal<OrgDateEntry[]>([]);
  steps = signal<RecruitmentStep[]>([]);
  requiredDocs = signal<string[]>([]);
  extraPoints = signal<string[]>([]);
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
      let data: Recruitment | null = null;
      const setting = await this.fb.getSetting(SETTING_KEY);
      if (setting) {
        try {
          data = JSON.parse(setting.value) as Recruitment;
        } catch {
          data = null;
        }
      }
      this.timeline.set(data?.timeline?.length ? data.timeline : this.defaultTimeline());
      this.steps.set(data?.steps?.length ? data.steps : this.defaultSteps());
      this.requiredDocs.set(data?.required_docs?.length ? data.required_docs : this.defaultRequiredDocs());
      this.extraPoints.set(data?.extra_points?.length ? data.extra_points : this.defaultExtraPoints());
    } catch (e: any) {
      this.setMessage('Błąd ładowania: ' + (e.message ?? e), 'error');
    } finally {
      this.loading.set(false);
    }
  }

  defaultTimeline(): OrgDateEntry[] {
    return [
      { date: 'od 15 maja', label: 'Składanie wniosków', detail: 'Rejestracja kandydatów przez system elektronicznej rekrutacji.' },
      { date: 'czerwiec-lipiec', label: 'Potwierdzanie woli', detail: 'Dostarczenie świadectw i zaświadczeń, potwierdzenie wyboru szkoły.' },
      { date: 'lipiec', label: 'Ogłoszenie wyników', detail: 'Publikacja list zakwalifikowanych i przyjętych kandydatów.' },
    ];
  }

  defaultSteps(): RecruitmentStep[] {
    return [
      { title: 'Zarejestruj się w systemie', detail: 'Utwórz konto i wypełnij wniosek o przyjęcie w internetowym systemie rekrutacji.' },
      { title: 'Wybierz kierunki', detail: 'Uszereguj wybrane kierunki kształcenia według swoich preferencji.' },
      { title: 'Dostarcz dokumenty', detail: 'Złóż świadectwo ukończenia szkoły i zaświadczenie o wynikach egzaminu.' },
      { title: 'Potwierdź wolę nauki', detail: 'W wyznaczonym terminie potwierdź chęć podjęcia nauki w naszej szkole.' },
    ];
  }

  defaultRequiredDocs(): string[] {
    return [
      'Wniosek o przyjęcie do szkoły',
      'Świadectwo ukończenia szkoły podstawowej',
      'Zaświadczenie o wynikach egzaminu ósmoklasisty',
      'Dwie fotografie',
      'Zaświadczenie lekarskie o braku przeciwwskazań do nauki w danym zawodzie',
    ];
  }

  defaultExtraPoints(): string[] {
    return [
      'świadectwo z wyróżnieniem (ukończenie szkoły z paskiem)',
      'wolontariat i aktywność społeczna',
      'osiągnięcia w konkursach przedmiotowych i olimpiadach',
      'szczególne osiągnięcia sportowe i artystyczne',
    ];
  }

  addTimeline() { this.timeline.update((items) => [...items, { date: '', label: '', detail: '' }]); }
  removeTimeline(index: number) { this.timeline.update((items) => items.filter((_, i) => i !== index)); }
  addStep() { this.steps.update((items) => [...items, { title: '', detail: '' }]); }
  removeStep(index: number) { this.steps.update((items) => items.filter((_, i) => i !== index)); }
  addRequiredDoc() { this.requiredDocs.update((items) => [...items, '']); }
  removeRequiredDoc(index: number) { this.requiredDocs.update((items) => items.filter((_, i) => i !== index)); }
  addExtraPoint() { this.extraPoints.update((items) => [...items, '']); }
  removeExtraPoint(index: number) { this.extraPoints.update((items) => items.filter((_, i) => i !== index)); }

  async save() {
    const data: Recruitment = {
      timeline: this.timeline(),
      steps: this.steps(),
      required_docs: this.requiredDocs(),
      extra_points: this.extraPoints(),
    };
    try {
      const existing = await this.fb.getSetting(SETTING_KEY);
      await this.fb.saveSetting({ key: SETTING_KEY, value: JSON.stringify(data) }, existing?.id);
      this.setMessage('Zapisano rekrutację.', 'success');
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

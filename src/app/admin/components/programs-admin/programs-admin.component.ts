import { Component, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SkeletonComponent } from '../../../shared/components/skeleton/skeleton.component';
import { FirebaseService } from '../../../core/services/firebase.service';
import { Program } from '../../../core/models/database.types';

@Component({
  selector: 'app-programs-admin',
  standalone: true,
  imports: [FormsModule, SkeletonComponent],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl text-ink mb-1">Kierunki kształcenia</h1>
        </div>
        <button (click)="toggleEditor(null)" class="comic-btn-primary text-sm">+ Dodaj kierunek</button>
      </div>

      @if (message()) {
        <div [class]="messageType() === 'error' ? 'bg-red-50 text-red-700 border-red-500' : 'bg-green-50 text-green-700 border-green-500'"
             class="p-4 border-2 rounded-lg text-sm">{{ message() }}</div>
      }

      @if (editing()) {
        <div class="comic-card">
          <h2 class="font-heading text-xl text-orange-primary mb-4">{{ form.id ? 'Edytuj kierunek' : 'Nowy kierunek' }}</h2>
          <form (submit)="saveItem($event)" class="space-y-4">
            <div>
              <label class="block text-sm font-semibold mb-1">Nazwa kierunku</label>
              <input [(ngModel)]="form.title" name="title" required class="w-full px-4 py-2.5 border-2 border-ink rounded-lg focus:outline-none focus:border-petrol" />
            </div>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label class="block text-sm font-semibold mb-1">Typ szkoły</label>
                <select [(ngModel)]="form.school_type" name="school_type" class="w-full px-4 py-2.5 border-2 border-ink rounded-lg bg-surface">
                  <option value="technikum">Technikum</option>
                  <option value="branzowa">Branżowa I stopnia</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-semibold mb-1">Kolejność</label>
                <input type="number" [(ngModel)]="form.display_order" name="display_order" class="w-full px-4 py-2.5 border-2 border-ink rounded-lg" />
              </div>
              <div class="flex items-end pb-2">
                <label class="inline-flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" [(ngModel)]="form.is_active" name="is_active" class="w-5 h-5" />
                  <span class="text-sm font-semibold">Aktywny</span>
                </label>
              </div>
            </div>
            <div>
              <label class="block text-sm font-semibold mb-1">Opis</label>
              <textarea [(ngModel)]="form.description" name="description" rows="3" class="w-full px-4 py-2.5 border-2 border-ink rounded-lg"></textarea>
            </div>
            <div>
              <label class="block text-sm font-semibold mb-1">Czego się uczysz?</label>
              <textarea [(ngModel)]="form.what_you_learn" name="what_you_learn" rows="3" class="w-full px-4 py-2.5 border-2 border-ink rounded-lg"></textarea>
            </div>
            <div>
              <label class="block text-sm font-semibold mb-1">Perspektywy pracy</label>
              <textarea [(ngModel)]="form.career_prospects" name="career_prospects" rows="3" class="w-full px-4 py-2.5 border-2 border-ink rounded-lg"></textarea>
            </div>
            <div class="flex gap-3">
              <button type="submit" class="comic-btn-primary text-sm">Zapisz</button>
              <button type="button" (click)="editing.set(false)" class="comic-btn text-sm bg-surface text-ink">Anuluj</button>
            </div>
          </form>
        </div>
      }

      @if (loading()) {
        <div class="bg-surface comic-border overflow-hidden" aria-busy="true">
          <div class="p-5 space-y-4">
            @for (r of [1,2,3,4,5]; track r) {
              <div class="space-y-2">
                <app-skeleton type="title" [style.width]="'35%'"/>
                <app-skeleton type="text" [style.width]="'60%'"/>
              </div>
            }
          </div>
        </div>
      } @else {
      <div class="bg-surface comic-border overflow-hidden">
        <table class="w-full text-left text-sm">
          <thead>
            <tr class="bg-cream-dark border-b-2 border-ink">
              <th class="px-4 py-3 font-heading uppercase text-xs">Kierunek</th>
              <th class="px-4 py-3 font-heading uppercase text-xs">Typ</th>
              <th class="px-4 py-3 font-heading uppercase text-xs">Kolejność</th>
              <th class="px-4 py-3 font-heading uppercase text-xs">Status</th>
              <th class="px-4 py-3 font-heading uppercase text-xs text-right">Akcje</th>
            </tr>
          </thead>
          <tbody>
            @for (item of listItems(); track item.id) {
              <tr class="border-b border-ink/10 hover:bg-cream transition-colors">
                <td class="px-4 py-3 font-medium">{{ item.title }}</td>
                <td class="px-4 py-3">
                  <span [class]="item.school_type === 'technikum' ? 'badge-petrol' : 'badge-orange'">{{ item.school_type === 'technikum' ? 'Technikum' : 'Branżowa' }}</span>
                </td>
                <td class="px-4 py-3 text-gray-500">{{ item.display_order }}</td>
                <td class="px-4 py-3">
                  <span [class]="item.is_active ? 'badge-petrol' : 'badge-yellow'">{{ item.is_active ? 'Aktywny' : 'Nieaktywny' }}</span>
                </td>
                <td class="px-4 py-3">
                  <div class="flex justify-end gap-2">
                    <button (click)="toggleEditor(item)" class="comic-btn text-xs !py-1.5 !px-3 bg-surface text-ink">Edytuj</button>
                    <button (click)="deleteItem(item)" class="comic-btn-danger text-xs !py-1.5 !px-3">Usuń</button>
                  </div>
                </td>
              </tr>
            } @empty {
              <tr><td colspan="5" class="px-4 py-8 text-center text-gray-500">Brak kierunków</td></tr>
            }
          </tbody>
        </table>
      </div>
      }
    </div>
  `,
})
export class ProgramsAdminComponent implements OnInit {
  items = signal<Program[]>([]);
  editing = signal(false);
  message = signal<string | null>(null);
  messageType = signal<'success' | 'error'>('success');
  loading = signal(true);

  form = {
    id: '',
    title: '',
    description: '',
    what_you_learn: '',
    career_prospects: '',
    school_type: 'technikum',
    display_order: 0,
    is_active: true,
  };

  constructor(private fb: FirebaseService) {}

  async ngOnInit() {
    try {
      await this.load();
    } finally {
      this.loading.set(false);
    }
  }

  async load() {
    this.items.set(await this.fb.listPrograms());
  }

  listItems(): Program[] {
    const editingId = this.editing() ? this.form.id : '';
    return editingId ? this.items().filter((item) => item.id !== editingId) : this.items();
  }

  toggleEditor(item: Program | null) {
    if (item) {
      this.form = {
        id: item.id,
        title: item.title,
        description: item.description,
        what_you_learn: item.what_you_learn,
        career_prospects: item.career_prospects,
        school_type: item.school_type,
        display_order: item.display_order,
        is_active: item.is_active,
      };
    } else {
      this.form = {
        id: '',
        title: '',
        description: '',
        what_you_learn: '',
        career_prospects: '',
        school_type: 'technikum',
        display_order: this.items().length + 1,
        is_active: true,
      };
    }
    this.editing.set(true);
  }

  private slugify(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9ąęśćżźół]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  async saveItem(event: Event) {
    event.preventDefault();

    const payload: any = {
      title: this.form.title,
      slug: this.slugify(this.form.title),
      description: this.form.description,
      what_you_learn: this.form.what_you_learn,
      career_prospects: this.form.career_prospects,
      school_type: this.form.school_type,
      display_order: this.form.display_order,
      is_active: this.form.is_active,
    };

    let error: any;
    try {
      await this.fb.saveProgram(payload, this.form.id || undefined);
    } catch (e) {
      error = e;
    }

    if (error) {
      this.setMessage('Błąd: ' + error.message, 'error');
    } else {
      this.setMessage('Zapisano.', 'success');
      this.editing.set(false);
      await this.load();
    }
  }

  async deleteItem(item: Program) {
    if (!confirm(`Usunąć kierunek "${item.title}"?`)) return;
    try {
      await this.fb.deleteProgram(item.id);
    } catch (e: any) {
      this.setMessage('Błąd: ' + e.message, 'error');
      return;
    }
    this.setMessage('Usunięto.', 'success');
    await this.load();
  }

  setMessage(msg: string, type: 'success' | 'error') {
    this.message.set(msg);
    this.messageType.set(type);
    setTimeout(() => this.message.set(null), 5000);
  }
}

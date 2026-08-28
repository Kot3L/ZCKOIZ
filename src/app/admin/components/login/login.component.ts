import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SupabaseService } from '../../../core/services/supabase.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="min-h-screen bg-dark halftone-bg flex items-center justify-center p-4">
      <div class="relative z-10 w-full max-w-md">
        <div class="comic-card !p-8 bg-surface">
          <div class="flex justify-center mb-6">
            <div class="w-16 h-16 bg-orange-primary border-3 border-ink rounded-xl flex items-center justify-center font-heading text-white font-bold text-3xl shadow-[4px_4px_0_var(--color-ink)]">
              Z
            </div>
          </div>
          <h1 class="text-center text-2xl text-ink mb-1">ZCKOiZ Zabrze</h1>
          <p class="text-center text-gray-500 text-sm mb-8">Zaloguj się do panelu administracyjnego</p>

          @if (error()) {
            <div class="mb-4 p-4 bg-red-50 border-2 border-red-500 rounded-lg text-red-700 text-sm">
              {{ error() }}
            </div>
          }

          <form (submit)="onSubmit($event)" class="space-y-4">
            <div>
              <label class="block text-sm font-heading font-semibold uppercase tracking-wide mb-1">Email</label>
              <input
                type="email"
                [(ngModel)]="email"
                name="email"
                required
                autocomplete="email"
                class="w-full px-4 py-3 border-2 border-ink rounded-lg bg-surface focus:outline-none focus:border-petrol focus:ring-2 focus:ring-petrol/20 transition-all"
                placeholder="adres@email.pl" />
            </div>
            <div>
              <label class="block text-sm font-heading font-semibold uppercase tracking-wide mb-1">Hasło</label>
              <input
                type="password"
                [(ngModel)]="password"
                name="password"
                required
                autocomplete="current-password"
                class="w-full px-4 py-3 border-2 border-ink rounded-lg bg-surface focus:outline-none focus:border-petrol focus:ring-2 focus:ring-petrol/20 transition-all"
                placeholder="••••••••" />
            </div>
            <button
              type="submit"
              [disabled]="loading()"
              class="comic-btn-primary w-full justify-center disabled:opacity-50 disabled:cursor-not-allowed">
              @if (loading()) {
                <span>Logowanie...</span>
              } @else {
                <span>Zaloguj się</span>
              }
            </button>
          </form>

          <a routerLink="/" class="block text-center text-sm text-petrol mt-6 font-medium hover:underline">
            ← Powrót na stronę główną
          </a>
        </div>
      </div>
    </div>
  `,
})
export class LoginComponent {
  email = '';
  password = '';
  error = signal<string | null>(null);
  loading = signal(false);

  constructor(
    private supabase: SupabaseService,
    private router: Router,
  ) {}

  async onSubmit(event: Event) {
    event.preventDefault();
    this.error.set(null);
    this.loading.set(true);
    try {
      await this.supabase.signIn(this.email, this.password);
      this.router.navigate(['/admin']);
    } catch (e: any) {
      this.error.set(e?.message ?? 'Nie udało się zalogować.');
    } finally {
      this.loading.set(false);
    }
  }
}

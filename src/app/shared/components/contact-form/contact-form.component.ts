import { Component, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-contact-form',
  standalone: true,
  imports: [FormsModule],
  template: `
    <form (submit)="onSubmit($event)" class="space-y-4">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-heading font-semibold uppercase tracking-wide mb-1">Imię i nazwisko</label>
          <input
            type="text"
            [(ngModel)]="formData.name"
            name="name"
            required
            class="w-full px-4 py-3 border-2 border-ink rounded-lg bg-surface focus:outline-none focus:border-petrol focus:ring-2 focus:ring-petrol/20 transition-all"
            placeholder="Jan Kowalski" />
        </div>
        <div>
          <label class="block text-sm font-heading font-semibold uppercase tracking-wide mb-1">Email</label>
          <input
            type="email"
            [(ngModel)]="formData.email"
            name="email"
            required
            class="w-full px-4 py-3 border-2 border-ink rounded-lg bg-surface focus:outline-none focus:border-petrol focus:ring-2 focus:ring-petrol/20 transition-all"
            placeholder="jan&#64;example.com" />
        </div>
      </div>
      <div>
        <label class="block text-sm font-heading font-semibold uppercase tracking-wide mb-1">Temat</label>
        <input
          type="text"
          [(ngModel)]="formData.subject"
          name="subject"
          required
          class="w-full px-4 py-3 border-2 border-ink rounded-lg bg-surface focus:outline-none focus:border-petrol focus:ring-2 focus:ring-petrol/20 transition-all"
          placeholder="Temat wiadomości" />
      </div>
      <div>
        <label class="block text-sm font-heading font-semibold uppercase tracking-wide mb-1">Wiadomość</label>
        <textarea
          [(ngModel)]="formData.message"
          name="message"
          required
          rows="5"
          class="w-full px-4 py-3 border-2 border-ink rounded-lg bg-surface focus:outline-none focus:border-petrol focus:ring-2 focus:ring-petrol/20 transition-all resize-y"
          placeholder="Treść wiadomości..."></textarea>
      </div>
      <button type="submit" class="comic-btn-primary w-full md:w-auto">
        Wyślij wiadomość
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
        </svg>
      </button>
    </form>
  `,
})
export class ContactFormComponent {
  submitted = output<FormData>();

  formData = {
    name: '',
    email: '',
    subject: '',
    message: '',
  };

  onSubmit(event: Event) {
    event.preventDefault();
    const fd = new FormData();
    fd.append('name', this.formData.name);
    fd.append('email', this.formData.email);
    fd.append('subject', this.formData.subject);
    fd.append('message', this.formData.message);
    this.submitted.emit(fd);
    this.formData = { name: '', email: '', subject: '', message: '' };
  }
}

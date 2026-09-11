import { Component, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SkeletonComponent } from '../../../shared/components/skeleton/skeleton.component';
import { FirebaseService } from '../../../core/services/firebase.service';
import {
  SchoolMenuGroup,
  SchoolPageSection,
  SchoolPageRecord,
  SchoolPageLink,
} from '../../../core/models/database.types';
import { SCHOOL_PAGES, DEFAULT_SCHOOL_MENU } from '../../../features/szkola/school-content';

interface MenuFormItem {
  _id: string;
  label: string;
  kind: 'school' | 'custom';
  slug: string;
  url: string;
  external: boolean;
}

interface MenuFormGroup {
  _id: string;
  heading: string;
  items: MenuFormItem[];
}

@Component({
  selector: 'app-school-admin',
  standalone: true,
  imports: [FormsModule, SkeletonComponent],
  template: `
    <div class="space-y-6">
      <div>
        <h1 class="text-3xl text-ink mb-1">Szkoła</h1>
        <p class="text-gray-500">Zarządzaj menu „Szkoła” oraz treścią podstron</p>
      </div>

      @if (message()) {
        <div [class]="messageType() === 'error' ? 'bg-red-50 text-red-700 border-red-500' : 'bg-green-50 text-green-700 border-green-500'"
             class="p-4 border-2 rounded-lg text-sm">{{ message() }}</div>
      }

      @if (loading()) {
        <div class="comic-card space-y-4" aria-busy="true">
          <app-skeleton type="title" [style.width]="'50%'"/>
          <app-skeleton type="text" [style.width]="'70%'"/>
          <div class="border-2 border-ink/20 rounded-lg p-4 space-y-3">
            <app-skeleton type="title" [style.width]="'30%'"/>
            <app-skeleton type="text"/>
            <app-skeleton type="text" [style.width]="'60%'"/>
          </div>
          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            @for (s of [1,2,3,4,5,6,7,8]; track s) {
              <app-skeleton type="rect" [style]="{ height: '56px', 'aspect-ratio': 'auto' }" class="rounded-lg"/>
            }
          </div>
        </div>
      } @else {

      <!-- ===== Dropdown menu editor ===== -->
      <div class="comic-card">
        <div class="flex items-center justify-between">
          <h2 class="font-heading text-xl text-orange-primary mb-1">Menu rozwijane „Szkoła”</h2>
          <button (click)="addGroup()" class="comic-btn text-sm bg-surface text-ink">+ Dodaj grupę</button>
        </div>
        <p class="text-gray-500 text-sm mb-4">Grupy i pozycje widoczne w rozwijanym menu nawigacji.</p>

        <div class="space-y-6">
          @for (group of menuForm.groups; track group._id) {
            @let gi = $index;
            <div class="border-2 border-ink/20 rounded-lg p-4">
              <div class="flex items-center gap-3 mb-3">
                <input [(ngModel)]="group.heading" [name]="'group_heading_' + gi" placeholder="Nazwa grupy"
                  (ngModelChange)="onMenuChanged()"
                  class="flex-1 px-3 py-2 border-2 border-ink rounded-lg font-semibold" />
                <span class="text-gray-400 text-xs whitespace-nowrap shrink-0">Pozycje: {{ group.items.length }}</span>
                <button (click)="removeGroup(gi)" class="comic-btn text-xs !py-1.5 !px-3 bg-red-50 text-red-600 !shadow-[2px_2px_0_#991b1b] !border-red-600 shrink-0">Usuń grupę</button>              </div>

              <div class="space-y-2">
                @for (item of group.items; track item._id) {
                  @let ii = $index;
                  <div class="flex items-center gap-2">
                    <input [(ngModel)]="item.label" [name]="'label_' + gi + '_' + ii" placeholder="Nazwa widoczna w menu"
                      (ngModelChange)="onMenuChanged()"
                      class="w-44 min-w-0 px-3 py-2 text-sm border-2 border-ink rounded-lg" />
                    <select [(ngModel)]="item.kind" [name]="'kind_' + gi + '_' + ii"
                      (ngModelChange)="onMenuChanged()"
                      class="px-3 py-2 text-sm border-2 border-ink rounded-lg bg-surface">
                      <option value="school">Podstrona szkoły</option>
                      <option value="custom">Dowolny link</option>
                    </select>
                    @if (item.kind === 'school') {
                      <div class="flex-1 min-w-0 flex flex-col gap-1">
                        <select [(ngModel)]="item.slug" [name]="'slug_' + gi + '_' + ii"
                          (ngModelChange)="onMenuChanged()"
                          class="w-full px-3 py-2 text-sm border-2 border-ink rounded-lg bg-surface">
                          <option value="">— wybierz podstronę z listy albo wpisz nazwę —</option>
                          @for (page of pages(); track page.slug) {
                            <option [value]="page.slug">{{ page.title }} (/szkola/{{ page.slug }})</option>
                          }
                          @if (item.slug && !pages().some((p) => p.slug === item.slug)) {
                            <option [value]="item.slug">{{ titleFromSlug(item.slug) }} (/szkola/{{ item.slug }})</option>
                          }
                        </select>
                        <span class="text-xs text-petrol font-mono truncate">szkola/{{ item.slug || slugFromName(item.label) }}</span>
                      </div>
                    } @else {
                      <input [(ngModel)]="item.url" [name]="'url_' + gi + '_' + ii" placeholder="https://… lub /…"
                        (ngModelChange)="onMenuChanged()"
                        class="flex-1 min-w-0 px-3 py-2 text-sm border-2 border-ink rounded-lg" />
                      <label class="flex items-center gap-1 text-xs whitespace-nowrap text-gray-600">
                        <input type="checkbox" [(ngModel)]="item.external" [name]="'ext_' + gi + '_' + ii" (ngModelChange)="onMenuChanged()" class="accent-petrol" />
                        zewn.
                      </label>
                    }
                    <button (click)="removeItem(gi, ii)" title="Usuń pozycję"
                      class="w-7 h-7 shrink-0 bg-red-600 text-white rounded-full text-sm font-bold border border-ink">×</button>
                  </div>
                }
              </div>
              <div class="flex gap-2 mt-3">
                <button (click)="addItem(gi)" class="comic-btn text-sm bg-surface text-ink">+ Dodaj pozycję</button>
              </div>
            </div>
          }
        </div>

        <button (click)="saveMenu()" class="comic-btn-primary text-sm mt-6">Zapisz menu</button>
      </div>

      <!-- ===== Page content editor ===== -->
      <div class="comic-card">
        <div class="flex items-center justify-between">
          <h2 class="font-heading text-xl text-orange-primary mb-1">Treść podstron</h2>
          <button (click)="resetPageEditor()" class="comic-btn text-sm bg-surface text-ink">+ Nowa podstrona</button>
        </div>
        <p class="text-gray-500 text-sm mb-4">Wybierz podstronę, aby edytować jej treść.</p>

        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
          @for (page of pages(); track page.slug) {
            <div class="relative">
              <button (click)="editPage(page.slug)"
                class="w-full text-left px-3 py-2 pr-8 rounded-lg border-2 border-ink/20 hover:border-petrol hover:bg-cream transition-colors text-sm">
                <span class="font-semibold">{{ page.title }}</span>
                <span class="block text-xs text-gray-400 mt-1">/szkola/{{ page.slug }}</span>
              </button>
              <button (click)="deletePage(page.slug, $event)" title="Usuń podstronę"
                class="absolute top-1.5 right-1.5 w-6 h-6 shrink-0 bg-red-600 text-white rounded-full text-xs font-bold border border-ink opacity-60 hover:opacity-100">×</button>
            </div>
          }
        </div>

        @if (pageEditorOpen()) {
          <div class="mt-6 border-t-2 border-ink/10 pt-6">
            <h3 class="font-heading text-lg text-petrol mb-4">
              {{ pageForm.slug ? 'Edytuj: ' + pageForm.slug : 'Nowa podstrona' }}
            </h3>
            <form (submit)="savePage($event)" class="space-y-4">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-semibold mb-1">Tytuł</label>
                  <input [(ngModel)]="pageForm.title" (ngModelChange)="onTitleChange()" name="page_title" required class="w-full px-4 py-2.5 border-2 border-ink rounded-lg" />
                </div>
                <div>
                  <label class="block text-sm font-semibold mb-1">Sług (adres /szkola/…)</label>
                  <input [(ngModel)]="pageForm.slug" name="page_slug" required class="w-full px-4 py-2.5 border-2 border-ink rounded-lg" />
                </div>
              </div>
              <div>
                <label class="block text-sm font-semibold mb-1">Podtytuł</label>
                <input [(ngModel)]="pageForm.subtitle" name="page_subtitle" class="w-full px-4 py-2.5 border-2 border-ink rounded-lg" />
              </div>

              <div class="flex items-center justify-between">
                <h4 class="font-heading font-semibold text-orange-primary">Sekcje</h4>
                <button type="button" (click)="addSection()" class="comic-btn text-sm bg-surface text-ink">+ Dodaj sekcję</button>
              </div>

              <div class="space-y-6">
                @for (section of pageForm.sections; track $index) {
                  @let si = $index;
                  <div class="border-2 border-ink/20 rounded-lg p-4 space-y-3">
                    <div class="flex items-center gap-2">
                      <input [(ngModel)]="section.heading" [name]="'sec_head_' + si" placeholder="Nagłówek sekcji"
                        class="flex-1 px-3 py-2 border-2 border-ink rounded-lg font-semibold" />
                      <button type="button" (click)="removeSection(si)"
                        class="comic-btn text-xs !py-1.5 !px-3 bg-red-50 text-red-600 !shadow-[2px_2px_0_#991b1b] !border-red-600">Usuń sekcję</button>
                    </div>

                    <div>
                      <p class="text-xs font-semibold text-gray-600 mb-1">Akapity</p>
                      <div class="space-y-2">
                        @for (paragraph of section.body; track $index) {
                          @let pi = $index;
                          <div class="flex items-center gap-2">
                            <textarea [(ngModel)]="section.body![pi]" [name]="'body_' + si + '_' + pi" rows="5"
                              class="flex-1 px-4 py-2.5 text-sm border-2 border-ink rounded-lg focus:outline-none focus:border-petrol"></textarea>
                            <button type="button" (click)="removeParagraph(si, pi)" title="Usuń akapit"
                              class="w-7 h-7 shrink-0 bg-red-600 text-white rounded-full text-sm font-bold border border-ink">×</button>
                          </div>
                        }
                      </div>
                      <button type="button" (click)="addParagraph(si)" class="comic-btn text-xs bg-surface text-ink mt-2">+ Dodaj akapit</button>
                    </div>

                    <div>
                      <p class="text-xs font-semibold text-gray-600 mb-1">Linki</p>
                      <div class="space-y-2">
                        @for (link of section.links; track $index) {
                          @let li = $index;
                          <div class="flex items-center gap-2">
                            <input [(ngModel)]="link.label" [name]="'lnk_l_' + si + '_' + li" placeholder="Etykieta"
                              class="flex-1 min-w-0 px-3 py-2 text-sm border-2 border-ink rounded-lg" />
                            <input [(ngModel)]="link.url" [name]="'lnk_u_' + si + '_' + li" placeholder="Link"
                              class="flex-1 min-w-0 px-3 py-2 text-sm border-2 border-ink rounded-lg" />
                            <label class="flex items-center gap-1 text-xs whitespace-nowrap text-gray-600">
                              <input type="checkbox" [(ngModel)]="link.external" [name]="'lnk_e_' + si + '_' + li" class="accent-petrol" />
                              zewn.
                            </label>
                            <button type="button" (click)="removeLink(si, li)" title="Usuń link"
                              class="w-7 h-7 shrink-0 bg-red-600 text-white rounded-full text-sm font-bold border border-ink">×</button>
                          </div>
                        }
                      </div>
                      <button type="button" (click)="addLink(si)" class="comic-btn text-xs bg-surface text-ink mt-2">+ Dodaj link</button>
                    </div>
                  </div>
                }
              </div>

              <div class="flex gap-3 pt-2">
                <button type="submit" class="comic-btn-primary text-sm">Zapisz podstronę</button>
                <button type="button" (click)="pageEditorOpen.set(false)" class="comic-btn text-sm bg-surface text-ink">Anuluj</button>
              </div>
            </form>
          </div>
        }
      </div>
      }
    </div>
  `,
})
export class SchoolAdminComponent implements OnInit {
  pages = signal<SchoolPageRecord[]>([]);
  loading = signal(true);

  menuForm = {
    groups: [] as MenuFormGroup[],
  };

  pageForm = {
    slug: '',
    title: '',
    subtitle: '',
    sections: [] as SchoolPageSection[],
  };

  pageEditorOpen = signal(false);
  message = signal<string | null>(null);
  messageType = signal<'success' | 'error'>('success');

  constructor(private fb: FirebaseService) {}

  async ngOnInit() {
    try {
      await this.loadPages();
      await this.loadMenu();
    } finally {
      this.loading.set(false);
    }
  }

  private toLink(l: SchoolPageLink): SchoolPageLink {
    return { label: l.label, url: l.url, external: !!l.external };
  }

  private linkToForm(l: SchoolPageLink): MenuFormItem {
    const base = { _id: this.uid(), label: l.label, external: !!l.external };
    if (l.url && l.url.startsWith('/szkola/')) {
      return { ...base, kind: 'school', slug: l.url.replace(/^\/szkola\//, ''), url: l.url };
    }
    return { ...base, kind: 'custom', slug: '', url: l.url };
  }

  private cloneMenu(groups: SchoolMenuGroup[]): MenuFormGroup[] {
    return groups.map((g) => ({
      _id: this.uid(),
      heading: g.heading,
      items: (g.items ?? []).map((i) => this.linkToForm(i)),
    }));
  }

  private uid(): string {
    return 'm' + Math.random().toString(36).slice(2, 9) + Date.now().toString(36);
  }

  async loadMenu() {
    this.menuForm.groups = this.cloneMenu(DEFAULT_SCHOOL_MENU);
    try {
      const menu = await this.fb.getSchoolMenu();
      if (menu && menu.groups && menu.groups.length) {
        this.menuForm.groups = this.cloneMenu(menu.groups);
      }
    } catch {
      this.menuForm.groups = this.cloneMenu(DEFAULT_SCHOOL_MENU);
    }
  }

  async loadPages() {
    const defaults: SchoolPageRecord[] = Object.values(SCHOOL_PAGES).map((p) => ({
      id: p.slug,
      slug: p.slug,
      title: p.title,
      subtitle: p.subtitle,
      sections: p.sections.map((s) => ({
        heading: s.heading,
        body: s.body && s.body.length ? [...s.body] : [],
        links: s.links && s.links.length ? s.links.map((l) => this.toLink(l)) : [],
      })),
    }));
    try {
      const stored = await this.fb.listSchoolPages();
      const map = new Map<string, SchoolPageRecord>(defaults.map((p) => [p.slug, p]));
      stored.forEach((p) => map.set(p.slug, p));
      this.pages.set([...map.values()]);
    } catch {
      this.pages.set(defaults);
    }
  }

  addGroup() {
    this.menuForm.groups.push({ _id: this.uid(), heading: 'Nowa grupa', items: [] });
    this.persistMenu();
  }

  removeGroup(index: number) {
    if (!confirm('Czy na pewno usunąć tę grupę z menu?')) return;
    this.menuForm.groups.splice(index, 1);
    this.persistMenu();
  }

  addItem(groupIndex: number) {
    this.menuForm.groups[groupIndex].items.push({ _id: this.uid(), label: '', kind: 'school', slug: '', url: '', external: false });
    this.persistMenu();
  }

  async removeItem(groupIndex: number, itemIndex: number) {
    const item = this.menuForm.groups[groupIndex]?.items[itemIndex];
    if (!confirm(`Czy na pewno usunąć pozycję „${item?.label || ''}” z menu?`)) return;
    this.menuForm.groups[groupIndex].items.splice(itemIndex, 1);
    this.persistMenu();

    if (item?.kind === 'school') {
      const slug = item.slug || this.slugFromName(item.label);
      const page = this.pages().find((x) => x.slug === slug);
      if (page && confirm(`Czy usunąć również treść podstrony „${page.title}” (/szkola/${slug})?`)) {
        try {
          await this.fb.deleteSchoolPage(slug);
          await this.loadPages();
          this.setMessage(`Treść podstrony „${page.title}” została usunięta.`, 'success');
        } catch (e: any) {
          this.setMessage('Błąd usuwania treści: ' + (e.message ?? e), 'error');
        }
      }
    }
  }

  private async persistMenu() {
    try {
      const clean = this.cleanGroups();
      await this.fb.saveSchoolMenu({ id: 'main', groups: clean });
      await this.ensurePagesForLinks(clean);
    } catch (e: any) {
      console.error('Błąd zapisu menu:', e);
      this.setMessage('Nie udało się zapisać menu: ' + (e.message ?? e), 'error');
    }
  }

  private async ensurePagesForLinks(groups: SchoolMenuGroup[]) {
    const existing = new Set(this.pages().map((p) => p.slug));
    const missing = new Set<string>();
    for (const g of groups) {
      for (const i of g.items) {
        const m = i.url?.match(/^\/szkola\/([^/]+)$/);
        if (m && !existing.has(m[1])) missing.add(m[1]);
      }
    }
    let created = false;
    for (const slug of missing) {
      if (!slug.trim()) continue;
      await this.fb.saveSchoolPage(
        {
          id: slug,
          slug,
          title: this.titleFromSlug(slug),
          subtitle: '',
          sections: [],
        },
        slug,
      );
      created = true;
    }
    if (created) await this.loadPages();
  }

  titleFromSlug(slug: string): string {
    return slug
      .split('-')
      .map((w) => (w ? w.charAt(0).toUpperCase() + w.slice(1) : w))
      .join(' ');
  }

  private menuSaveTimer: ReturnType<typeof setTimeout> | null = null;

  onMenuChanged() {
    if (this.menuSaveTimer) clearTimeout(this.menuSaveTimer);
    this.menuSaveTimer = setTimeout(() => {
      this.menuSaveTimer = null;
      this.persistMenu();
    }, 600);
  }

  slugFromName(label: string): string {
    return (label || '')
      .toLowerCase()
      .replace(/[^a-z0-9ąęśćżźół]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  private cleanGroups(): SchoolMenuGroup[] {
    return this.menuForm.groups
      .filter((g) => g.heading.trim())
      .map((g) => ({
        heading: g.heading,
        items: (g.items ?? [])
          .map((i) =>
            i.kind === 'school'
              ? {
                  label: i.label,
                  url: '/szkola/' + (i.slug || this.slugFromName(i.label)),
                  external: false,
                }
              : { label: i.label, url: i.url, external: i.external },
          )
          .filter((i) => i.label.trim() && i.url.trim()),
      }));
  }

  async saveMenu() {
    try {
      await this.fb.saveSchoolMenu({ id: 'main', groups: this.cleanGroups() });
      this.setMessage('Menu zapisane.', 'success');
    } catch (e: any) {
      this.setMessage('Błąd: ' + (e.message ?? e), 'error');
    }
  }

  resetPageEditor() {
    this.pageForm = { slug: '', title: '', subtitle: '', sections: [] };
    this.addSection();
    this.pageEditorOpen.set(true);
  }

  onTitleChange() {
    if (!this.pageForm.slug) {
      this.pageForm.slug = this.slugFromName(this.pageForm.title);
    }
  }

  editPage(slug: string) {
    const p = this.pages().find((x) => x.slug === slug);
    if (!p) return;
    this.pageForm = {
      slug: p.slug,
      title: p.title,
      subtitle: p.subtitle ?? '',
      sections: (p.sections ?? []).map((s) => ({
        heading: s.heading,
        body: s.body && s.body.length ? [...s.body] : [],
        links: s.links && s.links.length ? s.links.map((l) => this.toLink(l)) : [],
      })),
    };
    this.pageEditorOpen.set(true);
  }

  async deletePage(slug: string, event?: Event) {
    event?.stopPropagation();
    const page = this.pages().find((x) => x.slug === slug);
    if (!confirm(`Czy na pewno usunąć podstronę „${page?.title || slug}” (/szkola/${slug})?`)) return;
    try {
      await this.fb.deleteSchoolPage(slug);
      await this.loadPages();
      this.setMessage(`Podstrona „${page?.title || slug}” została usunięta.`, 'success');
    } catch (e: any) {
      this.setMessage('Błąd usuwania: ' + (e.message ?? e), 'error');
    }
  }

  addSection() {
    this.pageForm.sections.push({ heading: '', body: [], links: [] });
  }

  removeSection(index: number) {
    this.pageForm.sections.splice(index, 1);
  }

  addParagraph(sectionIndex: number) {
    const section = this.pageForm.sections[sectionIndex];
    if (!section) return;
    if (!section.body) section.body = [];
    section.body.push('');
  }

  removeParagraph(sectionIndex: number, paragraphIndex: number) {
    const section = this.pageForm.sections[sectionIndex];
    if (section && section.body) section.body.splice(paragraphIndex, 1);
  }

  addLink(sectionIndex: number) {
    const section = this.pageForm.sections[sectionIndex];
    if (!section) return;
    if (!section.links) section.links = [];
    section.links.push({ label: '', url: '', external: false });
  }

  removeLink(sectionIndex: number, linkIndex: number) {
    const section = this.pageForm.sections[sectionIndex];
    if (section && section.links) section.links.splice(linkIndex, 1);
  }

  async savePage(event: Event) {
    event.preventDefault();
    let slug = this.pageForm.slug.trim().toLowerCase();
    if (!slug) {
      slug = this.slugFromName(this.pageForm.title);
    }
    if (!slug) {
      this.setMessage('Podaj tytuł lub slug podstrony.', 'error');
      return;
    }
    const payload: Partial<SchoolPageRecord> = {
      id: slug,
      slug,
      title: this.pageForm.title,
      subtitle: this.pageForm.subtitle || undefined,
      sections: this.pageForm.sections
        .filter((s) => s.heading.trim())
        .map((s) => ({
          heading: s.heading,
          body: (s.body ?? []).filter((b) => b.trim()),
          links: (s.links ?? []).filter((l) => l.label.trim() && l.url.trim()).map((l) => this.toLink(l)),
        })),
    };
    if (!payload.title) {
      this.setMessage('Podaj tytuł podstrony.', 'error');
      return;
    }
    const wasNew = !this.pages().some((p) => p.slug === slug);
    try {
      await this.fb.saveSchoolPage(payload, slug);
      if (wasNew) {
        await this.addToMenu(payload.title, slug);
      }
      this.pageEditorOpen.set(false);
      this.setMessage(wasNew ? `Podstrona zapisana i dodana do menu. Adres: /szkola/${slug}` : `Podstrona zapisana. Adres: /szkola/${slug}`, 'success');
      await this.loadPages();
    } catch (e: any) {
      this.setMessage('Błąd: ' + (e.message ?? e), 'error');
    }
  }

  private async addToMenu(label: string, slug: string) {
    let group = this.menuForm.groups.find((g) => g.heading.trim().toLowerCase().includes('o szkole'));
    if (!group && this.menuForm.groups.length > 0) group = this.menuForm.groups[0];
    if (!group) {
      group = { _id: this.uid(), heading: 'O szkole', items: [] };
      this.menuForm.groups.push(group);
    }
    if (group.items.some((i) => i.kind === 'school' && i.slug === slug)) return;
    group.items.push({ _id: this.uid(), label, kind: 'school', slug, url: '/szkola/' + slug, external: false });
    await this.persistMenu();
  }

  setMessage(msg: string, type: 'success' | 'error') {
    this.message.set(msg);
    this.messageType.set(type);
    setTimeout(() => this.message.set(null), 5000);
  }
}

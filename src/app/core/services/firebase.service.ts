import { Injectable, signal, computed, effect, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { initializeApp, FirebaseApp, getApps, getApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut as fbSignOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  addDoc,
  collection,
  query,
  orderBy,
  where,
  limit,
  startAfter,
  Timestamp,
  DocumentSnapshot,
  getCountFromServer,
} from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { environment } from '../../../environments/environment';
import { CookieConsentService } from './cookie-consent.service';
import {
  News,
  NewsPdf,
  EducationArticle,
  EuProgramArticle,
  Program,
  GalleryAlbum,
  GalleryImage,
  Document,
  DocumentPdf,
  Staff,
  SiteSettings,
  AuditLog,
  SchoolPageRecord,
  SchoolMenu,
} from '../models/database.types';

@Injectable({ providedIn: 'root' })
export class FirebaseService {
  private static readonly STORAGE_TIMEOUT_MS = 120000;
  private platformId = inject(PLATFORM_ID);
  private cookieConsent = inject(CookieConsentService);
  private analyticsEnabled = false;

  app: FirebaseApp | null = null;
  isConfigured = false;

  readonly user = signal<User | null>(null);

  readonly isLoggedIn = computed(() => !!this.user());
  readonly isAdmin = this.isLoggedIn;

  private get ready() {
    return {
      db: getFirestore(this.app!),
      storage: getStorage(this.app!),
    };
  }

  constructor() {
    this.isConfigured = environment.firebase.projectId !== 'YOUR_FIREBASE_PROJECT_ID';
    if (this.isConfigured) {
      this.app = getApps().length ? getApp() : initializeApp(environment.firebase);
      effect(() => {
        if (this.cookieConsent.consent() === 'accepted') this.enableAnalytics();
      });
      this.initAuth();
    }
  }

  private enableAnalytics(): void {
    if (this.analyticsEnabled || !isPlatformBrowser(this.platformId) || !environment.firebase.measurementId) return;
    getAnalytics(this.app!);
    this.analyticsEnabled = true;
  }

  private initAuth(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const auth = getAuth(this.app!);
    onAuthStateChanged(auth, (user) => {
      this.user.set(user);
    });
  }

  async signIn(email: string, password: string): Promise<User> {
    const auth = getAuth(this.app!);
    const { user } = await signInWithEmailAndPassword(auth, email, password);
    this.user.set(user);
    return user;
  }

  async signOut(): Promise<void> {
    await fbSignOut(getAuth(this.app!));
    this.user.set(null);
  }

  private mapDoc<T>(d: { id: string; data(): unknown }): T {
    return { id: d.id, ...(d.data() as object) } as T;
  }

  private async list<T>(coll: string, order?: string, asc = true): Promise<T[]> {
    try {
      const c = collection(this.ready.db, coll);
      const q = order ? query(c, orderBy(order, asc ? 'asc' : 'desc')) : c;
      const xs = await getDocs(q);
      return xs.docs.map((d) => this.mapDoc<T>(d));
    } catch (error) {
      console.warn(`Nie udało się odczytać kolekcji ${coll}.`, error);
      return [];
    }
  }

  private async listWhere<T>(coll: string, field: string, value: unknown): Promise<T[]> {
    try {
      const q = query(collection(this.ready.db, coll), where(field, '==', value));
      const xs = await getDocs(q);
      return xs.docs.map((d) => this.mapDoc<T>(d));
    } catch (error) {
      console.warn(`Nie udało się odczytać kolekcji ${coll}.`, error);
      return [];
    }
  }

  private async countWhere(coll: string, field: string, value: unknown): Promise<number> {
    try {
      const q = query(collection(this.ready.db, coll), where(field, '==', value));
      const snap = await getCountFromServer(q);
      return snap.data().count;
    } catch (error) {
      console.warn(`Nie udało się zliczyć kolekcji ${coll}.`, error);
      return 0;
    }
  }

  private async countCollection(coll: string): Promise<number> {
    try {
      const snap = await getCountFromServer(collection(this.ready.db, coll));
      return snap.data().count;
    } catch (error) {
      console.warn(`Nie udało się zliczyć kolekcji ${coll}.`, error);
      return 0;
    }
  }

  countNewsTotal = () => this.countCollection('news');
  countNewsPublished = () => this.countWhere('news', 'status', 'published');
  countProgramsTotal = () => this.countCollection('programs');
  countProgramsActive = (active = true) => this.countWhere('programs', 'is_active', active);
  countAlbumsTotal = () => this.countCollection('gallery_albums');
  countDocumentsTotal = () => this.countCollection('documents');
  countStaffTotal = () => this.countCollection('staff');
  countImagesByAlbum = (albumId: string) => this.countWhere('gallery_images', 'album_id', albumId);
  countImagesTotal = () => this.countCollection('gallery_images');

  private async listLimited<T>(coll: string, order: string, asc: boolean, max: number): Promise<T[]> {
    try {
      const q = query(collection(this.ready.db, coll), orderBy(order, asc ? 'asc' : 'desc'), limit(max));
      const xs = await getDocs(q);
      return xs.docs.map((d) => this.mapDoc<T>(d));
    } catch (error) {
      console.warn(`Nie udało się odczytać kolekcji ${coll}.`, error);
      return [];
    }
  }

  listRecentAuditLogs = (max = 25) => this.listLimited<AuditLog>('audit_logs', 'created_at', false, max);
  listRecentNews = (max = 10) =>
    this.listLimited<News>('news', 'created_at', false, max).then((xs) => xs.map((n) => this.cleanNewsPdf(n)));

  private async get<T>(coll: string, id: string): Promise<T | null> {
    try {
      const snap = await getDoc(doc(this.ready.db, coll, id));
      return snap.exists() ? this.mapDoc<T>(snap) : null;
    } catch (error) {
      console.warn(`Nie udało się odczytać dokumentu z kolekcji ${coll}.`, error);
      return null;
    }
  }

  private async save(coll: string, data: Record<string, unknown>, id?: string): Promise<string | null> {
    const d = { ...data, updated_at: Timestamp.now().toDate().toISOString() };
    const action = id ? 'update' : 'create';
    if (id) {
      await setDoc(doc(this.ready.db, coll, id), { ...d, id } as any, { merge: true });
      await this.logAudit(action, coll, id, data);
      return id;
    } else {
      const ref = await addDoc(collection(this.ready.db, coll), {
        ...d,
        created_at: Timestamp.now().toDate().toISOString(),
      } as any);
      await this.logAudit(action, coll, ref.id, data);
      return ref.id;
    }
  }

  private async remove(coll: string, id: string): Promise<void> {
    await deleteDoc(doc(this.ready.db, coll, id));
    await this.logAudit('delete', coll, id);
  }

  private async logAudit(
    action: AuditLog['action'],
    coll: string,
    id: string,
    data: Record<string, unknown> = {},
  ): Promise<void> {
    const trackedCollections = new Set([
      'news', 'programs', 'documents', 'gallery_albums', 'gallery_images',
      'staff', 'school_pages', 'school_menu', 'settings', 'hero_slides',
      'education_articles', 'eu_programs',
    ]);
    if (!trackedCollections.has(coll)) return;

    const label = String(data['title'] ?? data['full_name'] ?? data['key'] ?? data['slug'] ?? id);
    try {
      await addDoc(collection(this.ready.db, 'audit_logs'), {
        action,
        collection: coll,
        label,
        user_email: this.user()?.email ?? 'administrator',
        created_at: Timestamp.now().toDate().toISOString(),
      });
    } catch (error) {
      console.warn('Nie udało się zapisać historii działania.', error);
    }
  }

  listAuditLogs = () => this.list<AuditLog>('audit_logs', 'created_at', false);

  listPublishedNews = () => this.list<News>('news', 'published_at', false).then((xs) =>
    xs.filter((n) => n.status === 'published').map((n) => this.cleanNewsPdf(n)),
  );

  async listPublishedNewsPage(
    pageSize: number,
    cursor?: DocumentSnapshot,
  ): Promise<{ items: News[]; nextCursor: DocumentSnapshot | null }> {
    const coll = collection(this.ready.db, 'news');
    let cur: DocumentSnapshot | null | undefined = cursor ?? null;
    const out: News[] = [];
    for (let guard = 0; guard < 100; guard++) {
      const q: any = cur
        ? query(coll, orderBy('published_at', 'desc'), startAfter(cur), limit(pageSize))
        : query(coll, orderBy('published_at', 'desc'), limit(pageSize));
      const xs: any = await getDocs(q);
      const docs: any[] = xs.docs;
      if (!docs.length) return { items: out, nextCursor: null };
      for (const d of docs) {
        const n = this.mapDoc<News>(d);
        if (n.status === 'published') {
          out.push(this.cleanNewsPdf(n));
          if (out.length === pageSize) return { items: out, nextCursor: d as DocumentSnapshot };
        }
      }
      cur = docs[docs.length - 1] as DocumentSnapshot;
      if (docs.length < pageSize) return { items: out, nextCursor: null };
    }
    return { items: out, nextCursor: cur ?? null };
  }
  listNews = () => this.list<News>('news', 'created_at', false).then((xs) => xs.map((n) => this.cleanNewsPdf(n)));

  private cleanNewsPdf(n: News): News {
    if (n.pdf_url && n.pdf_url.startsWith('data:')) {
      return { ...n, pdf_url: null };
    }
    return n;
  }
  getNews = (id: string) => this.get<News>('news', id).then((n) => (n ? this.cleanNewsPdf(n) : n));
  getNewsBySlug = (slug: string) =>
    this.listWhere<News>('news', 'slug', slug).then((x) => (x[0] ? this.cleanNewsPdf(x[0]) : null));
  saveNews = (data: Partial<News>, id?: string) => this.save('news', data as any, id);
  deleteNews = (id: string) => this.remove('news', id);
  async deleteNewsSafe(id: string) {
    await this.remove('news', id);
    await this.deleteNewsPdf(id);
  }

  private static readonly PDF_CHUNK_SIZE = 400 * 1024;

  async saveNewsPdf(newsId: string, dataUrl: string, name: string): Promise<void> {
    const comma = dataUrl.indexOf(',');
    const base64 = comma >= 0 ? dataUrl.slice(comma + 1) : dataUrl;
    const chunkSize = FirebaseService.PDF_CHUNK_SIZE;
    const chunks: string[] = [];
    for (let i = 0; i < base64.length; i += chunkSize) {
      chunks.push(base64.slice(i, i + chunkSize));
    }

    const coll = `news_pdfs/${newsId}/chunks`;
    for (const existing of await this.list<{ id: string }>(coll, 'index')) {
      await this.remove(coll, existing.id);
    }
    for (let i = 0; i < chunks.length; i++) {
      await this.save(coll, { index: i, data: chunks[i] } as any, String(i));
    }
    await this.save('news_pdfs', { name, chunks: chunks.length } as any, newsId);
  }

  async getNewsPdf(newsId: string): Promise<NewsPdf | null> {
    const meta = await this.get<NewsPdf & { chunks?: number }>('news_pdfs', newsId);
    if (!meta) return null;
    if ((meta as any).data) {
      return { id: newsId, data: (meta as any).data, name: meta.name };
    }
    const coll = `news_pdfs/${newsId}/chunks`;
    const parts = await this.list<{ index: number; data: string }>(coll, 'index');
    const data = parts
      .sort((a, b) => (a.index ?? 0) - (b.index ?? 0))
      .map((p) => p.data)
      .join('');
    return {
      id: newsId,
      data: 'data:application/pdf;base64,' + data,
      name: meta.name,
    };
  }

  async deleteNewsPdf(newsId: string): Promise<void> {
    const coll = `news_pdfs/${newsId}/chunks`;
    for (const existing of await this.list<{ id: string }>(coll, 'index')) {
      await this.remove(coll, existing.id);
    }
    await this.remove('news_pdfs', newsId);
  }

  listPublishedEducationArticles = () => this.list<EducationArticle>('education_articles', 'published_at', false).then((xs) =>
    xs.filter((n) => n.status === 'published').map((n) => this.cleanEducationPdf(n)),
  );

  listEducationArticles = () => this.list<EducationArticle>('education_articles', 'created_at', false).then((xs) => xs.map((n) => this.cleanEducationPdf(n)));

  private cleanEducationPdf(n: EducationArticle): EducationArticle {
    if (n.pdf_url && n.pdf_url.startsWith('data:')) {
      return { ...n, pdf_url: null };
    }
    return n;
  }
  getEducationArticle = (id: string) => this.get<EducationArticle>('education_articles', id).then((n) => (n ? this.cleanEducationPdf(n) : n));
  getEducationArticleBySlug = (slug: string) =>
    this.listWhere<EducationArticle>('education_articles', 'slug', slug).then((x) => (x[0] ? this.cleanEducationPdf(x[0]) : null));
  saveEducationArticle = (data: Partial<EducationArticle>, id?: string) => this.save('education_articles', data as any, id);
  deleteEducationArticle = (id: string) => this.remove('education_articles', id);
  async deleteEducationArticleSafe(id: string) {
    await this.remove('education_articles', id);
    await this.deleteEducationPdf(id);
  }

  async saveEducationPdf(articleId: string, dataUrl: string, name: string): Promise<void> {
    const comma = dataUrl.indexOf(',');
    const prefix = comma >= 0 ? dataUrl.slice(0, comma + 1) : 'data:application/pdf;base64,';
    const base64 = comma >= 0 ? dataUrl.slice(comma + 1) : dataUrl;
    const chunkSize = FirebaseService.PDF_CHUNK_SIZE;
    const chunks: string[] = [];
    for (let i = 0; i < base64.length; i += chunkSize) {
      chunks.push(base64.slice(i, i + chunkSize));
    }

    const coll = `education_pdfs/${articleId}/chunks`;
    for (const existing of await this.list<{ id: string }>(coll, 'index')) {
      await this.remove(coll, existing.id);
    }
    for (let i = 0; i < chunks.length; i++) {
      await this.save(coll, { index: i, data: chunks[i] } as any, String(i));
    }
    await this.save('education_pdfs', { name, prefix, chunks: chunks.length } as any, articleId);
  }

  async getEducationPdf(articleId: string): Promise<DocumentPdf | null> {
    const meta = await this.get<DocumentPdf & { chunks?: number; prefix?: string }>('education_pdfs', articleId);
    if (!meta) return null;
    const parts = await this.list<{ index: number; data: string }>(`education_pdfs/${articleId}/chunks`, 'index');
    const data = parts
      .sort((a, b) => (a.index ?? 0) - (b.index ?? 0))
      .map((part) => part.data)
      .join('');
    return { id: articleId, data: (meta.prefix ?? 'data:application/pdf;base64,') + data, name: meta.name };
  }

  async deleteEducationPdf(articleId: string): Promise<void> {
    const coll = `education_pdfs/${articleId}/chunks`;
    for (const existing of await this.list<{ id: string }>(coll, 'index')) {
      await this.remove(coll, existing.id);
    }
    await this.remove('education_pdfs', articleId);
  }

  listPublishedEuPrograms = () => this.list<EuProgramArticle>('eu_programs', 'published_at', false).then((xs) =>
    xs.filter((n) => n.status === 'published').map((n) => this.cleanEuProgramPdf(n)),
  );

  listEuPrograms = () => this.list<EuProgramArticle>('eu_programs', 'created_at', false).then((xs) => xs.map((n) => this.cleanEuProgramPdf(n)));

  private cleanEuProgramPdf(n: EuProgramArticle): EuProgramArticle {
    if (n.pdf_url && n.pdf_url.startsWith('data:')) {
      return { ...n, pdf_url: null };
    }
    return n;
  }
  getEuProgram = (id: string) => this.get<EuProgramArticle>('eu_programs', id).then((n) => (n ? this.cleanEuProgramPdf(n) : n));
  getEuProgramBySlug = (slug: string) =>
    this.listWhere<EuProgramArticle>('eu_programs', 'slug', slug).then((x) => (x[0] ? this.cleanEuProgramPdf(x[0]) : null));
  saveEuProgram = (data: Partial<EuProgramArticle>, id?: string) => this.save('eu_programs', data as any, id);
  deleteEuProgram = (id: string) => this.remove('eu_programs', id);
  async deleteEuProgramSafe(id: string) {
    await this.remove('eu_programs', id);
    await this.deleteEuProgramPdf(id);
  }

  async saveEuProgramPdf(articleId: string, dataUrl: string, name: string): Promise<void> {
    const comma = dataUrl.indexOf(',');
    const prefix = comma >= 0 ? dataUrl.slice(0, comma + 1) : 'data:application/pdf;base64,';
    const base64 = comma >= 0 ? dataUrl.slice(comma + 1) : dataUrl;
    const chunkSize = FirebaseService.PDF_CHUNK_SIZE;
    const chunks: string[] = [];
    for (let i = 0; i < base64.length; i += chunkSize) {
      chunks.push(base64.slice(i, i + chunkSize));
    }

    const coll = `eu_program_pdfs/${articleId}/chunks`;
    for (const existing of await this.list<{ id: string }>(coll, 'index')) {
      await this.remove(coll, existing.id);
    }
    for (let i = 0; i < chunks.length; i++) {
      await this.save(coll, { index: i, data: chunks[i] } as any, String(i));
    }
    await this.save('eu_program_pdfs', { name, prefix, chunks: chunks.length } as any, articleId);
  }

  async getEuProgramPdf(articleId: string): Promise<DocumentPdf | null> {
    const meta = await this.get<DocumentPdf & { chunks?: number; prefix?: string }>('eu_program_pdfs', articleId);
    if (!meta) return null;
    const parts = await this.list<{ index: number; data: string }>(`eu_program_pdfs/${articleId}/chunks`, 'index');
    const data = parts
      .sort((a, b) => (a.index ?? 0) - (b.index ?? 0))
      .map((part) => part.data)
      .join('');
    return { id: articleId, data: (meta.prefix ?? 'data:application/pdf;base64,') + data, name: meta.name };
  }

  async deleteEuProgramPdf(articleId: string): Promise<void> {
    const coll = `eu_program_pdfs/${articleId}/chunks`;
    for (const existing of await this.list<{ id: string }>(coll, 'index')) {
      await this.remove(coll, existing.id);
    }
    await this.remove('eu_program_pdfs', articleId);
  }

  listActivePrograms = () =>
    this.list<Program>('programs', 'display_order').then((xs) => xs.filter((p) => p.is_active));
  listPrograms = () => this.list<Program>('programs', 'display_order');
  getProgram = (id: string) => this.get<Program>('programs', id);
  getProgramBySlug = (slug: string) => this.listWhere<Program>('programs', 'slug', slug).then((x) => x[0] ?? null);
  saveProgram = (data: Partial<Program>, id?: string) => this.save('programs', data as any, id);
  deleteProgram = (id: string) => this.remove('programs', id);

  listAlbums = () => this.list<GalleryAlbum>('gallery_albums', 'display_order');
  getAlbum = (id: string) => this.get<GalleryAlbum>('gallery_albums', id);
  getAlbumBySlug = (slug: string) => this.listWhere<GalleryAlbum>('gallery_albums', 'slug', slug).then((x) => x[0] ?? null);
  saveAlbum = (data: Partial<GalleryAlbum>, id?: string) => this.save('gallery_albums', data as any, id);
  deleteAlbum = (id: string) => this.remove('gallery_albums', id);

  listGalleryImages = (albumId: string) =>
    this.listWhere<GalleryImage>('gallery_images', 'album_id', albumId).then(async (xs) =>
      (await this.resolveGalleryImages(xs)).sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0)),
    );
  listAllImages = () => this.list<GalleryImage>('gallery_images').then((xs) => this.resolveGalleryImages(xs));
  saveImage = (data: Partial<GalleryImage>, id?: string) => this.save('gallery_images', data as any, id);
  deleteImage = (id: string) => this.remove('gallery_images', id);

  private async resolveGalleryImages(images: GalleryImage[]): Promise<GalleryImage[]> {
    return Promise.all(images.map(async (image) => {
      if (!image.image_url.startsWith('firestore:')) return image;
      const data = await this.getGalleryImageData(image.id);
      return data ? { ...image, image_url: data } : image;
    }));
  }

  async saveGalleryImageData(imageId: string, dataUrl: string): Promise<void> {
    const comma = dataUrl.indexOf(',');
    const prefix = comma >= 0 ? dataUrl.slice(0, comma + 1) : 'data:image/jpeg;base64,';
    const base64 = comma >= 0 ? dataUrl.slice(comma + 1) : dataUrl;
    const chunks: string[] = [];
    for (let i = 0; i < base64.length; i += FirebaseService.PDF_CHUNK_SIZE) {
      chunks.push(base64.slice(i, i + FirebaseService.PDF_CHUNK_SIZE));
    }

    const coll = `gallery_image_data/${imageId}/chunks`;
    for (const existing of await this.list<{ id: string }>(coll, 'index')) {
      await this.remove(coll, existing.id);
    }
    for (let i = 0; i < chunks.length; i++) {
      await this.save(coll, { index: i, data: chunks[i] } as any, String(i));
    }
    await this.save('gallery_image_data', { prefix, chunks: chunks.length } as any, imageId);
  }

  async getGalleryImageData(imageId: string): Promise<string | null> {
    const meta = await this.get<{ prefix: string } & { chunks?: number }>('gallery_image_data', imageId);
    if (!meta) return null;
    const parts = await this.list<{ index: number; data: string }>(`gallery_image_data/${imageId}/chunks`, 'index');
    return meta.prefix + parts.sort((a, b) => (a.index ?? 0) - (b.index ?? 0)).map((part) => part.data).join('');
  }

  async deleteGalleryImageData(imageId: string): Promise<void> {
    const coll = `gallery_image_data/${imageId}/chunks`;
    for (const existing of await this.list<{ id: string }>(coll, 'index')) {
      await this.remove(coll, existing.id);
    }
    try {
      await this.remove('gallery_image_data', imageId);
    } catch {
    }
  }

  listDocuments = () => this.list<Document>('documents', 'created_at', false);
  saveDocument = (data: Partial<Document>, id?: string) => this.save('documents', data as any, id);
  deleteDocument = (id: string) => this.remove('documents', id);

  async saveDocumentPdf(documentId: string, dataUrl: string, name: string): Promise<void> {
    const comma = dataUrl.indexOf(',');
    const prefix = comma >= 0 ? dataUrl.slice(0, comma + 1) : 'data:application/pdf;base64,';
    const base64 = comma >= 0 ? dataUrl.slice(comma + 1) : dataUrl;
    const chunks: string[] = [];
    for (let i = 0; i < base64.length; i += FirebaseService.PDF_CHUNK_SIZE) {
      chunks.push(base64.slice(i, i + FirebaseService.PDF_CHUNK_SIZE));
    }

    const coll = `document_pdfs/${documentId}/chunks`;
    for (const existing of await this.list<{ id: string }>(coll, 'index')) {
      await this.remove(coll, existing.id);
    }
    for (let i = 0; i < chunks.length; i++) {
      await this.save(coll, { index: i, data: chunks[i] } as any, String(i));
    }
    await this.save('document_pdfs', { name, prefix, chunks: chunks.length } as any, documentId);
  }

  async getDocumentPdf(documentId: string): Promise<DocumentPdf | null> {
    const meta = await this.get<DocumentPdf & { chunks?: number; prefix?: string }>('document_pdfs', documentId);
    if (!meta) return null;
    const parts = await this.list<{ index: number; data: string }>(`document_pdfs/${documentId}/chunks`, 'index');
    const data = parts
      .sort((a, b) => (a.index ?? 0) - (b.index ?? 0))
      .map((part) => part.data)
      .join('');
    return { id: documentId, data: (meta.prefix ?? 'data:application/pdf;base64,') + data, name: meta.name };
  }

  async deleteDocumentPdf(documentId: string): Promise<void> {
    const coll = `document_pdfs/${documentId}/chunks`;
    for (const existing of await this.list<{ id: string }>(coll, 'index')) {
      await this.remove(coll, existing.id);
    }
    await this.remove('document_pdfs', documentId);
  }

  listStaff = () => this.list<Staff>('staff', 'display_order');
  saveStaff = (data: Partial<Staff>, id?: string) => this.save('staff', data as any, id);
  deleteStaff = (id: string) => this.remove('staff', id);

  listSettings = () => this.list<SiteSettings>('site_settings');
  getSetting = (key: string) => this.listWhere<SiteSettings>('site_settings', 'key', key).then((x) => x[0] ?? null);
  saveSetting = (data: Partial<SiteSettings>, id?: string) => this.save('site_settings', data as any, id);

  listSchoolPages = () => this.list<SchoolPageRecord>('school_pages');
  getSchoolPage = (slug: string) =>
    this.get<SchoolPageRecord>('school_pages', slug).then((p) => {
      if (p && typeof p === 'object' && 'sections' in p) return p;
      return null;
    });
  async saveSchoolPage(data: Partial<SchoolPageRecord>, slug: string): Promise<void> {
    const d = {
      ...data,
      updated_at: Timestamp.now().toDate().toISOString(),
    } as any;
    await setDoc(doc(this.ready.db, 'school_pages', slug), d, { merge: true });
  }
  deleteSchoolPage = (slug: string) => this.remove('school_pages', slug);

  getSchoolMenu = () => this.get<SchoolMenu>('school_menu', 'main');
  async saveSchoolMenu(data: Partial<SchoolMenu>): Promise<void> {
    const d = {
      ...data,
      updated_at: Timestamp.now().toDate().toISOString(),
    } as any;
    await setDoc(doc(this.ready.db, 'school_menu', 'main'), d, { merge: true });
  }

  async uploadFile(path: string, file: Blob): Promise<string> {
    const storageRef = ref(this.ready.storage, path);
    const contentType = (file as File).type || 'application/octet-stream';
    await this.withTimeout(
      uploadBytes(storageRef, file, { contentType }),
      FirebaseService.STORAGE_TIMEOUT_MS,
      'Przekroczono limit czasu przesyłania do Firebase Storage. Sprawdź, czy Storage jest włączony dla projektu Firebase i czy reguły pozwalają na zapis.',
    );
    return this.withTimeout(
      getDownloadURL(storageRef),
      FirebaseService.STORAGE_TIMEOUT_MS,
      'Przekroczono limit czasu pobierania adresu obrazka z Firebase Storage.',
    );
  }

  async resolveDocumentUrl(fileUrl: string): Promise<string> {
    const normalized = fileUrl.trim();
    if (!normalized || /^(https?:|data:|blob:)/i.test(normalized)) return normalized;

    const path = normalized.replace(/^\/+/, '');
    const storagePath = path.startsWith('documents/') ? path : `documents/${path}`;
    try {
      return await getDownloadURL(ref(this.ready.storage, storagePath));
    } catch {
      return fileUrl;
    }
  }

  async deleteFile(url: string): Promise<void> {
    try {
      const storageRef = ref(this.ready.storage, url);
      await deleteObject(storageRef);
    } catch {
    }
  }

  private withTimeout<T>(p: Promise<T>, ms: number, message: string): Promise<T> {
    return Promise.race([
      p,
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error(message)), ms),
      ),
    ]);
  }
}

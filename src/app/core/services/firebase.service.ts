import { Injectable, signal, computed, inject, PLATFORM_ID } from '@angular/core';
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
  Timestamp,
} from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { environment } from '../../../environments/environment';
import {
  News,
  NewsPdf,
  Program,
  GalleryAlbum,
  GalleryImage,
  Document,
  Staff,
  SiteSettings,
  SchoolPageRecord,
  SchoolMenu,
} from '../models/database.types';

@Injectable({ providedIn: 'root' })
export class FirebaseService {
  private platformId = inject(PLATFORM_ID);

  app: FirebaseApp | null = null;
  isConfigured = false;

  readonly user = signal<User | null>(null);

  readonly isLoggedIn = computed(() => !!this.user());
  // Jedyny użytkownik aplikacji jest administratorem.
  readonly isAdmin = this.isLoggedIn;

  private get ready() {
    // Firestore/Storage/Auth lazy singletons
    return {
      db: getFirestore(this.app!),
      storage: getStorage(this.app!),
    };
  }

  constructor() {
    this.isConfigured = environment.firebase.projectId !== 'YOUR_FIREBASE_PROJECT_ID';
    if (this.isConfigured) {
      this.app = getApps().length ? getApp() : initializeApp(environment.firebase);
      if (isPlatformBrowser(this.platformId) && environment.firebase.measurementId) {
        getAnalytics(this.app);
      }
      this.initAuth();
    }
  }

  // =====================================================================
  // AUTH
  // =====================================================================
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

  // =====================================================================
  // GENERIC FIRESTORE HELPERS
  // =====================================================================
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
    if (id) {
      await setDoc(doc(this.ready.db, coll, id), { ...d, id } as any, { merge: true });
      return id;
    } else {
      const ref = await addDoc(collection(this.ready.db, coll), {
        ...d,
        created_at: Timestamp.now().toDate().toISOString(),
      } as any);
      return ref.id;
    }
  }

  private async remove(coll: string, id: string): Promise<void> {
    await deleteDoc(doc(this.ready.db, coll, id));
  }

  // =====================================================================
  // NEWS
  // =====================================================================
  listPublishedNews = () => this.list<News>('news', 'published_at', false).then((xs) =>
    xs.filter((n) => n.status === 'published').map((n) => this.cleanNewsPdf(n)),
  );
  listNews = () => this.list<News>('news', 'created_at', false).then((xs) => xs.map((n) => this.cleanNewsPdf(n)));

  /** Usuwa ewentualny base64 zapisany dawniej w pdf_url (przed przeniesieniem PDF do osobnej kolekcji). */
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

  // PDF dołączony do aktualności — trzymany osobno (kolekcja `news_pdfs`),
  // żeby nie przekroczyć limitu 1 MiB dokumentu Firestore. Większe pliki
  // dzielimy na fragmenty (`news_pdfs/{newsId}/chunks/*`).

  private static readonly PDF_CHUNK_SIZE = 400 * 1024; // ok. 400 KB base64 na fragment (~300 KB pliku)

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
    // Format starszy: cały base64 w polu `data` w jednym dokumencie.
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

  // =====================================================================
  // PROGRAMS
  // =====================================================================
  listActivePrograms = () =>
    this.list<Program>('programs', 'display_order').then((xs) => xs.filter((p) => p.is_active));
  listPrograms = () => this.list<Program>('programs', 'display_order');
  getProgram = (id: string) => this.get<Program>('programs', id);
  getProgramBySlug = (slug: string) => this.listWhere<Program>('programs', 'slug', slug).then((x) => x[0] ?? null);
  saveProgram = (data: Partial<Program>, id?: string) => this.save('programs', data as any, id);
  deleteProgram = (id: string) => this.remove('programs', id);

  // =====================================================================
  // GALLERY
  // =====================================================================
  listAlbums = () => this.list<GalleryAlbum>('gallery_albums', 'display_order');
  getAlbum = (id: string) => this.get<GalleryAlbum>('gallery_albums', id);
  getAlbumBySlug = (slug: string) => this.listWhere<GalleryAlbum>('gallery_albums', 'slug', slug).then((x) => x[0] ?? null);
  saveAlbum = (data: Partial<GalleryAlbum>, id?: string) => this.save('gallery_albums', data as any, id);
  deleteAlbum = (id: string) => this.remove('gallery_albums', id);

  listGalleryImages = (albumId: string) =>
    this.listWhere<GalleryImage>('gallery_images', 'album_id', albumId).then((xs) =>
      xs.sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0)),
    );
  listAllImages = () => this.list<GalleryImage>('gallery_images');
  saveImage = (data: Partial<GalleryImage>, id?: string) => this.save('gallery_images', data as any, id);
  deleteImage = (id: string) => this.remove('gallery_images', id);

  // =====================================================================
  // DOCUMENTS
  // =====================================================================
  listDocuments = () => this.list<Document>('documents', 'created_at', false);
  saveDocument = (data: Partial<Document>, id?: string) => this.save('documents', data as any, id);
  deleteDocument = (id: string) => this.remove('documents', id);

  // =====================================================================
  // STAFF
  // =====================================================================
  listStaff = () => this.list<Staff>('staff', 'display_order');
  saveStaff = (data: Partial<Staff>, id?: string) => this.save('staff', data as any, id);
  deleteStaff = (id: string) => this.remove('staff', id);

  // =====================================================================
  // SITE SETTINGS
  // =====================================================================
  listSettings = () => this.list<SiteSettings>('site_settings');
  getSetting = (key: string) => this.listWhere<SiteSettings>('site_settings', 'key', key).then((x) => x[0] ?? null);
  saveSetting = (data: Partial<SiteSettings>, id?: string) => this.save('site_settings', data as any, id);

  // =====================================================================
  // SCHOOL PAGES (podstrony "Szkoła")
  // =====================================================================
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

  // =====================================================================
  // SCHOOL MENU (dropdown "Szkoła")
  // =====================================================================
  getSchoolMenu = () => this.get<SchoolMenu>('school_menu', 'main');
  async saveSchoolMenu(data: Partial<SchoolMenu>): Promise<void> {
    const d = {
      ...data,
      updated_at: Timestamp.now().toDate().toISOString(),
    } as any;
    await setDoc(doc(this.ready.db, 'school_menu', 'main'), d, { merge: true });
  }

  // =====================================================================
  // STORAGE UPLOAD
  // =====================================================================
  async uploadFile(path: string, file: Blob): Promise<string> {
    const storageRef = ref(this.ready.storage, path);
    const contentType = (file as File).type || 'application/octet-stream';
    await this.withTimeout(
      uploadBytes(storageRef, file, { contentType }),
      30000,
      'Przekroczono limit czasu przesyłania do Firebase Storage. Sprawdź, czy Storage jest włączony i czy reguły pozwalają na zapis.',
    );
    return this.withTimeout(
      getDownloadURL(storageRef),
      30000,
      'Przekroczono limit czasu pobierania adresu obrazka z Firebase Storage.',
    );
  }

  async deleteFile(url: string): Promise<void> {
    try {
      const storageRef = ref(this.ready.storage, url);
      await deleteObject(storageRef);
    } catch {
      /* ignore */
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

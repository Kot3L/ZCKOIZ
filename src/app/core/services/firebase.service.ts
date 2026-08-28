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
  Program,
  GalleryAlbum,
  GalleryImage,
  Document,
  Staff,
  SiteSettings,
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

  private async save(coll: string, data: Record<string, unknown>, id?: string): Promise<void> {
    const d = { ...data, updated_at: Timestamp.now().toDate().toISOString() };
    if (id) {
      await updateDoc(doc(this.ready.db, coll, id), { ...d, id } as any);
    } else {
      await addDoc(collection(this.ready.db, coll), {
        ...d,
        created_at: Timestamp.now().toDate().toISOString(),
      } as any);
    }
  }

  private async remove(coll: string, id: string): Promise<void> {
    await deleteDoc(doc(this.ready.db, coll, id));
  }

  // =====================================================================
  // NEWS
  // =====================================================================
  listPublishedNews = () => this.list<News>('news', 'published_at', false).then((xs) =>
    xs.filter((n) => n.status === 'published'),
  );
  listNews = () => this.list<News>('news', 'created_at', false);
  getNews = (id: string) => this.get<News>('news', id);
  getNewsBySlug = (slug: string) => this.listWhere<News>('news', 'slug', slug).then((x) => x[0] ?? null);
  saveNews = (data: Partial<News>, id?: string) => this.save('news', data as any, id);
  deleteNews = (id: string) => this.remove('news', id);

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
  // STORAGE UPLOAD
  // =====================================================================
  async uploadFile(path: string, file: Blob): Promise<string> {
    const storageRef = ref(this.ready.storage, path);
    await uploadBytes(storageRef, file);
    return getDownloadURL(storageRef);
  }

  async deleteFile(url: string): Promise<void> {
    try {
      const storageRef = ref(this.ready.storage, url);
      await deleteObject(storageRef);
    } catch {
      /* ignore */
    }
  }
}

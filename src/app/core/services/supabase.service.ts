import { Injectable, signal, computed } from '@angular/core';
import { createClient, SupabaseClient, User, Session } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';
import { AppRole, Profile, UserRole } from '../models/database.types';

@Injectable({ providedIn: 'root' })
export class SupabaseService {
  private client: SupabaseClient;
  isConfigured = false;

  readonly user = signal<User | null>(null);
  readonly session = signal<Session | null>(null);
  readonly profile = signal<Profile | null>(null);
  readonly roles = signal<AppRole[]>([]);

  readonly isLoggedIn = computed(() => !!this.user());
  readonly isAdmin = computed(() => this.roles().includes('admin'));
  readonly isEditor = computed(() => this.roles().includes('editor') || this.isAdmin());

  constructor() {
    const isConfigured = environment.supabaseUrl.startsWith('http');
    this.isConfigured = isConfigured;
    if (isConfigured) {
      this.client = createClient(environment.supabaseUrl, environment.supabaseAnonKey);
      this.initAuth();
    } else {
      this.client = new Proxy({}, this.createNoopClientHandler()) as unknown as SupabaseClient;
    }
  }

  private createNoopClientHandler(): ProxyHandler<object> {
    const make = (): any => {
      const target: any = () => undefined;
      Object.defineProperty(target, 'then', {
        value: (resolve: (v: any) => void) => resolve({ data: null, error: null, count: 0 }),
      });
      return new Proxy(target, {
        get: (_t, prop: string) => {
          if (prop === 'then' || prop === 'catch' || prop === 'finally') {
            return (_t as any)[prop];
          }
          if (prop === 'getPublicUrl') {
            return () => ({ data: { publicUrl: '' } });
          }
          return () => make();
        },
      });
    };
    return {
      get: () => () => make(),
    };
  }

  get supabase(): SupabaseClient {
    if (!this.client) {
      this.client = new Proxy({}, this.createNoopClientHandler()) as unknown as SupabaseClient;
    }
    return this.client;
  }

  private async initAuth() {
    const { data: { session } } = await this.client.auth.getSession();
    this.session.set(session);
    this.user.set(session?.user ?? null);

    if (session?.user) {
      await this.loadUserProfile(session.user.id);
      await this.loadUserRoles(session.user.id);
    }

    this.client.auth.onAuthStateChange((_event, session) => {
      this.session.set(session);
      this.user.set(session?.user ?? null);

      if (session?.user) {
        this.loadUserProfile(session.user.id);
        this.loadUserRoles(session.user.id);
      } else {
        this.profile.set(null);
        this.roles.set([]);
      }
    });
  }

  async signIn(email: string, password: string) {
    const { data, error } = await this.client.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  }

  async signOut() {
    const { error } = await this.client.auth.signOut();
    if (error) throw error;
  }

  private async loadUserProfile(userId: string) {
    const { data } = await this.client
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    this.profile.set(data as Profile | null);
  }

  private async loadUserRoles(userId: string) {
    const { data } = await this.client
      .from('user_roles')
      .select('role')
      .eq('user_id', userId);
    this.roles.set((data as UserRole[] | null)?.map(r => r.role) ?? []);
  }

  hasRole(role: AppRole): boolean {
    return this.roles().includes(role);
  }
}

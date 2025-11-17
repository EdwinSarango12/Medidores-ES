import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient;
  private static instance: SupabaseClient | null = null;

  constructor() {
    if (!environment.supabase.url || !environment.supabase.anonKey) {
      console.error('Supabase credentials not configured! Please check environment.ts');
    }
    
    // Usar singleton para evitar múltiples instancias
    if (!SupabaseService.instance) {
      // Crear un storage personalizado que evite el problema del Navigator LockManager
      const customStorage = typeof window !== 'undefined' ? {
        getItem: (key: string) => {
          try {
            return window.localStorage.getItem(key);
          } catch (e) {
            return null;
          }
        },
        setItem: (key: string, value: string) => {
          try {
            window.localStorage.setItem(key, value);
          } catch (e) {
            console.warn('Error setting localStorage:', e);
          }
        },
        removeItem: (key: string) => {
          try {
            window.localStorage.removeItem(key);
          } catch (e) {
            console.warn('Error removing from localStorage:', e);
          }
        }
      } : undefined;

      SupabaseService.instance = createClient(environment.supabase.url, environment.supabase.anonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: false, // Desactivar detección de sesión en URL para evitar locks
          storage: customStorage,
          storageKey: 'sb-zzueegmnhqxedyutqbev-auth-token',
          flowType: 'pkce'
        },
        global: {
          headers: {
            'x-client-info': 'medidores-es'
          }
        }
      });
    }
    
    this.supabase = SupabaseService.instance;
  }

  get client(): SupabaseClient {
    return this.supabase;
  }
}


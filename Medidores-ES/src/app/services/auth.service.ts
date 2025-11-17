import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { SupabaseService } from './supabase.service';
import { BehaviorSubject, Observable } from 'rxjs';

export interface User {
  id: string;
  email: string;
  role: 'admin' | 'medidor';
  nombre?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$: Observable<User | null> = this.currentUserSubject.asObservable();

  constructor(
    private supabaseService: SupabaseService,
    private router: Router
  ) {
    // Cargar usuario de forma asíncrona sin bloquear
    this.loadUser().catch(err => {
      console.error('Error loading user:', err);
      this.currentUserSubject.next(null);
    });
    
    this.supabaseService.client.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        this.loadUser().catch(err => {
          console.error('Error loading user on auth change:', err);
        });
      } else if (event === 'SIGNED_OUT') {
        this.currentUserSubject.next(null);
      }
    });
  }

  async loadUser() {
    try {
      const { data: { user }, error: userError } = await this.supabaseService.client.auth.getUser();
      
      if (userError) {
        this.currentUserSubject.next(null);
        return;
      }
      
      if (user) {
        const { data: profile, error: profileError } = await this.supabaseService.client
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (profileError) {
          console.error('Error loading profile:', profileError);
          this.currentUserSubject.next(null);
          return;
        }
        
        if (profile) {
          this.currentUserSubject.next({
            id: user.id,
            email: user.email || '',
            role: profile.role,
            nombre: profile.nombre
          });
        } else {
          this.currentUserSubject.next(null);
        }
      } else {
        this.currentUserSubject.next(null);
      }
    } catch (error) {
      console.error('Error in loadUser:', error);
      this.currentUserSubject.next(null);
    }
  }

  async signUp(email: string, password: string, nombre?: string, role: 'admin' | 'medidor' = 'medidor') {
    const { data, error } = await this.supabaseService.client.auth.signUp({
      email,
      password,
      options: {
        data: {
          nombre: nombre || email.split('@')[0] || 'Usuario',
          role: role
        }
      }
    });

    if (error) throw error;

    // Esperar un momento para que el trigger cree el perfil automáticamente
    // Si el trigger no existe, intentar crear el perfil manualmente después de un breve delay
    if (data.user) {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Verificar si el perfil ya existe (creado por el trigger)
      const { data: existingProfile } = await this.supabaseService.client
        .from('profiles')
        .select('id')
        .eq('id', data.user.id)
        .single();

      // Si no existe, intentar crearlo manualmente
      if (!existingProfile) {
        const nombreFinal = nombre || email.split('@')[0] || 'Usuario';
        
        const { error: profileError } = await this.supabaseService.client
          .from('profiles')
          .insert([
            {
              id: data.user.id,
              email: email,
              nombre: nombreFinal,
              role: role
            }
          ]);

        // Si falla, puede ser que el trigger lo haya creado en el intervalo
        // Verificar nuevamente antes de lanzar el error
        if (profileError) {
          const { data: checkProfile } = await this.supabaseService.client
            .from('profiles')
            .select('id')
            .eq('id', data.user.id)
            .single();
          
          // Solo lanzar error si realmente no existe el perfil
          if (!checkProfile) {
            throw profileError;
          }
        }
      }
    }

    return data;
  }

  async signIn(email: string, password: string) {
    const { data, error } = await this.supabaseService.client.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;
    await this.loadUser();
    return data;
  }

  async signOut() {
    const { error } = await this.supabaseService.client.auth.signOut();
    if (error) throw error;
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isAuthenticated(): boolean {
    return this.currentUserSubject.value !== null;
  }

  isAdmin(): boolean {
    return this.currentUserSubject.value?.role === 'admin';
  }
}


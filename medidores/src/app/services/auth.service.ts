import { Injectable, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Subscription } from 'rxjs';
import { SupabaseService, User } from './supabase.service';

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  isAdmin: boolean;
}


@Injectable({
  providedIn: 'root'
})
export class AuthService implements OnDestroy {
  private authState = new BehaviorSubject<AuthState>({
    isAuthenticated: false,
    user: null,
    isAdmin: false
  });
  
  authState$ = this.authState.asObservable();
  private userSubscription: Subscription;

  constructor(
    private supabase: SupabaseService,
    private router: Router
  ) {
    // Subscribe to user changes from Supabase service
    this.userSubscription = this.supabase.user$.subscribe(user => {
      const isAuthenticated = !!user;
      const isAdmin = user?.user_metadata?.role === 'admin';
      
      this.authState.next({
        isAuthenticated,
        user,
        isAdmin
      });
      
      // Redirect based on auth state
      if (isAuthenticated) {
        this.router.navigate(['/readings']);
      } else {
        this.router.navigate(['/login']);
      }
    });
  }
  
  ngOnDestroy() {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  async signIn(email: string, password: string) {
    try {
      const response = await this.supabase.signIn(email, password);
      return response.user;
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  }

  async signUp(email: string, password: string, userData: { fullName: string }) {
    try {
      const response = await this.supabase.signUp(email, password, userData);
      
      if (response.user) {
        // Additional user profile creation can be added here if needed
        // await this.createUserProfile(response.user.id, userData);
      }
      
      return response.user;
    } catch (error) {
      console.error('Error signing up:', error);
      throw error;
    }
  }

  private async createUserProfile(userId: string, userData: { fullName: string; email: string }) {
    try {
      const { error } = await this.supabase.client
        .from('profiles')
        .upsert({
          id: userId,
          full_name: userData.fullName,
          email: userData.email,
          role: 'user',
          created_at: new Date().toISOString()
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error creating user profile:', error);
      throw error;
    }
  }

  async signOut() {
    try {
      await this.supabase.signOut();
      this.router.navigate(['/login']);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  }

  getCurrentUser() {
    return this.authState.value.user;
  }

  isAuthenticated() {
    return this.authState.value.isAuthenticated;
  }

  isAdmin() {
    return this.authState.value.isAdmin;
  }
  
  getAuthState() {
    return this.authState.value;
  }
}

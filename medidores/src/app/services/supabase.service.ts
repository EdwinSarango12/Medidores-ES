import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';
import { BehaviorSubject } from 'rxjs';

// Define interfaces for better type safety
export interface User {
  id: string;
  email: string;
  user_metadata?: {
    full_name?: string;
    role?: string;
  };
}

export interface Reading {
  id?: string;
  user_id: string;
  meter_number: string;
  reading_value: number;
  reading_date: string;
  meter_photo_url: string;
  house_photo_url: string;
  location: {
    latitude: number;
    longitude: number;
    accuracy?: number;
  };
  notes?: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at?: string;
  updated_at?: string;
  user?: User;
}

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient;
  private user = new BehaviorSubject<User | null>(null);
  user$ = this.user.asObservable();

  constructor() {
    const supabaseUrl = environment?.supabase?.url || '';
    const supabaseKey = environment?.supabase?.key || '';
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('Supabase URL or Key is missing in environment configuration');
    }
    
    this.supabase = createClient(supabaseUrl, supabaseKey);
    this.initializeAuth();
  }

  private async initializeAuth() {
    const { data: { session } } = await this.supabase.auth.getSession();
    if (session?.user) {
      this.user.next(session.user as unknown as User);
    }

    this.supabase.auth.onAuthStateChange((event, session) => {
      this.user.next(session?.user as unknown as User || null);
    });
  }

  // Get Supabase client instance
  get client() {
    return this.supabase;
  }

  // Get current user
  getCurrentUser() {
    return this.user.value;
  }

  // Database methods
  async getReadings(userId?: string): Promise<Reading[]> {
    try {
      let query = this.supabase
        .from('readings')
        .select(`
          *,
          user:user_id (id, email, user_metadata)
        `)
        .order('created_at', { ascending: false });

      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching readings:', error);
        throw error;
      }
      
      return data as Reading[];
    } catch (error) {
      console.error('Error in getReadings:', error);
      throw error;
    }
  }

  async createReading(reading: Omit<Reading, 'id' | 'created_at' | 'updated_at' | 'status'>): Promise<Reading> {
    try {
      const { data, error } = await this.supabase
        .from('readings')
        .insert([{
          ...reading,
          status: 'pending'
        }])
        .select()
        .single();
        
      if (error) {
        console.error('Error creating reading:', error);
        throw error;
      }
      
      return data as Reading;
    } catch (error) {
      console.error('Error in createReading:', error);
      throw error;
    }
  }

  async uploadFile(bucket: string, path: string, file: File): Promise<string> {
    try {
      const { data, error } = await this.supabase.storage
        .from(bucket)
        .upload(path, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        throw error;
      }

      const { data: { publicUrl } } = this.supabase.storage
        .from(bucket)
        .getPublicUrl(path);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  }

  getPublicUrl(bucket: string, path: string): string {
    const { data: { publicUrl } } = this.supabase.storage
      .from(bucket)
      .getPublicUrl(path);
    return publicUrl;
  }

  // Auth methods
  async signIn(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      console.error('Error signing in:', error);
      throw error;
    }

    return data;
  }

  async signUp(email: string, password: string, userData: { fullName: string }) {
    const { data, error } = await this.supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: userData.fullName,
          role: 'user'
        }
      }
    });

    if (error) {
      console.error('Error signing up:', error);
      throw error;
    }

    return data;
  }

  async signOut() {
    try {
      const { error } = await this.supabase.auth.signOut();
      if (error) throw error;
      this.user.next(null);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  }
}

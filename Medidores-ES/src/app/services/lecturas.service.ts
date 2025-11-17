import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { AuthService } from './auth.service';

export interface Lectura {
  id?: string;
  user_id: string;
  valor_medidor: number;
  observaciones?: string;
  foto_medidor?: string;
  foto_fachada?: string;
  latitud: number;
  longitud: number;
  google_maps_link?: string;
  created_at?: string;
  usuario_nombre?: string;
  usuario_email?: string;
}

@Injectable({
  providedIn: 'root'
})
export class LecturasService {
  constructor(
    private supabaseService: SupabaseService,
    private authService: AuthService
  ) {}

  async createLectura(lectura: Omit<Lectura, 'id' | 'created_at' | 'google_maps_link' | 'user_id'>): Promise<Lectura> {
    const user = this.authService.getCurrentUser();
    if (!user) throw new Error('Usuario no autenticado');

    // Generar enlace de Google Maps
    const googleMapsLink = `https://www.google.com/maps?q=${lectura.latitud},${lectura.longitud}`;

    const { data, error } = await this.supabaseService.client
      .from('lecturas')
      .insert([
        {
          ...lectura,
          user_id: user.id,
          google_maps_link: googleMapsLink
        }
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getLecturas(): Promise<Lectura[]> {
    const user = this.authService.getCurrentUser();
    if (!user) throw new Error('Usuario no autenticado');

    let query = this.supabaseService.client
      .from('lecturas')
      .select(`
        *,
        profiles:user_id (
          nombre,
          email
        )
      `)
      .order('created_at', { ascending: false });

    // Si no es admin, solo mostrar sus propias lecturas
    if (user.role !== 'admin') {
      query = query.eq('user_id', user.id);
    }

    const { data, error } = await query;

    if (error) throw error;

    // Formatear los datos para incluir información del usuario
    return data.map((lectura: any) => ({
      ...lectura,
      usuario_nombre: lectura.profiles?.nombre,
      usuario_email: lectura.profiles?.email
    }));
  }

  async getLecturaById(id: string): Promise<Lectura> {
    const { data, error } = await this.supabaseService.client
      .from('lecturas')
      .select(`
        *,
        profiles:user_id (
          nombre,
          email
        )
      `)
      .eq('id', id)
      .single();

    if (error) throw error;

    return {
      ...data,
      usuario_nombre: data.profiles?.nombre,
      usuario_email: data.profiles?.email
    };
  }

  async uploadImage(file: File, folder: string): Promise<string> {
    const user = this.authService.getCurrentUser();
    if (!user) throw new Error('Usuario no autenticado');

    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}_${Date.now()}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    const { error: uploadError } = await this.supabaseService.client.storage
      .from('lecturas')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = this.supabaseService.client.storage
      .from('lecturas')
      .getPublicUrl(filePath);

    return data.publicUrl;
  }
}


import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { AuthService } from './auth.service';

export interface Medidor {
  id?: string;
  numero_medidor: string;
  lectura_actual: number;
  lectura_anterior: number;
  consumo: number;
  fecha_lectura: string;
  ubicacion_lat?: number;
  ubicacion_lng?: number;
  direccion?: string;
  usuario_id: string;
  created_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class MedidorService {

  constructor(
    private supabaseService: SupabaseService,
    private authService: AuthService
  ) { }

  async getMedidores(): Promise<Medidor[]> {
    const user = this.authService.getCurrentUser();
    if (!user) throw new Error('Usuario no autenticado');

    let query = this.supabaseService.client
      .from('medidores')
      .select('*')
      .order('created_at', { ascending: false });

    // Si no es admin, solo ver sus propios medidores
    if (user.role !== 'admin') {
      query = query.eq('usuario_id', user.id);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  }

  async getMedidorById(id: string): Promise<Medidor | null> {
    const { data, error } = await this.supabaseService.client
      .from('medidores')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  async createMedidor(medidor: Omit<Medidor, 'id' | 'created_at'>): Promise<Medidor> {
    const user = this.authService.getCurrentUser();
    if (!user) throw new Error('Usuario no autenticado');

    const { data, error } = await this.supabaseService.client
      .from('medidores')
      .insert([{
        ...medidor,
        usuario_id: user.id
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateMedidor(id: string, medidor: Partial<Medidor>): Promise<Medidor> {
    const { data, error } = await this.supabaseService.client
      .from('medidores')
      .update(medidor)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteMedidor(id: string): Promise<void> {
    const { error } = await this.supabaseService.client
      .from('medidores')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // Obtener estadísticas de consumo
  async getEstadisticas(): Promise<any> {
    const medidores = await this.getMedidores();
    
    const totalConsumo = medidores.reduce((sum, m) => sum + m.consumo, 0);
    const promedioConsumo = medidores.length > 0 ? totalConsumo / medidores.length : 0;
    const consumoMaximo = Math.max(...medidores.map(m => m.consumo), 0);
    
    // Contar medidores por rango de consumo
    const rangos = {
      bajo: medidores.filter(m => m.consumo < 10).length,
      medio: medidores.filter(m => m.consumo >= 10 && m.consumo < 20).length,
      alto: medidores.filter(m => m.consumo >= 20).length
    };

    return {
      totalMedidores: medidores.length,
      totalConsumo,
      promedioConsumo,
      consumoMaximo,
      rangos,
      medidores
    };
  }
}

import { Component, OnInit } from '@angular/core';
import { LoadingController, AlertController } from '@ionic/angular';
import { SupabaseService } from '../../services/supabase.service';
import { AuthService } from '../../services/auth.service';
import { Reading } from '../../interfaces/reading.interface';

@Component({
  selector: 'app-readings',
  templateUrl: './readings.page.html',
  styleUrls: ['./readings.page.scss'],
})
export class ReadingsPage implements OnInit {
  readings: Reading[] = [];
  filteredReadings: Reading[] = [];
  searchTerm = '';
  statusFilter = 'all';
  isAdmin = false;

  constructor(
    private supabase: SupabaseService,
    private authService: AuthService,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController
  ) {}

  async ngOnInit() {
    this.isAdmin = this.authService.isAdmin();
    await this.loadReadings();
  }

  async loadReadings() {
    const loading = await this.loadingCtrl.create({
      message: 'Cargando lecturas...',
    });
    await loading.present();

    try {
      const userId = this.isAdmin ? undefined : this.authService.getCurrentUser()?.id;
      this.readings = await this.supabase.getReadings(userId);
      this.filterReadings();
    } catch (error) {
      console.error('Error al cargar lecturas:', error);
      this.showAlert('Error', 'No se pudieron cargar las lecturas.');
    } finally {
      await loading.dismiss();
    }
  }

  filterReadings() {
    this.filteredReadings = this.readings.filter(reading => {
      const matchesSearch = 
        reading.meter_number.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        reading.notes?.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesStatus = 
        this.statusFilter === 'all' || 
        reading.status === this.statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }

  onSearchChange(event: any) {
    this.searchTerm = event.detail.value || '';
    this.filterReadings();
  }

  onStatusChange(event: any) {
    this.statusFilter = event.detail.value;
    this.filterReadings();
  }

  async refresh(event: any) {
    await this.loadReadings();
    event.target.complete();
  }

  async deleteReading(reading: Reading) {
    const alert = await this.alertCtrl.create({
      header: 'Eliminar Lectura',
      message: '¿Estás seguro de que deseas eliminar esta lectura?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Eliminar',
          handler: async () => {
            const loading = await this.loadingCtrl.create({
              message: 'Eliminando lectura...',
            });
            await loading.present();

            try {
              const { error } = await this.supabase.client
                .from('readings')
                .delete()
                .eq('id', reading.id);

              if (error) throw error;
              
              // Recargar lecturas
              await this.loadReadings();
            } catch (error) {
              console.error('Error al eliminar lectura:', error);
              this.showAlert('Error', 'No se pudo eliminar la lectura.');
            } finally {
              await loading.dismiss();
            }
          }
        }
      ]
    });

    await alert.present();
  }

  private async showAlert(header: string, message: string) {
    const alert = await this.alertCtrl.create({
      header,
      message,
      buttons: ['OK']
    });
    
    await alert.present();
  }
}

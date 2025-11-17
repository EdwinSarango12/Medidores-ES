import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, LoadingController } from '@ionic/angular';
import { AuthService } from '../../services/auth.service';
import { SupabaseService } from '../../services/supabase.service';
import { Reading } from '../../interfaces/reading.interface';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
  user: any;
  recentReadings: Reading[] = [];
  isAdmin = false;

  constructor(
    private authService: AuthService,
    private supabase: SupabaseService,
    private router: Router,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController
  ) {}

  async ngOnInit() {
    this.user = this.authService.getCurrentUser();
    this.isAdmin = this.authService.isAdmin();
    await this.loadRecentReadings();
  }

  async loadRecentReadings() {
    const loading = await this.loadingCtrl.create({
      message: 'Cargando lecturas recientes...',
    });
    await loading.present();

    try {
      // Si es administrador, cargar todas las lecturas, de lo contrario solo las del usuario
      const userId = this.isAdmin ? undefined : this.user.id;
      this.recentReadings = await this.supabase.getReadings(userId);
    } catch (error) {
      console.error('Error al cargar lecturas:', error);
      this.showAlert('Error', 'No se pudieron cargar las lecturas recientes.');
    } finally {
      await loading.dismiss();
    }
  }

  async doRefresh(event: any) {
    await this.loadRecentReadings();
    event.target.complete();
  }

  async logout() {
    const alert = await this.alertCtrl.create({
      header: 'Cerrar sesión',
      message: '¿Estás seguro de que deseas cerrar sesión?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Cerrar sesión',
          handler: async () => {
            await this.authService.signOut();
          }
        }
      ]
    });

    await alert.present();
  }

  viewReading(reading: Reading) {
    this.router.navigate(['/reading-details', reading.id]);
  }

  async deleteReading(reading: Reading, event: Event) {
    event.stopPropagation();
    
    const alert = await this.alertCtrl.create({
      header: 'Eliminar lectura',
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
              
              // Actualizar la lista de lecturas
              await this.loadRecentReadings();
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

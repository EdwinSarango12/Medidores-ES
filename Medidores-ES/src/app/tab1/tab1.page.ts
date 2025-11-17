import { Component, OnInit } from '@angular/core';
import { MedidorService, Medidor } from '../services/medidor.service';
import { AuthService } from '../services/auth.service';
import { AlertController, ToastController } from '@ionic/angular';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: false,
})
export class Tab1Page implements OnInit {
  medidores: Medidor[] = [];
  loading = false;
  isAdmin = false;

  constructor(
    private medidorService: MedidorService,
    private authService: AuthService,
    private alertController: AlertController,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    this.isAdmin = this.authService.isAdmin();
    this.loadMedidores();
  }

  ionViewWillEnter() {
    this.loadMedidores();
  }

  async loadMedidores() {
    this.loading = true;
    try {
      this.medidores = await this.medidorService.getMedidores();
    } catch (error: any) {
      this.showToast('Error al cargar medidores: ' + error.message, 'danger');
    } finally {
      this.loading = false;
    }
  }

  getConsumoColor(consumo: number): string {
    if (consumo < 10) return 'success';
    if (consumo < 20) return 'warning';
    return 'danger';
  }

  async verDetalle(medidor: Medidor) {
    const alert = await this.alertController.create({
      header: `Medidor #${medidor.numero_medidor}`,
      message: `
        <strong>Lectura Actual:</strong> ${medidor.lectura_actual} m³<br>
        <strong>Lectura Anterior:</strong> ${medidor.lectura_anterior} m³<br>
        <strong>Consumo:</strong> ${medidor.consumo} m³<br>
        <strong>Fecha:</strong> ${new Date(medidor.fecha_lectura).toLocaleDateString()}<br>
        ${medidor.direccion ? `<strong>Dirección:</strong> ${medidor.direccion}` : ''}
      `,
      buttons: ['Cerrar']
    });
    await alert.present();
  }

  async eliminarMedidor(medidor: Medidor) {
    const alert = await this.alertController.create({
      header: 'Confirmar eliminación',
      message: `¿Está seguro de eliminar el medidor #${medidor.numero_medidor}?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: async () => {
            try {
              await this.medidorService.deleteMedidor(medidor.id!);
              this.showToast('Medidor eliminado exitosamente', 'success');
              this.loadMedidores();
            } catch (error: any) {
              this.showToast('Error al eliminar medidor: ' + error.message, 'danger');
            }
          }
        }
      ]
    });
    await alert.present();
  }

  async showToast(message: string, color: string = 'primary') {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      color,
      position: 'bottom'
    });
    await toast.present();
  }
}

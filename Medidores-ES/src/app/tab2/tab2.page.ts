import { Component, OnInit } from '@angular/core';
import { MedidorService } from '../services/medidor.service';
import { Router } from '@angular/router';
import { LoadingController, ToastController, AlertController } from '@ionic/angular';
import { Geolocation } from '@capacitor/geolocation';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  standalone: false,
})
export class Tab2Page implements OnInit {
  medidor = {
    numero_medidor: '',
    lectura_actual: 0,
    lectura_anterior: 0,
    consumo: 0,
    fecha_lectura: new Date().toISOString().split('T')[0],
    ubicacion_lat: undefined as number | undefined,
    ubicacion_lng: undefined as number | undefined,
    direccion: '',
    usuario_id: ''
  };

  obteniendoUbicacion = false;
  ubicacionObtenida = false;

  constructor(
    private medidorService: MedidorService,
    private router: Router,
    private loadingController: LoadingController,
    private toastController: ToastController,
    private alertController: AlertController
  ) {}

  ngOnInit() {
    // Inicializar con fecha actual
    this.medidor.fecha_lectura = new Date().toISOString().split('T')[0];
  }

  calcularConsumo() {
    if (this.medidor.lectura_actual && this.medidor.lectura_anterior) {
      this.medidor.consumo = this.medidor.lectura_actual - this.medidor.lectura_anterior;
      if (this.medidor.consumo < 0) {
        this.medidor.consumo = 0;
        this.showToast('La lectura actual debe ser mayor a la anterior', 'warning');
      }
    }
  }

  getConsumoColor(consumo: number): string {
    if (consumo < 10) return 'success';
    if (consumo < 20) return 'warning';
    return 'danger';
  }

  async obtenerUbicacionAutomatica() {
    this.obteniendoUbicacion = true;
    this.ubicacionObtenida = false;

    try {
      // Verificar permisos
      const permissionStatus = await Geolocation.checkPermissions();
      
      if (permissionStatus.location !== 'granted') {
        const requestPermission = await Geolocation.requestPermissions();
        if (requestPermission.location !== 'granted') {
          this.showToast('Se necesitan permisos de ubicación', 'warning');
          this.obteniendoUbicacion = false;
          return;
        }
      }

      // Obtener ubicación
      const position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 10000
      });

      this.medidor.ubicacion_lat = position.coords.latitude;
      this.medidor.ubicacion_lng = position.coords.longitude;
      this.ubicacionObtenida = true;
      this.showToast('Ubicación obtenida exitosamente', 'success');
    } catch (error: any) {
      console.error('Error obteniendo ubicación:', error);
      
      // Mostrar alerta para ingresar manualmente
      const alert = await this.alertController.create({
        header: 'Error de Ubicación',
        message: 'No se pudo obtener la ubicación automáticamente. Por favor, ingrese las coordenadas o dirección manualmente.',
        buttons: ['Entendido']
      });
      await alert.present();
    } finally {
      this.obteniendoUbicacion = false;
    }
  }

  formularioValido(): boolean {
    return !!(
      this.medidor.numero_medidor &&
      this.medidor.lectura_actual >= 0 &&
      this.medidor.lectura_anterior >= 0 &&
      this.medidor.fecha_lectura
    );
  }

  async guardarMedidor() {
    if (!this.formularioValido()) {
      this.showToast('Por favor complete todos los campos requeridos', 'warning');
      return;
    }

    if (this.medidor.consumo < 0) {
      this.showToast('La lectura actual debe ser mayor a la anterior', 'danger');
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Guardando medidor...'
    });
    await loading.present();

    try {
      await this.medidorService.createMedidor(this.medidor);
      await loading.dismiss();
      this.showToast('Medidor registrado exitosamente', 'success');
      this.limpiarFormulario();
      this.router.navigate(['/tabs/tab1']);
    } catch (error: any) {
      await loading.dismiss();
      this.showToast('Error al guardar medidor: ' + error.message, 'danger');
    }
  }

  limpiarFormulario() {
    this.medidor = {
      numero_medidor: '',
      lectura_actual: 0,
      lectura_anterior: 0,
      consumo: 0,
      fecha_lectura: new Date().toISOString().split('T')[0],
      ubicacion_lat: undefined,
      ubicacion_lng: undefined,
      direccion: '',
      usuario_id: ''
    };
    this.ubicacionObtenida = false;
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

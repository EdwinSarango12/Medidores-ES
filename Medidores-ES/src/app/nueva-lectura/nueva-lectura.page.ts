import { Component, OnInit } from '@angular/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Geolocation } from '@capacitor/geolocation';
import { LecturasService } from '../services/lecturas.service';
import { LoadingController, ToastController, AlertController } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-nueva-lectura',
  templateUrl: './nueva-lectura.page.html',
  styleUrls: ['./nueva-lectura.page.scss'],
  standalone: false
})
export class NuevaLecturaPage implements OnInit {
  valorMedidor: number | null = null;
  observaciones: string = '';
  fotoMedidor: string | null = null;
  fotoFachada: string | null = null;
  latitud: number | null = null;
  longitud: number | null = null;
  ubicacionObtenida: boolean = false;
  mostrarEntradaManual: boolean = false;
  latitudManual: string = '';
  longitudManual: string = '';

  constructor(
    private lecturasService: LecturasService,
    private loadingController: LoadingController,
    private toastController: ToastController,
    private alertController: AlertController,
    private router: Router
  ) {}

  ngOnInit() {
    this.obtenerUbicacion();
  }

  async obtenerUbicacion() {
    try {
      const position = await Geolocation.getCurrentPosition();
      this.latitud = position.coords.latitude;
      this.longitud = position.coords.longitude;
      this.ubicacionObtenida = true;
      this.mostrarEntradaManual = false;
    } catch (error) {
      this.showToast('No se pudo obtener la ubicación automáticamente. Puede ingresarla manualmente.', 'warning');
      this.mostrarEntradaManual = true;
    }
  }

  async ingresarUbicacionManual() {
    const alert = await this.alertController.create({
      header: 'Ingresar Ubicación Manual',
      inputs: [
        {
          name: 'latitud',
          type: 'number',
          placeholder: 'Latitud (ej: -0.180653)',
          value: this.latitudManual || (this.latitud ? this.latitud.toString() : '')
        },
        {
          name: 'longitud',
          type: 'number',
          placeholder: 'Longitud (ej: -78.467834)',
          value: this.longitudManual || (this.longitud ? this.longitud.toString() : '')
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Guardar',
          handler: (data) => {
            if (data.latitud && data.longitud) {
              this.latitud = parseFloat(data.latitud);
              this.longitud = parseFloat(data.longitud);
              this.latitudManual = data.latitud;
              this.longitudManual = data.longitud;
              this.ubicacionObtenida = true;
              this.mostrarEntradaManual = false;
              this.showToast('Ubicación guardada correctamente', 'success');
            } else {
              this.showToast('Por favor ingrese valores válidos', 'danger');
            }
          }
        }
      ]
    });

    await alert.present();
  }

  async tomarFoto(tipo: 'medidor' | 'fachada') {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera
      });

      if (image.dataUrl) {
        if (tipo === 'medidor') {
          this.fotoMedidor = image.dataUrl;
        } else {
          this.fotoFachada = image.dataUrl;
        }
      }
    } catch (error) {
      this.showToast('Error al tomar la foto', 'danger');
    }
  }

  async eliminarFoto(tipo: 'medidor' | 'fachada') {
    if (tipo === 'medidor') {
      this.fotoMedidor = null;
    } else {
      this.fotoFachada = null;
    }
  }

  async guardarLectura() {
    if (!this.valorMedidor) {
      this.showToast('Por favor ingrese el valor del medidor', 'danger');
      return;
    }

    if (!this.fotoMedidor) {
      this.showToast('Por favor tome una foto del medidor', 'danger');
      return;
    }

    if (!this.fotoFachada) {
      this.showToast('Por favor tome una foto de la fachada', 'danger');
      return;
    }

    if (!this.latitud || !this.longitud) {
      this.showToast('Por favor ingrese la ubicación (automática o manual)', 'danger');
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Guardando lectura...'
    });
    await loading.present();

    try {
      // Convertir dataUrl a File para subir
      const fotoMedidorFile = this.dataURLtoFile(this.fotoMedidor, 'medidor.jpg');
      const fotoFachadaFile = this.dataURLtoFile(this.fotoFachada, 'fachada.jpg');

      // Subir imágenes
      const fotoMedidorUrl = await this.lecturasService.uploadImage(fotoMedidorFile, 'medidores');
      const fotoFachadaUrl = await this.lecturasService.uploadImage(fotoFachadaFile, 'fachadas');

      // Crear lectura
      await this.lecturasService.createLectura({
        valor_medidor: this.valorMedidor,
        observaciones: this.observaciones,
        foto_medidor: fotoMedidorUrl,
        foto_fachada: fotoFachadaUrl,
        latitud: this.latitud,
        longitud: this.longitud
      });

      await loading.dismiss();
      this.showToast('Lectura guardada exitosamente', 'success');
      
      // Limpiar formulario
      this.valorMedidor = null;
      this.observaciones = '';
      this.fotoMedidor = null;
      this.fotoFachada = null;
      
      // Volver a obtener ubicación para nueva lectura
      this.obtenerUbicacion();
      
    } catch (error: any) {
      await loading.dismiss();
      this.showToast(error.message || 'Error al guardar la lectura', 'danger');
    }
  }

  dataURLtoFile(dataurl: string, filename: string): File {
    const arr = dataurl.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
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

import { Component, OnInit } from '@angular/core';
import { LecturasService, Lectura } from '../services/lecturas.service';
import { AuthService } from '../services/auth.service';
import { LoadingController, ToastController } from '@ionic/angular';
import { Browser } from '@capacitor/browser';

@Component({
  selector: 'app-lista-lecturas',
  templateUrl: './lista-lecturas.page.html',
  styleUrls: ['./lista-lecturas.page.scss'],
  standalone: false
})
export class ListaLecturasPage implements OnInit {
  lecturas: Lectura[] = [];
  isAdmin: boolean = false;

  constructor(
    private lecturasService: LecturasService,
    private authService: AuthService,
    private loadingController: LoadingController,
    private toastController: ToastController
  ) {}

  async ngOnInit() {
    this.isAdmin = this.authService.isAdmin();
    await this.cargarLecturas();
  }

  async ionViewWillEnter() {
    await this.cargarLecturas();
  }

  async cargarLecturas() {
    const loading = await this.loadingController.create({
      message: 'Cargando lecturas...'
    });
    await loading.present();

    try {
      this.lecturas = await this.lecturasService.getLecturas();
      await loading.dismiss();
    } catch (error: any) {
      await loading.dismiss();
      this.showToast(error.message || 'Error al cargar las lecturas', 'danger');
    }
  }

  async abrirGoogleMaps(lectura: Lectura) {
    if (lectura.google_maps_link) {
      await Browser.open({ url: lectura.google_maps_link });
    }
  }

  async openImage(imageUrl: string) {
    await Browser.open({ url: imageUrl });
  }

  formatearFecha(fecha: string | undefined): string {
    if (!fecha) return '';
    const date = new Date(fecha);
    return date.toLocaleString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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

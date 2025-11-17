import { Injectable } from '@angular/core';
import { Geolocation } from '@capacitor/geolocation';
import { AlertController } from '@ionic/angular';
import { environment } from '../../environments/environment';

export interface Position {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp?: number;
}

@Injectable({
  providedIn: 'root'
})
export class LocationService {
  constructor(private alertController: AlertController) {}

  async getCurrentPosition(): Promise<Position | null> {
    try {
      const permissionStatus = await Geolocation.checkPermissions();
      
      if (permissionStatus.location !== 'granted') {
        const permissionRequest = await Geolocation.requestPermissions();
        if (permissionRequest.location !== 'granted') {
          await this.showLocationPermissionAlert();
          return null;
        }
      }

      const position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 10000,
      });

      return {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        timestamp: position.timestamp
      };
    } catch (error) {
      console.error('Error getting location:', error);
      await this.showLocationErrorAlert();
      return null;
    }
  }

  getGoogleMapsLink(latitude: number, longitude: number): string {
    return `https://www.google.com/maps?q=${latitude},${longitude}`;
  }

  getStaticMapUrl(latitude: number, longitude: number, zoom: number = environment.mapbox?.zoom || 15, size: string = '600x300'): string {
    const apiKey = environment.mapbox?.apiKey || '';
    const style = environment.mapbox?.style || 'mapbox/streets-v11';
    return `https://api.mapbox.com/styles/v1/${style}/static/pin-s+ff0000(${longitude},${latitude})/${longitude},${latitude},${zoom}/${size}?access_token=${apiKey}`;
  }

  private async showLocationPermissionAlert() {
    const alert = await this.alertController.create({
      header: 'Permiso de ubicación requerido',
      message: 'Necesitamos acceder a tu ubicación para registrar la lectura del medidor. Por favor, activa los permisos de ubicación en la configuración de tu dispositivo.',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Abrir configuración',
          handler: () => {
            // Abrir configuración de la aplicación
            // Esto puede variar según la plataforma
            // Abrir configuración de ubicación (implementación específica por plataforma)
            // Para web, esto no está disponible
            if ((window as any).cordova && (window as any).cordova.plugins?.settings) {
              (window as any).cordova.plugins.settings.open('location');
            }
          }
        }
      ]
    });

    await alert.present();
  }

  private async showLocationErrorAlert() {
    const alert = await this.alertController.create({
      header: 'Error de ubicación',
      message: 'No se pudo obtener la ubicación actual. Por favor, asegúrate de que el GPS esté activado y que hayas otorgado los permisos necesarios.',
      buttons: ['OK']
    });

    await alert.present();
  }
}

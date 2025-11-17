import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { LoadingController, AlertController, NavController } from '@ionic/angular';
import { SupabaseService } from '../../services/supabase.service';
import { LocationService } from '../../services/location.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-new-reading',
  templateUrl: './new-reading.page.html',
  styleUrls: ['./new-reading.page.scss'],
})
export class NewReadingPage implements OnInit {
  readingForm: FormGroup;
  meterPhoto: string | null = null;
  housePhoto: string | null = null;
  currentLocation: { latitude: number; longitude: number; accuracy?: number } | null = null;
  locationError: string | null = null;
  isSubmitting = false;

  constructor(
    private formBuilder: FormBuilder,
    private supabase: SupabaseService,
    private locationService: LocationService,
    private authService: AuthService,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController,
    private navCtrl: NavController
  ) {
    this.readingForm = this.formBuilder.group({
      meter_number: ['', [Validators.required, Validators.pattern('^[0-9]+$')]],
      reading_value: ['', [Validators.required, Validators.min(0)]],
      reading_date: [new Date().toISOString(), Validators.required],
      notes: [''],
    });
  }

  async ngOnInit() {
    await this.getCurrentLocation();
  }

  async getCurrentLocation() {
    try {
      const position = await this.locationService.getCurrentPosition();
      if (position) {
        this.currentLocation = {
          latitude: position.latitude,
          longitude: position.longitude,
          accuracy: position.accuracy
        };
        this.locationError = null;
      }
    } catch (error) {
      console.error('Error al obtener la ubicación:', error);
      this.locationError = 'No se pudo obtener la ubicación. Asegúrate de habilitar los permisos de ubicación.';
    }
  }

  async takePhoto(type: 'meter' | 'house') {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera
      });

      if (image.dataUrl) {
        if (type === 'meter') {
          this.meterPhoto = image.dataUrl;
        } else {
          this.housePhoto = image.dataUrl;
        }
      }
    } catch (error) {
      console.error('Error al tomar la foto:', error);
      this.showAlert('Error', 'No se pudo tomar la foto. Por favor, inténtalo de nuevo.');
    }
  }

  removePhoto(type: 'meter' | 'house') {
    if (type === 'meter') {
      this.meterPhoto = null;
    } else {
      this.housePhoto = null;
    }
  }

  async onSubmit() {
    if (this.readingForm.invalid || !this.meterPhoto || !this.currentLocation) {
      this.showAlert('Datos incompletos', 'Por favor, completa todos los campos obligatorios y asegúrate de tomar una foto del medidor.');
      return;
    }

    this.isSubmitting = true;
    const loading = await this.loadingCtrl.create({
      message: 'Guardando lectura...',
    });
    await loading.present();

    try {
      const user = this.authService.getCurrentUser();
      if (!user) throw new Error('Usuario no autenticado');

      // Subir fotos al almacenamiento
      const meterPhotoUrl = await this.uploadPhoto(this.meterPhoto, `meters/${user.id}/${Date.now()}_meter.jpg`);
      let housePhotoUrl = '';
      
      if (this.housePhoto) {
        housePhotoUrl = await this.uploadPhoto(this.housePhoto, `houses/${user.id}/${Date.now()}_house.jpg`);
      }

      // Crear el registro de la lectura
      const readingData = {
        ...this.readingForm.value,
        user_id: user.id,
        meter_photo_url: meterPhotoUrl,
        house_photo_url: housePhotoUrl || null,
        location: this.currentLocation,
        status: 'pending',
        created_at: new Date().toISOString()
      };

      const { data, error } = await this.supabase.client
        .from('readings')
        .insert([readingData])
        .select();

      if (error) throw error;

      await loading.dismiss();
      this.showSuccessAlert();
    } catch (error) {
      console.error('Error al guardar la lectura:', error);
      await loading.dismiss();
      this.showAlert('Error', 'No se pudo guardar la lectura. Por favor, inténtalo de nuevo.');
    } finally {
      this.isSubmitting = false;
    }
  }

  private async uploadPhoto(photoData: string, path: string): Promise<string> {
    try {
      // Convertir data URL a blob
      const response = await fetch(photoData);
      const blob = await response.blob();
      
      // Subir a Supabase Storage
      const fileExt = path.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${path.split('/').slice(0, -1).join('/')}/${fileName}`;
      
      const { data, error } = await this.supabase.client.storage
        .from('readings')
        .upload(filePath, blob);

      if (error) throw error;

      // Obtener URL pública
      const { data: { publicUrl } } = this.supabase.client.storage
        .from('readings')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Error al subir la foto:', error);
      throw new Error('No se pudo subir la foto');
    }
  }

  private async showAlert(header: string, message: string) {
    const alert = await this.alertCtrl.create({
      header,
      message,
      buttons: ['OK']
    });
    
    await alert.present();
  }

  private async showSuccessAlert() {
    const alert = await this.alertCtrl.create({
      header: '¡Éxito!',
      message: 'La lectura se ha registrado correctamente.',
      buttons: [
        {
          text: 'Aceptar',
          handler: () => {
            this.navCtrl.navigateBack('/readings', { replaceUrl: true });
          }
        }
      ]
    });
    
    await alert.present();
  }

  get meterNumber() {
    return this.readingForm.get('meter_number');
  }

  get readingValue() {
    return this.readingForm.get('reading_value');
  }
}

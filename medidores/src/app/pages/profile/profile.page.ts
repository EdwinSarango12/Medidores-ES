import { Component, OnInit } from '@angular/core';
import { AlertController, LoadingController, NavController } from '@ionic/angular';
import { AuthService } from '../../services/auth.service';
import { SupabaseService } from '../../services/supabase.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {
  user: any;
  profile: any = {};
  isEditing = false;
  isLoading = false;

  constructor(
    private authService: AuthService,
    private supabase: SupabaseService,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController,
    private navCtrl: NavController
  ) {}

  async ngOnInit() {
    await this.loadUserData();
  }

  async loadUserData() {
    this.isLoading = true;
    this.user = this.authService.getCurrentUser();
    
    if (this.user) {
      try {
        // Cargar datos adicionales del perfil
        const { data, error } = await this.supabase.client
          .from('profiles')
          .select('*')
          .eq('id', this.user.id)
          .single();

        if (error) throw error;
        
        this.profile = data || {};
        // Asegurarse de que los campos básicos estén definidos
        this.profile.full_name = this.profile.full_name || this.user.user_metadata?.full_name || '';
        this.profile.email = this.profile.email || this.user.email || '';
        this.profile.phone = this.profile.phone || '';
        
      } catch (error) {
        console.error('Error al cargar el perfil:', error);
        this.showAlert('Error', 'No se pudo cargar la información del perfil.');
      }
    }
    
    this.isLoading = false;
  }

  async updateProfile() {
    if (!this.user) return;
    
    const loading = await this.loadingCtrl.create({
      message: 'Actualizando perfil...',
    });
    
    await loading.present();

    try {
      // Actualizar datos del perfil en Supabase
      const { error } = await this.supabase.client
        .from('profiles')
        .upsert({
          id: this.user.id,
          full_name: this.profile.full_name,
          email: this.profile.email,
          phone: this.profile.phone,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      // Actualizar datos del usuario en Auth
      const { error: updateError } = await this.supabase.client.auth.updateUser({
        data: { full_name: this.profile.full_name }
      });

      if (updateError) throw updateError;

      await loading.dismiss();
      this.isEditing = false;
      this.showAlert('Éxito', 'Perfil actualizado correctamente');
      
    } catch (error) {
      console.error('Error al actualizar el perfil:', error);
      await loading.dismiss();
      this.showAlert('Error', 'No se pudo actualizar el perfil. Intenta de nuevo.');
    }
  }

  async changePassword() {
    const alert = await this.alertCtrl.create({
      header: 'Cambiar Contraseña',
      inputs: [
        {
          name: 'currentPassword',
          type: 'password',
          placeholder: 'Contraseña actual',
        },
        {
          name: 'newPassword',
          type: 'password',
          placeholder: 'Nueva contraseña (mínimo 6 caracteres)',
        },
        {
          name: 'confirmPassword',
          type: 'password',
          placeholder: 'Confirmar nueva contraseña',
        },
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Guardar',
          handler: async (data) => {
            if (data.newPassword !== data.confirmPassword) {
              this.showAlert('Error', 'Las contraseñas no coinciden');
              return false;
            }
            
            if (data.newPassword.length < 6) {
              this.showAlert('Error', 'La contraseña debe tener al menos 6 caracteres');
              return false;
            }
            
            const loading = await this.loadingCtrl.create({
              message: 'Actualizando contraseña...',
            });
            
            await loading.present();
            
            try {
              const { error } = await this.supabase.client.auth.updateUser({
                password: data.newPassword
              });
              
              if (error) throw error;
              
              await loading.dismiss();
              this.showAlert('Éxito', 'Contraseña actualizada correctamente');
              return true;
              
            } catch (error) {
              console.error('Error al cambiar la contraseña:', error);
              await loading.dismiss();
              this.showAlert('Error', 'No se pudo cambiar la contraseña. Verifica tu contraseña actual e inténtalo de nuevo.');
              return false;
            }
          },
        },
      ],
    });

    await alert.present();
  }

  async logout() {
    const alert = await this.alertCtrl.create({
      header: 'Cerrar Sesión',
      message: '¿Estás seguro de que deseas cerrar sesión?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Cerrar Sesión',
          handler: async () => {
            await this.authService.signOut();
            this.navCtrl.navigateRoot('/login', { replaceUrl: true });
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

import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { LoadingController, ToastController } from '@ionic/angular';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: false
})
export class RegisterPage implements OnInit {
  email: string = '';
  password: string = '';
  confirmPassword: string = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private loadingController: LoadingController,
    private toastController: ToastController
  ) {}

  ngOnInit() {}

  async register() {
    if (!this.email || !this.password) {
      this.showToast('Por favor complete todos los campos', 'danger');
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.showToast('Las contraseñas no coinciden', 'danger');
      return;
    }

    if (this.password.length < 6) {
      this.showToast('La contraseña debe tener al menos 6 caracteres', 'danger');
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Registrando usuario...'
    });
    await loading.present();

    try {
      // Solo pasar email y password, el perfil se creará con valores por defecto
      await this.authService.signUp(this.email, this.password);
      await loading.dismiss();
      this.showToast('Registro exitoso. Por favor inicie sesión', 'success');
      this.router.navigate(['/login']);
    } catch (error: any) {
      await loading.dismiss();
      this.showToast(error.message || 'Error al registrar usuario', 'danger');
    }
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

import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { LoadingController, ToastController } from '@ionic/angular';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false
})
export class LoginPage implements OnInit {
  email: string = '';
  password: string = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private loadingController: LoadingController,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    // Si ya está autenticado, redirigir a tabs
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/tabs']);
    }
  }

  async login() {
    if (!this.email || !this.password) {
      this.showToast('Por favor complete todos los campos', 'danger');
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Iniciando sesión...'
    });
    await loading.present();

    try {
      await this.authService.signIn(this.email, this.password);
      await loading.dismiss();
      this.router.navigate(['/tabs']);
    } catch (error: any) {
      await loading.dismiss();
      this.showToast(error.message || 'Error al iniciar sesión', 'danger');
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

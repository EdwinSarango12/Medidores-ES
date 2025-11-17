import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController, LoadingController } from '@ionic/angular';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  credentials: FormGroup;
  isLogin = true;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private loadingController: LoadingController,
    private alertController: AlertController
  ) {
    this.credentials = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit() {
    // Verificar si el usuario ya está autenticado
    if (this.authService.isAuthenticated()) {
      this.router.navigateByUrl('/home', { replaceUrl: true });
    }
  }

  async login() {
    const loading = await this.loadingController.create();
    await loading.present();

    try {
      await this.authService.signIn(
        this.credentials.value.email,
        this.credentials.value.password
      );
      
      await loading.dismiss();
      this.router.navigateByUrl('/home', { replaceUrl: true });
    } catch (error) {
      await loading.dismiss();
      this.showAlert('Error de inicio de sesión', 'No se pudo iniciar sesión. Verifica tus credenciales.');
    }
  }

  async register() {
    const loading = await this.loadingController.create();
    await loading.present();

    try {
      await this.authService.signUp(
        this.credentials.value.email,
        this.credentials.value.password,
        {
          fullName: 'Nuevo Usuario', // Podrías agregar un campo para el nombre completo
          email: this.credentials.value.email
        }
      );
      
      await loading.dismiss();
      this.showAlert('Registro exitoso', '¡Tu cuenta ha sido creada! Por favor inicia sesión.');
      this.isLogin = true; // Cambiar a la vista de inicio de sesión
    } catch (error: any) {
      await loading.dismiss();
      this.showAlert('Error en el registro', error.message || 'No se pudo crear la cuenta. Intenta de nuevo.');
    }
  }

  async showAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK']
    });
    
    await alert.present();
  }

  toggleAuthMode() {
    this.isLogin = !this.isLogin;
  }
}

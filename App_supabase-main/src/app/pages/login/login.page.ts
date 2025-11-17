import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  IonContent, IonHeader, IonTitle, IonToolbar,
  IonInput, IonItem, IonButton, IonLabel, IonList, IonText, IonSpinner
} from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { SupabaseService } from '../../core/supabase.service';

@Component({
  standalone: true,
  selector: 'app-login',
  templateUrl: './login.page.html',
  imports: [
    CommonModule, ReactiveFormsModule,
    IonContent, IonHeader, IonTitle, IonToolbar,
    IonInput, IonItem, IonButton, IonLabel, IonList, IonText, IonSpinner
  ]
})
export class LoginPage {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private supa = inject(SupabaseService);

  loading = signal(false);
  errorMsg = signal<string | null>(null);
  infoMsg = signal<string | null>(null);

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  async onLogin() {
    this.resetMessages();
    if (this.form.invalid) return;
    this.loading.set(true);
    const { email, password } = this.form.value;

    try {
      await this.supa.signIn(email!, password!);
      await this.router.navigateByUrl('/home', { replaceUrl: true });
    } catch (err: any) {
      this.errorMsg.set(err.message ?? 'Error al iniciar sesión');
    } finally {
      this.loading.set(false);
    }
  }

  async onRegister() {
    this.resetMessages();
    if (this.form.invalid) return;
    this.loading.set(true);
    const { email, password } = this.form.value;

    try {
      await this.supa.signUp(email!, password!);
      this.infoMsg.set('Cuenta creada. Verifica tu correo electrónico.');
    } catch (err: any) {
      this.errorMsg.set(err.message ?? 'Error al registrar usuario');
    } finally {
      this.loading.set(false);
    }
  }

  private resetMessages() {
    this.errorMsg.set(null);
    this.infoMsg.set(null);
  }



}


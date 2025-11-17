import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';

import { LoginPage } from './login.page';

@NgModule({
  declarations: [LoginPage],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule.forRoot(),
    RouterModule.forChild([
      {
        path: '',
        component: LoginPage
      }
    ])
  ]
})
export class LoginPageModule {}

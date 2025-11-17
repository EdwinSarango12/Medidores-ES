import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';

import { ProfilePage } from './profile.page';

@NgModule({
  declarations: [ProfilePage],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule.forRoot(),
    RouterModule.forChild([
      {
        path: '',
        component: ProfilePage
      }
    ])
  ]
})
export class ProfilePageModule {}

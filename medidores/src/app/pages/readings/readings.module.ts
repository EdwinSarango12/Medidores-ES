import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';

import { ReadingsPage } from './readings.page';
import { IonicSlides } from '@ionic/angular';

@NgModule({
  declarations: [ReadingsPage],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule.forRoot(),
    RouterModule.forChild([
      {
        path: '',
        component: ReadingsPage
      }
    ])
  ]
})
export class ReadingsPageModule {}

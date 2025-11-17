import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';

import { NewReadingPage } from './new-reading.page';

@NgModule({
  declarations: [NewReadingPage],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule.forRoot(),
    RouterModule.forChild([
      {
        path: '',
        component: NewReadingPage
      }
    ])
  ]
})
export class NewReadingPageModule {}

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { NuevaLecturaPageRoutingModule } from './nueva-lectura-routing.module';

import { NuevaLecturaPage } from './nueva-lectura.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    NuevaLecturaPageRoutingModule
  ],
  declarations: [NuevaLecturaPage]
})
export class NuevaLecturaPageModule {}

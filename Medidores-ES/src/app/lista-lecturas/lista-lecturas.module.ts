import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ListaLecturasPageRoutingModule } from './lista-lecturas-routing.module';

import { ListaLecturasPage } from './lista-lecturas.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ListaLecturasPageRoutingModule
  ],
  declarations: [ListaLecturasPage]
})
export class ListaLecturasPageModule {}

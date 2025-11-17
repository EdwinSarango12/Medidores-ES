import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ListaLecturasPage } from './lista-lecturas.page';

const routes: Routes = [
  {
    path: '',
    component: ListaLecturasPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ListaLecturasPageRoutingModule {}

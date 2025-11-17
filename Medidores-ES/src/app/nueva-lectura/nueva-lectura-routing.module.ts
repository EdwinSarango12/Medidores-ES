import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { NuevaLecturaPage } from './nueva-lectura.page';

const routes: Routes = [
  {
    path: '',
    component: NuevaLecturaPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class NuevaLecturaPageRoutingModule {}

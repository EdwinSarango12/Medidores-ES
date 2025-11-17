import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';

const routes: Routes = [
  {
    path: 'home',
    loadChildren: () => import('./home/home.module').then(m => m.HomePageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'login',
    loadChildren: () => import('./pages/login/login.module').then(m => m.LoginPageModule)
  },
  {
    path: 'readings',
    loadChildren: () => import('./pages/readings/readings.module').then(m => m.ReadingsPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'new-reading',
    loadChildren: () => import('./pages/new-reading/new-reading.module').then(m => m.NewReadingPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'profile',
    loadChildren: () => import('./pages/profile/profile.module').then(m => m.ProfilePageModule),
    canActivate: [AuthGuard]
  },
  // Ruta de administración comentada temporalmente
  // {
  //   path: 'admin',
  //   loadChildren: () => import('./pages/admin/admin.module').then(m => m.AdminPageModule),
  //   canActivate: [AuthGuard, AdminGuard]
  // },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: 'login',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { 
      preloadingStrategy: PreloadAllModules,
      onSameUrlNavigation: 'reload'
    })
  ],
  exports: [RouterModule],
  providers: [AuthGuard]
})
export class AppRoutingModule { }

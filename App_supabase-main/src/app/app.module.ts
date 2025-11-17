import { importProvidersFrom } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter } from '@angular/router';
import { IonicRouteStrategy } from '@ionic/angular/common';
import { AppComponent } from './app.component';
import { routes } from './app.routes';
import { provideHttpClient } from '@angular/common/http';
import { IonicModule } from '@ionic/angular';
import { provideIonicAngular } from '@ionic/angular/standalone';

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideRouter(routes),
    provideHttpClient(),
    provideIonicAngular(),
    importProvidersFrom(IonicModule.forRoot({}))
  ]
}).catch(err => console.log(err));

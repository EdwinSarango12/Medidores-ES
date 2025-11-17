import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';

// Manejar errores globales del Navigator LockManager
window.addEventListener('error', (event: ErrorEvent) => {
  if (event.error && event.error.name === 'NavigatorLockAcquireTimeoutError') {
    console.warn('Navigator LockManager error caught and ignored:', event.error);
    event.preventDefault();
  }
});

// Manejar promesas rechazadas no capturadas
window.addEventListener('unhandledrejection', (event: PromiseRejectionEvent) => {
  if (event.reason && event.reason.name === 'NavigatorLockAcquireTimeoutError') {
    console.warn('Navigator LockManager promise rejection caught and ignored:', event.reason);
    event.preventDefault();
  }
});

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => {
    console.error('Error bootstrapping app:', err);
  });

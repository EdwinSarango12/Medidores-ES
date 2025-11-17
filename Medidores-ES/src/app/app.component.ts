import { Component, OnInit } from '@angular/core';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent implements OnInit {
  constructor(private authService: AuthService) {}

  ngOnInit() {
    // Inicializar el usuario al cargar la aplicación de forma asíncrona
    // Usar setTimeout para no bloquear la renderización inicial
    setTimeout(() => {
      this.authService.loadUser().catch(err => {
        console.error('Error loading user in app component:', err);
      });
    }, 0);
  }
}

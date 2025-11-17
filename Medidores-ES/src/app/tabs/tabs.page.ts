import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss'],
  standalone: false,
})
export class TabsPage implements OnInit {
  isAdmin: boolean = false;

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.isAdmin = this.authService.isAdmin();
  }
}

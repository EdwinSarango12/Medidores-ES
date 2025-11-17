import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // ✅ <--- agrega esto
import {
  IonContent, IonHeader, IonTitle, IonToolbar, IonButton,
  IonText, IonList, IonItem, IonInput, IonFooter, IonLabel
} from '@ionic/angular/standalone';
import { SupabaseService } from '../../core/supabase.service';

@Component({
  standalone: true,
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  imports: [
    CommonModule,
    FormsModule, // <--- y aquí lo incluyes
    IonContent, IonHeader, IonTitle, IonToolbar,
    IonButton, IonText, IonList, IonItem, IonInput, IonFooter,
    IonLabel // Add IonLabel to the imports array
  ]
})
export class HomePage implements OnInit, OnDestroy {
  private supa = inject(SupabaseService);
  messages: any[] = [];
  newMessage = '';
  private channelSub: any;

  async ngOnInit() {
    await this.loadMessages();

    // Escuchar mensajes nuevos
    this.channelSub = this.supa.listenToMessages((newMsg) => {
      this.messages.push(newMsg);
    });
  }

  ngOnDestroy() {
    if (this.channelSub) this.supa.client.removeChannel(this.channelSub);
  }

  async loadMessages() {
    try {
      this.messages = await this.supa.getMessages();
    } catch (e) {
      console.error('Error cargando mensajes', e);
    }
  }

  async sendMessage() {
    if (!this.newMessage.trim()) return;
    try {
      const user = await this.supa.getUser();
      const autor = user?.email || 'Anónimo';
      
      await this.supa.addMessage({
        content: this.newMessage,
        autor: autor,
        created_at: new Date().toISOString()
      });
      
      this.newMessage = '';
    } catch (e) {
      console.error('Error enviando mensaje', e);
    }
  }

  async logout() {
    await this.supa.signOut();
    location.href = '/';
  }
}
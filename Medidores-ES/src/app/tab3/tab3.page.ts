import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { LecturasService, Lectura } from '../services/lecturas.service';
import { Router } from '@angular/router';
import { ToastController, LoadingController } from '@ionic/angular';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],
  standalone: false,
})
export class Tab3Page implements OnInit, AfterViewInit {
  @ViewChild('consumoChart', { static: false }) consumoChartRef!: ElementRef;
  @ViewChild('barrasChart', { static: false }) barrasChartRef!: ElementRef;
  
  user: any = null;
  lecturas: Lectura[] = [];
  consumoChart: any;
  barrasChart: any;
  consumoTotal: number = 0;
  consumoPromedio: number = 0;

  constructor(
    private authService: AuthService,
    private lecturasService: LecturasService,
    private router: Router,
    private toastController: ToastController,
    private loadingController: LoadingController
  ) {}

  async ngOnInit() {
    this.user = this.authService.getCurrentUser();
    await this.cargarDatos();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.crearGraficos();
    }, 500);
  }

  async ionViewWillEnter() {
    await this.cargarDatos();
    setTimeout(() => {
      this.actualizarGraficos();
    }, 300);
  }

  async cargarDatos() {
    try {
      this.lecturas = await this.lecturasService.getLecturas();
      this.calcularConsumo();
    } catch (error: any) {
      console.error('Error al cargar datos:', error);
    }
  }

  calcularConsumo() {
    if (this.lecturas.length === 0) {
      this.consumoTotal = 0;
      this.consumoPromedio = 0;
      return;
    }

    // Ordenar lecturas por fecha
    const lecturasOrdenadas = [...this.lecturas].sort((a, b) => {
      const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
      const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
      return dateA - dateB;
    });

    // Calcular consumo total (diferencia entre última y primera lectura)
    if (lecturasOrdenadas.length > 1) {
      const primera = lecturasOrdenadas[0].valor_medidor;
      const ultima = lecturasOrdenadas[lecturasOrdenadas.length - 1].valor_medidor;
      this.consumoTotal = ultima - primera;
    } else {
      this.consumoTotal = 0;
    }

    // Calcular consumo promedio
    if (lecturasOrdenadas.length > 1) {
      let sumaDiferencias = 0;
      for (let i = 1; i < lecturasOrdenadas.length; i++) {
        sumaDiferencias += lecturasOrdenadas[i].valor_medidor - lecturasOrdenadas[i - 1].valor_medidor;
      }
      this.consumoPromedio = sumaDiferencias / (lecturasOrdenadas.length - 1);
    } else {
      this.consumoPromedio = 0;
    }
  }

  crearGraficos() {
    this.crearGraficoConsumo();
    this.crearGraficoBarras();
  }

  crearGraficoConsumo() {
    if (!this.consumoChartRef) return;

    const ctx = this.consumoChartRef.nativeElement.getContext('2d');
    
    if (this.consumoChart) {
      this.consumoChart.destroy();
    }

    const porcentaje = this.lecturas.length > 0 ? Math.min(100, (this.consumoTotal / 1000) * 100) : 0;

    this.consumoChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Consumo', 'Restante'],
        datasets: [{
          data: [porcentaje, 100 - porcentaje],
          backgroundColor: [
            'rgba(54, 162, 235, 0.8)',
            'rgba(200, 200, 200, 0.3)'
          ],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: (context: any) => {
                return `Consumo: ${this.consumoTotal.toFixed(2)} m³`;
              }
            }
          }
        }
      }
    });
  }

  crearGraficoBarras() {
    if (!this.barrasChartRef) return;

    const ctx = this.barrasChartRef.nativeElement.getContext('2d');
    
    if (this.barrasChart) {
      this.barrasChart.destroy();
    }

    // Agrupar lecturas por mes
    const lecturasPorMes: { [key: string]: number } = {};
    
    this.lecturas.forEach(lectura => {
      if (lectura.created_at) {
        const fecha = new Date(lectura.created_at);
        const mes = `${fecha.getMonth() + 1}/${fecha.getFullYear()}`;
        lecturasPorMes[mes] = (lecturasPorMes[mes] || 0) + 1;
      }
    });

    const meses = Object.keys(lecturasPorMes).sort();
    const cantidades = meses.map(mes => lecturasPorMes[mes]);

    this.barrasChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: meses.length > 0 ? meses : ['Sin datos'],
        datasets: [{
          label: 'Cantidad de Lecturas',
          data: cantidades.length > 0 ? cantidades : [0],
          backgroundColor: 'rgba(54, 162, 235, 0.6)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1
            }
          }
        },
        plugins: {
          legend: {
            display: false
          }
        }
      }
    });
  }

  actualizarGraficos() {
    this.calcularConsumo();
    this.crearGraficos();
  }

  async cerrarSesion() {
    try {
      await this.authService.signOut();
      this.showToast('Sesión cerrada exitosamente', 'success');
      this.router.navigate(['/login']);
    } catch (error: any) {
      this.showToast('Error al cerrar sesión', 'danger');
    }
  }

  async showToast(message: string, color: string = 'primary') {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      color,
      position: 'bottom'
    });
    await toast.present();
  }
}

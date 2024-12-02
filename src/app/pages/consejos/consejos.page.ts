import { Component, OnInit } from '@angular/core';
import { ProfileService } from '../../services/profile.service';
import { NutritionService } from '../../services/nutrition.service';
import { LoadingController } from '@ionic/angular';

@Component({
  selector: 'app-consejos',
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/home"></ion-back-button>
        </ion-buttons>
        <ion-title>
          <span class="gradient-text">Consejos Nutricionales</span>
        </ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="content-container">
      <!-- Plan Calórico -->
      <div class="calories-card" *ngIf="calorias">
        <div class="calories-content">
          <ion-icon name="flame-outline"></ion-icon>
          <div class="calories-info">
            <h3>Tu Plan Calórico</h3>
            <p class="calories-number">{{ calorias }} kcal</p>
            <p class="calories-label">calorías diarias recomendadas</p>
          </div>
        </div>
      </div>

      <!-- Lista de Consejos -->
      <div class="advice-container" *ngIf="consejos.length > 0">
        <div class="advice-card" *ngFor="let consejo of consejos">
          <ion-icon name="leaf-outline"></ion-icon>
          <p>{{ consejo }}</p>
        </div>
      </div>

      <!-- Estado sin perfil -->
      <div *ngIf="!consejos.length" class="empty-state">
        <ion-icon name="person-circle-outline"></ion-icon>
        <h3>Perfil Incompleto</h3>
        <p>Completa tu perfil para recibir consejos personalizados</p>
        <ion-button routerLink="/profile" class="profile-button">
          <ion-icon name="create-outline" slot="start"></ion-icon>
          Completar Perfil
        </ion-button>
      </div>
    </ion-content>
  `,
  styles: [`
    .content-container {
      --background: #f5f5f5;
      --padding-start: 16px;
      --padding-end: 16px;
    }

    .gradient-text {
      font-weight: bold;
    }

    .calories-card {
      background: linear-gradient(135deg, #4CAF50, #2E7D32);
      border-radius: 16px;
      padding: 20px;
      margin: 16px 0;
      color: white;
      box-shadow: 0 4px 12px rgba(76, 175, 80, 0.2);
    }

    .calories-content {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .calories-content ion-icon {
      font-size: 32px;
    }

    .calories-info h3 {
      margin: 0;
      font-size: 1.1em;
      font-weight: 500;
      opacity: 0.9;
    }

    .calories-number {
      margin: 8px 0 4px;
      font-size: 1.8em;
      font-weight: bold;
    }

    .calories-label {
      margin: 0;
      font-size: 0.9em;
      opacity: 0.8;
    }

    .advice-container {
      display: flex;
      flex-direction: column;
      gap: 12px;
      padding: 8px 0;
    }

    .advice-card {
      background: white;
      border-radius: 12px;
      padding: 16px;
      display: flex;
      align-items: center;
      gap: 16px;
      box-shadow: 0 2px 6px rgba(0,0,0,0.06);
    }

    .advice-card ion-icon {
      font-size: 24px;
      color: #4CAF50;
      flex-shrink: 0;
    }

    .advice-card p {
      margin: 0;
      color: #333;
      font-size: 0.95em;
      line-height: 1.4;
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 40px 20px;
      height: 60vh;
    }

    .empty-state ion-icon {
      font-size: 64px;
      color: #4CAF50;
      margin-bottom: 16px;
    }

    .empty-state h3 {
      margin: 0 0 8px;
      color: #333;
      font-size: 1.2em;
    }

    .empty-state p {
      margin: 0 0 24px;
      color: #666;
      font-size: 0.95em;
    }

    .profile-button {
      --background: #4CAF50;
      --border-radius: 12px;
      --box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
    }
  `]
})
export class ConsejosPage implements OnInit {
  consejos: string[] = [];
  calorias: number = 0;

  constructor(
    private profileService: ProfileService,
    private nutritionService: NutritionService,
    private loadingCtrl: LoadingController
  ) {}

  ngOnInit() {
    this.loadConsejosNutricionales();
  }

  async loadConsejosNutricionales() {
    const loading = await this.loadingCtrl.create({
      message: 'Cargando consejos...',
      cssClass: 'custom-loading'
    });
    await loading.present();

    this.profileService.getUserProfile().subscribe({
      next: (profile) => {
        if (profile) {
          this.calorias = this.nutritionService.calcularCaloriasObjetivo(profile);
          this.consejos = this.nutritionService.getConsejos(profile);
        }
        loading.dismiss();
      },
      error: (error) => {
        console.error('Error loading profile:', error);
        loading.dismiss();
      }
    });
  }
}
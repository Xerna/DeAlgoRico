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
        <ion-title>Consejos Nutricionales</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <ion-card *ngIf="calorias">
        <ion-card-header>
          <ion-card-title>Tu Plan Calórico</ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <h2>{{ calorias }} calorías diarias</h2>
        </ion-card-content>
      </ion-card>

      <ion-list>
        <ion-item *ngFor="let consejo of consejos">
          <ion-icon name="nutrition" slot="start" color="primary"></ion-icon>
          <ion-label class="ion-text-wrap">{{ consejo }}</ion-label>
        </ion-item>
      </ion-list>

      <div *ngIf="!consejos.length" class="ion-text-center ion-padding">
        <p>Por favor, completa tu perfil para recibir consejos personalizados.</p>
        <ion-button routerLink="/profile">Ir al Perfil</ion-button>
      </div>
    </ion-content>
  `
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
      message: 'Cargando consejos...'
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
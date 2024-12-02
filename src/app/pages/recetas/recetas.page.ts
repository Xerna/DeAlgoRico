import { Component, OnInit } from '@angular/core';
import { SpoonacularService } from '../../services/spoonacular.service';
import { DespensaService } from '../../services/despensa.service';
import { LoadingController } from '@ionic/angular';

@Component({
  selector: 'app-recetas',
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/home"></ion-back-button>
        </ion-buttons>
        <ion-title>Recetas Sugeridas</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <ion-refresher slot="fixed" (ionRefresh)="doRefresh($event)">
        <ion-refresher-content></ion-refresher-content>
      </ion-refresher>

      <div *ngIf="recetas.length === 0" class="ion-text-center ion-padding">
        <p>No se encontraron recetas con tus ingredientes actuales</p>
      </div>

      <ion-list>
        <ion-card *ngFor="let receta of recetas">
          <img [src]="receta.image" [alt]="receta.title"/>
          <ion-card-header>
            <ion-card-title>{{ receta.title }}</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <p><strong>Ingredientes que tienes:</strong></p>
            <ion-chip *ngFor="let ing of receta.usedIngredients" color="success">
              {{ ing.name }}
            </ion-chip>
            
            <p><strong>Ingredientes que necesitas:</strong></p>
            <ion-chip *ngFor="let ing of receta.missedIngredients" color="warning">
              {{ ing.name }}
            </ion-chip>
          </ion-card-content>
        </ion-card>
      </ion-list>
    </ion-content>
  `
})
export class RecetasPage implements OnInit {
  recetas: any[] = [];

  constructor(
    private spoonacularService: SpoonacularService,
    private despensaService: DespensaService,
    private loadingCtrl: LoadingController
  ) {}

  ngOnInit() {
    this.cargarRecetas();
  }

  async cargarRecetas() {
    const loading = await this.loadingCtrl.create({
      message: 'Buscando recetas...'
    });
    await loading.present();

    try {
      // Primero obtenemos los ingredientes de la despensa
      this.despensaService.getDespensa().subscribe({
        next: async (items) => {
          if (items.length > 0) {
            // Extraemos solo los nombres de los ingredientes
            const ingredientes = items.map(item => item.nombre_ingrediente);
            
            // Buscamos recetas con esos ingredientes
            this.spoonacularService.getRecipesByIngredients(ingredientes)
              .subscribe({
                next: (recetas) => {
                  this.recetas = recetas;
                  loading.dismiss();
                },
                error: (error) => {
                  console.error('Error al obtener recetas:', error);
                  loading.dismiss();
                }
              });
          } else {
            this.recetas = [];
            loading.dismiss();
          }
        },
        error: (error) => {
          console.error('Error al obtener ingredientes:', error);
          loading.dismiss();
        }
      });
    } catch (error) {
      console.error('Error:', error);
      loading.dismiss();
    }
  }

  async doRefresh(event: any) {
    await this.cargarRecetas();
    event.target.complete();
  }
}
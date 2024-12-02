import { Component, OnInit } from '@angular/core';
import { SpoonacularService } from '../../services/spoonacular.service';
import { DespensaService } from '../../services/despensa.service';
import { LoadingController, AlertController, ToastController } from '@ionic/angular';
import { MealPlanService } from '../../services/meal-plan.service';
import { ShoppingListService } from '../../services/shopping-list.service';

interface RecipeIngredient {
  name: string;
  [key: string]: any; // Para otras propiedades que pueda tener
}

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

            <ion-button expand="block" (click)="addToMealPlan(receta)" class="ion-margin-top">
              Añadir al Plan Semanal
            </ion-button>
          </ion-card-content>
        </ion-card>
      </ion-list>
    </ion-content>
  `
})
export class RecetasPage implements OnInit {
  recetas: any[] = [];
  weekDays = [
    { value: 'Lunes', label: 'Lunes' },
    { value: 'Martes', label: 'Martes' },
    { value: 'Miércoles', label: 'Miércoles' },
    { value: 'Jueves', label: 'Jueves' },
    { value: 'Viernes', label: 'Viernes' },
    { value: 'Sábado', label: 'Sábado' },
    { value: 'Domingo', label: 'Domingo' }
  ];

  constructor(
    private spoonacularService: SpoonacularService,
    private despensaService: DespensaService,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController,
    private mealPlanService: MealPlanService,
    private shoppingListService: ShoppingListService,
    private toastCtrl: ToastController
  ) {}

  ngOnInit() {
    this.cargarRecetas();
  }

  async addToMealPlan(receta: any) {
    const alert = await this.alertCtrl.create({
      // ... configuración del alert ...
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Agregar',
          handler: async (day) => {
            if (day) {
              const loading = await this.loadingCtrl.create({
                message: 'Procesando...'
              });
              await loading.present();

              try {
                await this.mealPlanService.addToMealPlan(
                  receta.id.toString(),
                  receta.title,
                  receta.image,
                  day
                );

                await Promise.all(
                  (receta.missedIngredients as RecipeIngredient[]).map(ing => 
                    this.shoppingListService.addIngredient(ing.name)
                  )
                );
                
                loading.dismiss();
                const successAlert = await this.alertCtrl.create({
                  header: 'Éxito',
                  message: 'Receta añadida al plan semanal y los ingredientes faltantes a la lista de compras',
                  buttons: ['OK']
                });
                await successAlert.present();
              } catch (error) {
                console.error('Error:', error);
                loading.dismiss();
                const errorAlert = await this.alertCtrl.create({
                  header: 'Error',
                  message: 'No se pudo completar la operación',
                  buttons: ['OK']
                });
                await errorAlert.present();
              }
            }
          }
        }
      ]
    });

    await alert.present();
  }


  async cargarRecetas() {
    const loading = await this.loadingCtrl.create({
      message: 'Buscando recetas...'
    });
    await loading.present();
    try {
      this.despensaService.getDespensa().subscribe({
        next: async (items) => {
          if (items.length > 0) {
            const ingredientes = items.map(item => item.nombre_ingrediente);
            
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
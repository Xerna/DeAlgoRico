import { Component, OnInit } from '@angular/core';
import { SpoonacularService } from '../../services/spoonacular.service';
import { DespensaService } from '../../services/despensa.service';
import { LoadingController, AlertController, ToastController } from '@ionic/angular';
import { MealPlanService } from '../../services/meal-plan.service';
import { ShoppingListService } from '../../services/shopping-list.service';

interface RecipeIngredient {
  name: string;
  [key: string]: any;
}

@Component({
  selector: 'app-recetas',
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/home"></ion-back-button>
        </ion-buttons>
        <ion-title>
          <span class="gradient-text">Recetas Sugeridas</span>
        </ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <ion-refresher slot="fixed" (ionRefresh)="doRefresh($event)">
        <ion-refresher-content></ion-refresher-content>
      </ion-refresher>

      <!-- Estado vacío -->
      <div *ngIf="recetas.length === 0" class="empty-state">
        <ion-icon name="restaurant-outline"></ion-icon>
        <h3>No hay recetas disponibles</h3>
        <p>Agrega ingredientes a tu despensa para obtener sugerencias</p>
      </div>

      <!-- Lista de recetas -->
      <div class="recipes-container" *ngIf="recetas.length > 0">
        <ion-card *ngFor="let receta of recetas" class="recipe-card">
          <img [src]="receta.image" [alt]="receta.title"/>
          <ion-card-header>
            <ion-card-title>{{ receta.title }}</ion-card-title>
          </ion-card-header>

          <ion-card-content>
            <p><strong>Ingredientes disponibles:</strong></p>
            <div class="chips-wrapper">
              <ion-chip *ngFor="let ing of receta.usedIngredients" class="success-chip">
                <ion-icon name="checkmark-circle"></ion-icon>
                {{ ing.name }}
              </ion-chip>
            </div>

            <p><strong>Ingredientes necesarios:</strong></p>
            <div class="chips-wrapper">
              <ion-chip *ngFor="let ing of receta.missedIngredients" class="warning-chip">
                <ion-icon name="add-circle"></ion-icon>
                {{ ing.name }}
              </ion-chip>
            </div>

            <ion-button expand="block" (click)="addToMealPlan(receta)" class="add-button">
              <ion-icon name="calendar" slot="start"></ion-icon>
              Añadir al Plan Semanal
            </ion-button>
          </ion-card-content>
        </ion-card>
      </div>
    </ion-content>
  `,
  styles: [`
    .gradient-text {
      font-weight: bold;
    }

    .empty-state {
      text-align: center;
      padding: 2rem;
      margin-top: 2rem;
    }

    .empty-state ion-icon {
      font-size: 4rem;
      color: #4CAF50;
    }

    .recipes-container {
      padding: 1rem;
    }

    .recipe-card {
      margin-bottom: 1rem;
    }

    .recipe-card img {
      width: 100%;
      max-height: 200px;
      object-fit: cover;
    }

    .chips-wrapper {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      margin: 0.5rem 0 1rem 0;
    }

    .success-chip {
      --background: #E8F5E9;
      --color: #2E7D32;
    }

    .warning-chip {
      --background: #FFF3E0;
      --color: #F57C00;
    }

    .add-button {
      margin-top: 1rem;
    }

    ion-card-title {
      font-size: 1.2rem;
      font-weight: 600;
    }

    ion-card-content p {
      margin-top: 1rem;
      color: #666;
    }
  `]
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
      header: 'Seleccionar día',
      inputs: this.weekDays.map(day => ({
        name: 'day',
        type: 'radio',
        label: day.label,
        value: day.value
      })),
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
                message: 'Agregando receta...',
                cssClass: 'custom-loading'
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
                const toast = await this.toastCtrl.create({
                  message: 'Receta añadida al plan semanal',
                  duration: 2000,
                  color: 'success',
                  position: 'bottom'
                });
                await toast.present();
              } catch (error) {
                console.error('Error:', error);
                loading.dismiss();
                const toast = await this.toastCtrl.create({
                  message: 'Error al agregar la receta',
                  duration: 2000,
                  color: 'danger',
                  position: 'bottom'
                });
                await toast.present();
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
      message: 'Buscando recetas...',
      cssClass: 'custom-loading'
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
                  this.showError();
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
          this.showError();
        }
      });
    } catch (error) {
      console.error('Error:', error);
      loading.dismiss();
      this.showError();
    }
  }

  async showError() {
    const toast = await this.toastCtrl.create({
      message: 'Error al cargar las recetas',
      duration: 2000,
      color: 'danger',
      position: 'bottom'
    });
    await toast.present();
  }

  async doRefresh(event: any) {
    await this.cargarRecetas();
    event.target.complete();
  }
}
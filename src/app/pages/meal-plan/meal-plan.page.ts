import { Component, OnInit } from '@angular/core';
import { MealPlanService } from '../../services/meal-plan.service';
import { LoadingController, ToastController } from '@ionic/angular';

@Component({
  selector: 'app-meal-plan',
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/home"></ion-back-button>
        </ion-buttons>
        <ion-title>
          <span class="gradient-text">Mi Plan Semanal</span>
        </ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="content-container">
      <ion-refresher slot="fixed" (ionRefresh)="doRefresh($event)">
        <ion-refresher-content></ion-refresher-content>
      </ion-refresher>

      <!-- Estado vacío -->
      <div *ngIf="mealPlans.length === 0" class="empty-state">
        <ion-icon name="calendar-outline"></ion-icon>
        <h3>No hay recetas planificadas</h3>
        <p>Agrega recetas desde la sección de búsqueda</p>
      </div>

      <!-- Plan Semanal -->
      <div class="meal-plan-container" *ngIf="mealPlans.length > 0">
        <div class="day-card" *ngFor="let day of weekDays">
          <div class="day-header">
            <h3>{{ day.label }}</h3>
          </div>

          <div class="meals-list">
            <!-- Recetas del día -->
            <div class="meal-item" *ngFor="let meal of getMealsForDay(day.value)">
              <div class="meal-content">
                <ion-thumbnail>
                  <img [src]="meal.recipeImage" [alt]="meal.recipeTitle">
                </ion-thumbnail>
                <div class="meal-info">
                  <h4>{{ meal.recipeTitle }}</h4>
                </div>
                <ion-button fill="clear" color="danger" (click)="deleteMeal(meal.id)">
                  <ion-icon name="trash-outline"></ion-icon>
                </ion-button>
              </div>
            </div>

            <!-- Sin recetas -->
            <div class="no-meals" *ngIf="getMealsForDay(day.value).length === 0">
              <ion-icon name="restaurant-outline"></ion-icon>
              <p>Sin recetas planificadas</p>
            </div>
          </div>
        </div>
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

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 60vh;
      text-align: center;
      padding: 20px;
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
      margin: 0;
      color: #666;
    }

    .meal-plan-container {
      padding: 8px 0;
    }

    .day-card {
      background: white;
      border-radius: 12px;
      margin-bottom: 16px;
      overflow: hidden;
      box-shadow: 0 2px 6px rgba(0,0,0,0.06);
    }

    .day-header {
      background: #4CAF50;
      color: white;
      padding: 12px 16px;
    }

    .day-header h3 {
      margin: 0;
      font-size: 1em;
      font-weight: 500;
    }

    .meals-list {
      padding: 8px;
    }

    .meal-item {
      margin-bottom: 8px;
    }

    .meal-content {
      display: flex;
      align-items: center;
      padding: 8px;
      gap: 12px;
    }

    .meal-content ion-thumbnail {
      --size: 60px;
      --border-radius: 8px;
    }

    .meal-info {
      flex: 1;
    }

    .meal-info h4 {
      margin: 0;
      font-size: 0.95em;
      color: #333;
    }

    .no-meals {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 20px;
      color: #666;
      text-align: center;
    }

    .no-meals ion-icon {
      font-size: 24px;
      margin-bottom: 8px;
      opacity: 0.5;
    }

    .no-meals p {
      margin: 0;
      font-size: 0.9em;
    }
  `]
})
export class MealPlanPage implements OnInit {
  mealPlans: any[] = [];
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
    private mealPlanService: MealPlanService,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController
  ) {}

  ngOnInit() {
    this.loadMealPlans();
  }

  async loadMealPlans() {
    const loading = await this.loadingCtrl.create({
      message: 'Cargando plan semanal...',
      cssClass: 'custom-loading'
    });
    await loading.present();

    this.mealPlanService.getMealPlans().subscribe({
      next: (plans) => {
        this.mealPlans = plans;
        loading.dismiss();
      },
      error: (error) => {
        console.error('Error loading meal plans:', error);
        loading.dismiss();
      }
    });
  }

  async doRefresh(event: any) {
    try {
      await this.loadMealPlans();
    } finally {
      event.target.complete();
    }
  }

  getMealsForDay(day: string): any[] {
    return this.mealPlans.filter(meal => meal.assignedDate === day);
  }

  async deleteMeal(mealId: string) {
    const loading = await this.loadingCtrl.create({
      message: 'Eliminando receta...',
      cssClass: 'custom-loading'
    });
    await loading.present();

    try {
      await this.mealPlanService.deleteMealPlan(mealId);
      
      const toast = await this.toastCtrl.create({
        message: 'Receta eliminada del plan',
        duration: 2000,
        color: 'success',
        position: 'bottom'
      });
      await toast.present();
    } catch (error) {
      console.error('Error deleting meal:', error);
      const toast = await this.toastCtrl.create({
        message: 'Error al eliminar la receta',
        duration: 2000,
        color: 'danger',
        position: 'bottom'
      });
      await toast.present();
    } finally {
      await loading.dismiss();
    }
  }
}
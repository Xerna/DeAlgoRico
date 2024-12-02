import { Component, OnInit } from '@angular/core';
import { MealPlanService } from '../../services/meal-plan.service';
import { LoadingController , ToastController} from '@ionic/angular';

@Component({
  selector: 'app-meal-plan',
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/home"></ion-back-button>
        </ion-buttons>
        <ion-title>Mi Plan Semanal</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <ion-refresher slot="fixed" (ionRefresh)="doRefresh($event)">
        <ion-refresher-content></ion-refresher-content>
      </ion-refresher>

      <div *ngIf="mealPlans.length === 0" class="ion-text-center ion-padding">
        <p>No hay recetas planificadas para esta semana</p>
      </div>

      <ion-list>
        <ion-item-group *ngFor="let day of weekDays">
          <ion-item-divider sticky>
            <ion-label>{{ day.label }}</ion-label>
          </ion-item-divider>

          <ion-item *ngFor="let meal of getMealsForDay(day.value)">
            <ion-thumbnail slot="start">
              <img [src]="meal.recipeImage" [alt]="meal.recipeTitle">
            </ion-thumbnail>
            <ion-label>
              <h2>{{ meal.recipeTitle }}</h2>
            </ion-label>
            <ion-button slot="end" fill="clear" color="danger" (click)="deleteMeal(meal.id)">
              <ion-icon name="trash"></ion-icon>
            </ion-button>
          </ion-item>

          <ion-item *ngIf="getMealsForDay(day.value).length === 0">
            <ion-label color="medium">
              No hay recetas planificadas
            </ion-label>
          </ion-item>
        </ion-item-group>
      </ion-list>
    </ion-content>
  `
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
    private toastCtrl: ToastController  // Añade esta lí
  ) {}

  ngOnInit() {
    this.loadMealPlans();
  }

  async loadMealPlans() {
    const loading = await this.loadingCtrl.create({
      message: 'Cargando plan semanal...'
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
      message: 'Eliminando receta...'
    });
    await loading.present();
  
    try {
      await this.mealPlanService.deleteMealPlan(mealId);
      
      // Mostrar mensaje de éxito
      const toast = await this.toastCtrl.create({
        message: 'Receta eliminada del plan',
        duration: 2000,
        color: 'success'
      });
      await toast.present();
    } catch (error) {
      console.error('Error deleting meal:', error);
      // Mostrar mensaje de error
      const toast = await this.toastCtrl.create({
        message: 'Error al eliminar la receta',
        duration: 2000,
        color: 'danger'
      });
      await toast.present();
    } finally {
      await loading.dismiss();
    }
  }
}
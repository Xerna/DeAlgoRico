import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { MealPlanPage } from './meal-plan.page';
import { RouterModule } from '@angular/router';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    RouterModule.forChild([
      {
        path: '',
        component: MealPlanPage
      }
    ])
  ],
  declarations: [MealPlanPage]
})
export class MealPlanPageModule {}
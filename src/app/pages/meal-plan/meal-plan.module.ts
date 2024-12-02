import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule, Routes } from '@angular/router';
import { MealPlanPage } from './meal-plan.page';

const routes: Routes = [
  {
    path: '',
    component: MealPlanPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [MealPlanPage]
})
export class MealPlanPageModule {}
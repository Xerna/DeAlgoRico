import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

interface MealPlan {
  userId: string;
  recipeId: string;
  recipeTitle: string;
  recipeImage: string;
  assignedDate: string;
  createdAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class MealPlanService {
  constructor(
    private firestore: AngularFirestore,
    private auth: AngularFireAuth
  ) {}

  async addToMealPlan(recipeId: string, recipeTitle: string, recipeImage: string, assignedDate: string): Promise<void> {
    const user = await this.auth.currentUser;
    if (!user) throw new Error('No user logged in');

    const mealPlan: MealPlan = {
      userId: user.uid,
      recipeId: recipeId,
      recipeTitle: recipeTitle,
      recipeImage: recipeImage,
      assignedDate: assignedDate,
      createdAt: new Date()
    };

    return this.firestore.collection('meal_plans').add(mealPlan)
      .then(() => void 0)
      .catch(error => {
        console.error('Error adding to meal plan:', error);
        throw error;
      });
  }

  getMealPlans(): Observable<any[]> {
    return this.auth.authState.pipe(
      switchMap(user => {
        if (!user) return of([]);
        return this.firestore
          .collection('meal_plans', ref => 
            ref.where('userId', '==', user.uid)
            .orderBy('assignedDate', 'asc')
          )
          .valueChanges({ idField: 'id' });
      })
    );
  }

  async deleteMealPlan(id: string): Promise<void> {
    try {
      const user = await this.auth.currentUser;
      if (!user) throw new Error('No user logged in');

      await this.firestore.collection('meal_plans').doc(id).delete();
    } catch (error) {
      console.error('Error deleting meal plan:', error);
      throw error;
    }
  }
}
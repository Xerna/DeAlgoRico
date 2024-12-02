import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

export interface SavedRecipe {
  id?: string;
  id_usuario: string;
  id_receta: number;
  fecha_guardado?: Date;  // Agregamos fecha de guardado
}

@Injectable({
  providedIn: 'root'
})
export class SavedRecipesService {
  constructor(
    private firestore: AngularFirestore,
    private auth: AngularFireAuth
  ) {}

  async saveRecipe(recipeData: { id_receta: number }): Promise<any> {
    try {
      const user = await this.auth.currentUser;
      if (!user) throw new Error('No user logged in');

      // Verificar si la receta ya existe para este usuario
      const existingRecipe = await this.firestore
        .collection('recetas', ref => 
          ref.where('id_usuario', '==', user.uid)
             .where('id_receta', '==', recipeData.id_receta)
        )
        .get()
        .toPromise();

      if (existingRecipe && !existingRecipe.empty) {
        throw new Error('Esta receta ya está guardada');
      }

      // Si no existe, guardar la nueva receta
      return this.firestore.collection('recetas').add({
        id_usuario: user.uid,
        id_receta: recipeData.id_receta,
        fecha_guardado: new Date()
      });
    } catch (error) {
      console.error('Error in saveRecipe:', error);
      throw error;
    }
  }

  getSavedRecipes(): Observable<SavedRecipe[]> {
    return this.auth.authState.pipe(
      switchMap(user => {
        if (!user) return of([]);
        return this.firestore
          .collection<SavedRecipe>('recetas', ref => 
            ref.where('id_usuario', '==', user.uid)
               .orderBy('fecha_guardado', 'desc'))  // Ordenar por fecha de guardado
          .valueChanges({ idField: 'id' });
      })
    );
  }

  async deleteRecipe(id: string): Promise<void> {
    try {
      const user = await this.auth.currentUser;
      if (!user) throw new Error('No user logged in');

      return this.firestore.collection('recetas').doc(id).delete();
    } catch (error) {
      console.error('Error in deleteRecipe:', error);
      throw error;
    }
  }
}
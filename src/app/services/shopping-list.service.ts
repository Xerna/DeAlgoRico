import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

export interface ShoppingListItem {
  id?: string;
  userId: string;
  ingredientName: string;
  added: Date;
  completed: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ShoppingListService {
  constructor(
    private firestore: AngularFirestore,
    private auth: AngularFireAuth
  ) {}

  // Corregimos el tipo de retorno para manejar la Promise correctamente
  async addIngredient(ingredientName: string): Promise<any> {
    const user = await this.auth.currentUser;
    if (!user) throw new Error('No user logged in');

    const ingredientData = {
      userId: user.uid,
      ingredientName,
      added: new Date(),
      completed: false
    };

    try {
      return await this.firestore.collection('lista_de_compras').add(ingredientData);
    } catch (error) {
      console.error('Error adding ingredient:', error);
      throw error;
    }
  }

  // Los demás métodos permanecen igual
  getShoppingList(): Observable<ShoppingListItem[]> {
    return this.auth.authState.pipe(
      switchMap(user => {
        if (!user) return of([]);
        return this.firestore
          .collection<ShoppingListItem>('lista_de_compras', ref =>
            ref.where('userId', '==', user.uid)
               .orderBy('added', 'desc'))
          .valueChanges({ idField: 'id' });
      })
    );
  }

  async toggleComplete(itemId: string, completed: boolean): Promise<void> {
    return this.firestore
      .collection('lista_de_compras')
      .doc(itemId)
      .update({ completed });
  }

  async deleteItem(itemId: string): Promise<void> {
    return this.firestore
      .collection('lista_de_compras')
      .doc(itemId)
      .delete();
  }
}
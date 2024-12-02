import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

export interface ShoppingItem {
  id?: string;
  id_usuario: string;
  nombre_ingrediente: string;
  id_receta: number;
  titulo_receta: string;
  cantidad: string;
  completado: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ShoppingListService {
  constructor(
    private firestore: AngularFirestore,
    private auth: AngularFireAuth
  ) {}

  async addItem(item: Partial<ShoppingItem>): Promise<any> {
    const user = await this.auth.currentUser;
    if (!user) throw new Error('No user logged in');

    return this.firestore.collection('lista_compras').add({
      ...item,
      id_usuario: user.uid,
      completado: false
    });
  }

  getShoppingList(): Observable<ShoppingItem[]> {
    return this.auth.authState.pipe(
      switchMap(user => {
        if (!user) return of([]);
        return this.firestore
          .collection<ShoppingItem>('lista_compras', ref => 
            ref.where('id_usuario', '==', user.uid)
               .orderBy('completado')
               .orderBy('titulo_receta'))
          .valueChanges({ idField: 'id' });
      })
    );
  }

  async toggleItemStatus(id: string, completado: boolean): Promise<void> {
    return this.firestore
      .collection('lista_compras')
      .doc(id)
      .update({ completado });
  }

  async deleteItem(id: string): Promise<void> {
    return this.firestore
      .collection('lista_compras')
      .doc(id)
      .delete();
  }

  async clearCompletedItems(): Promise<void> {
    const user = await this.auth.currentUser;
    if (!user) throw new Error('No user logged in');

    const completedItems = await this.firestore
      .collection<ShoppingItem>('lista_compras', ref => 
        ref.where('id_usuario', '==', user.uid)
           .where('completado', '==', true))
      .get()
      .toPromise();

    const batch = this.firestore.firestore.batch();
    completedItems?.forEach(doc => {
      batch.delete(doc.ref);
    });

    return batch.commit();
  }
}
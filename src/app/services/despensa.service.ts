//despensa.service.ts
import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

export interface DespensaItem {
  id?: string;
  id_usuario: string;
  nombre_ingrediente: string;
  fecha_caducidad: any;
  fecha_registro: any;
}

@Injectable({
  providedIn: 'root'
})
export class DespensaService {
  constructor(
    private firestore: AngularFirestore,
    private auth: AngularFireAuth
  ) {}

  async addIngrediente(nombre: string, fechaCaducidad: Date): Promise<any> {
    const user = await this.auth.currentUser;
    if (!user) throw new Error('No user logged in');

    return this.firestore.collection('despensas').add({
      id_usuario: user.uid,
      nombre_ingrediente: nombre,
      fecha_caducidad: fechaCaducidad,
      fecha_registro: new Date()
    });
  }

  getDespensa(): Observable<DespensaItem[]> {
    return this.auth.authState.pipe(
      switchMap(user => {
        if (!user) return of([]);
        return this.firestore
          .collection<DespensaItem>('despensas', ref => 
            ref.where('id_usuario', '==', user.uid)
               .orderBy('fecha_caducidad', 'asc'))
          .valueChanges({ idField: 'id' });
      })
    );
  }

  async deleteIngrediente(id: string): Promise<any> {
    return this.firestore.collection('despensas').doc(id).delete();
  }
}
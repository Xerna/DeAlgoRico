//src/app/services/profile.service.ts
import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { UserProfile } from '../models/user-profile.interface';
import { Observable, of } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  constructor(
    private firestore: AngularFirestore,
    private auth: AngularFireAuth
  ) {}

  // Guardar perfil del usuario
  async saveUserProfile(profileData: Partial<UserProfile>): Promise<void> {
    const user = await this.auth.currentUser;
    if (!user) throw new Error('No user logged in');

    const userProfile = {
      id_usuario: user.uid,
      ...profileData,
      fecha_registro: new Date()
    };

    return this.firestore
      .collection('perfiles_usuarios')
      .doc(user.uid)
      .set(userProfile, { merge: true });
  }

  // Obtener perfil del usuario
  getUserProfile(): Observable<UserProfile | null> {
    return this.auth.authState.pipe(
      switchMap(user => {
        if (!user) return of(null);
        return this.firestore
          .collection('perfiles_usuarios')
          .doc<UserProfile>(user.uid)
          .valueChanges()
          .pipe(
            map(profile => profile || null)
          );
      })
    );
  }

  // Actualizar perfil del usuario
  async updateUserProfile(profileData: Partial<UserProfile>): Promise<void> {
    const user = await this.auth.currentUser;
    if (!user) throw new Error('No user logged in');

    return this.firestore
      .collection('perfiles_usuarios')
      .doc(user.uid)
      .update(profileData);
  }
}
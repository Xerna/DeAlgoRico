import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import firebase from 'firebase/compat/app';
import { Router } from '@angular/router';
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';
import { Platform } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(
    private afAuth: AngularFireAuth,
    private router: Router,
    private platform: Platform
  ) {
    // Inicializar Google Auth solo en Android
    if (this.platform.is('android')) {
      GoogleAuth.initialize({
        clientId: '866279976542-f1vip3bh5s8r1m7nbnjsmts2kmrkdrip.apps.googleusercontent.com',
        scopes: ['profile', 'email'],
      });
    }
  }

  // Registro con email
  async register(email: string, password: string) {
    try {
      await this.afAuth.createUserWithEmailAndPassword(email, password);
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  }

  // Login con email
  async login(email: string, password: string) {
    try {
      await this.afAuth.signInWithEmailAndPassword(email, password);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  // Login con Google
  async loginWithGoogle() {
    try {
      console.log('Iniciando proceso de login con Google...');
      let credential;

      if (this.platform.is('android')) {
        // Versión Android nativa
        await GoogleAuth.initialize({
          clientId: '866279976542-f1vip3bh5s8r1m7nbnjsmts2kmrkdrip.apps.googleusercontent.com',
          scopes: ['profile', 'email'],
        });
        
        console.log('Plugin inicializado, solicitando login...');
        const googleUser = await GoogleAuth.signIn();
        console.log('Respuesta de Google:', JSON.stringify(googleUser, null, 2));
        
        if (!googleUser?.authentication?.idToken) {
          throw new Error('No se recibió el token de autenticación');
        }
    
        credential = firebase.auth.GoogleAuthProvider.credential(
          googleUser.authentication.idToken
        );
      } else {
        // Versión Web
        const provider = new firebase.auth.GoogleAuthProvider();
        provider.addScope('profile');
        provider.addScope('email');
        
        const result = await this.afAuth.signInWithPopup(provider);
        console.log('Respuesta de Google Web:', result);
        
        if (!result.user) {
          throw new Error('No se pudo obtener la información del usuario');
        }
        
        // No necesitamos crear credenciales aquí porque signInWithPopup ya lo maneja
        this.router.navigate(['/home']);
        return;
      }
      
      // Solo para Android: usar la credencial con Firebase
      if (credential) {
        console.log('Credencial creada, iniciando sesión en Firebase...');
        const result = await this.afAuth.signInWithCredential(credential);
        console.log('Autenticación exitosa:', result);
      }
      
      this.router.navigate(['/home']);
    } catch (error: any) {
      console.error('Error completo:', {
        message: error.message,
        code: error.code,
        fullError: JSON.stringify(error, null, 2)
      });
      throw error;
    }
  }

  // Cerrar sesión
  async logout() {
    try {
      if (this.platform.is('android')) {
        await GoogleAuth.signOut(); // Cerrar sesión de Google en Android
      }
      await this.afAuth.signOut(); // Cerrar sesión de Firebase
      this.router.navigate(['/login']);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }
}
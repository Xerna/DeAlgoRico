import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ProfileService } from '../../services/profile.service';
import { UserProfile } from '../../models/user-profile.interface';
import { LoadingController, ToastController } from '@ionic/angular';

@Component({
  selector: 'app-profile',
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/home"></ion-back-button>
        </ion-buttons>
        <ion-title>Profile</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <form (ngSubmit)="saveProfile()">
        <ion-item>
          <ion-label position="floating">Edad</ion-label>
          <ion-input type="number" [(ngModel)]="profileData.edad" name="edad"></ion-input>
        </ion-item>

        <ion-item>
          <ion-label>Sexo</ion-label>
          <ion-select [(ngModel)]="profileData.sexo" name="sexo">
            <ion-select-option value="masculino">Masculino</ion-select-option>
            <ion-select-option value="femenino">Femenino</ion-select-option>
          </ion-select>
        </ion-item>

        <ion-item>
          <ion-label position="floating">Altura (cm)</ion-label>
          <ion-input type="number" [(ngModel)]="profileData.altura" name="altura"></ion-input>
        </ion-item>

        <ion-item>
          <ion-label position="floating">Peso Actual (kg)</ion-label>
          <ion-input type="number" [(ngModel)]="profileData.peso_actual" name="peso_actual"></ion-input>
        </ion-item>

        <ion-item>
          <ion-label>Nivel de Actividad Física</ion-label>
          <ion-select [(ngModel)]="profileData.actividad_fisica" name="actividad_fisica">
            <ion-select-option value="sedentario">Sedentario</ion-select-option>
            <ion-select-option value="ligero">Ligero</ion-select-option>
            <ion-select-option value="moderado">Moderado</ion-select-option>
            <ion-select-option value="intenso">Intenso</ion-select-option>
          </ion-select>
        </ion-item>

        <ion-item>
          <ion-label>Objetivo</ion-label>
          <ion-select [(ngModel)]="profileData.objetivo" name="objetivo">
            <ion-select-option value="bajar">Bajar de Peso</ion-select-option>
            <ion-select-option value="mantener">Mantener Peso</ion-select-option>
            <ion-select-option value="subir">Subir de Peso</ion-select-option>
          </ion-select>
        </ion-item>

        <ion-item>
          <ion-label>Condiciones de Salud</ion-label>
          <ion-select [(ngModel)]="profileData.enfermedades" name="enfermedades" multiple="true">
            <ion-select-option value="diabetes">Diabetes</ion-select-option>
            <ion-select-option value="hipertension">Hipertensión</ion-select-option>
            <ion-select-option value="higado_graso">Hígado Graso</ion-select-option>
            <ion-select-option value="colesterol">Colesterol Alto</ion-select-option>
            <ion-select-option value="ninguna">Ninguna</ion-select-option>
          </ion-select>
        </ion-item>

        <ion-button expand="block" type="submit" class="ion-margin-top">
          Guardar Perfil
        </ion-button>
      </form>
    </ion-content>
  `
})
export class ProfilePage implements OnInit {
  profileData: Partial<UserProfile> = {
    edad: 0,
    peso_actual: 0,
    altura: 0,
    sexo: 'masculino',
    actividad_fisica: 'sedentario',
    enfermedades: [],
    objetivo: 'mantener'
  };
  
  constructor(
    private profileService: ProfileService,
    private router: Router,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController
  ) {}

  ngOnInit() {
    this.loadUserProfile();
  }

  async loadUserProfile() {
    const loading = await this.loadingCtrl.create({
      message: 'Cargando perfil...'
    });
    await loading.present();
  
    this.profileService.getUserProfile().subscribe({
      next: async (profile) => {
        if (profile) {
          this.profileData = profile;
        }
        await loading.dismiss();
      },
      error: async (error) => {
        console.error('Error loading profile:', error);
        await loading.dismiss();
        await this.showToast('Error al cargar el perfil');
      },
      complete: async () => {
        await loading.dismiss();
      }
    });
  }

  async saveProfile() {
    const loading = await this.loadingCtrl.create({
      message: 'Guardando...'
    });
    await loading.present();

    try {
      await this.profileService.saveUserProfile(this.profileData);
      await loading.dismiss();
      await this.showToast('Perfil guardado exitosamente');
      this.router.navigate(['/home']);
    } catch (error) {
      console.error('Error saving profile:', error);
      await loading.dismiss();
      await this.showToast('Error al guardar el perfil');
    }
  }

  private async showToast(message: string) {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2000,
      position: 'bottom'
    });
    await toast.present();
  }
}
//src/app/pages/profile/profile.page.ts
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
    actividad_fisica: ''
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
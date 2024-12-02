import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth/auth.service';
import { ProfileService } from '../services/profile.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>
          Home
        </ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="goToProfile()">
            <ion-icon slot="icon-only" name="person"></ion-icon>
          </ion-button>
          <ion-button (click)="logout()">
            <ion-icon slot="icon-only" name="log-out"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <ion-card>
        <ion-card-header>
          <ion-card-title>Welcome!</ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <p>You are logged in successfully.</p>
          <ion-button *ngIf="!profileComplete" expand="block" (click)="goToProfile()" color="primary" class="ion-margin-bottom">
            Complete Your Profile
          </ion-button>
        </ion-card-content>
      </ion-card>

      <ion-grid>
        <ion-row>
          <ion-col size="6">
            <ion-button expand="block" (click)="goTo('despensa')">
              <ion-icon name="basket" slot="start"></ion-icon>
              Despensa
            </ion-button>
          </ion-col>
          <ion-col size="6">
            <ion-button expand="block" (click)="goTo('recetas')">
              <ion-icon name="restaurant" slot="start"></ion-icon>
              Buscar Recetas
            </ion-button>
          </ion-col>
        </ion-row>
        <ion-row>
          <ion-col size="6">
            <ion-button expand="block" (click)="goTo('consejos')">
              <ion-icon name="nutrition" slot="start"></ion-icon>
              Consejos Nutricionales
            </ion-button>
          </ion-col>
          <ion-col size="6">
            <ion-button expand="block" (click)="goTo('compras')">
              <ion-icon name="cart" slot="start"></ion-icon>
              Lista de Compras
            </ion-button>
          </ion-col>
        </ion-row>
        <ion-row>
          <ion-col size="12">
            <ion-button expand="block" (click)="goTo('meal-plan')" color="tertiary">
              <ion-icon name="calendar" slot="start"></ion-icon>
              Mi Plan Semanal
            </ion-button>
          </ion-col>
        </ion-row>
      </ion-grid>
    </ion-content>
  `
})
export class HomePage implements OnInit {
  profileComplete: boolean = false;

  constructor(
    private authService: AuthService,
    private profileService: ProfileService,
    private router: Router
  ) {}

  ngOnInit() {
    this.checkProfileStatus();
  }

  checkProfileStatus() {
    this.profileService.getUserProfile().subscribe(profile => {
      this.profileComplete = profile !== null && 
                            profile.edad !== null && 
                            profile.peso_actual !== null && 
                            profile.actividad_fisica !== '';
    });
  }

  goToProfile() {
    this.router.navigate(['/profile']);
  }
  goTo(page: string) {
    this.router.navigate([`/${page}`]);
  }
  async logout() {
    try {
      await this.authService.logout();
      this.router.navigate(['/login']);
    } catch (error) {
      console.error('Logout error:', error);
    }
  }
}
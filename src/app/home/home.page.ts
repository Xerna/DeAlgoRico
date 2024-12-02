import { Component } from '@angular/core';
import { AuthService } from '../services/auth/auth.service';
import { ProfileService } from '../services/profile.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  template: `
    <div class="app-container">
      <ion-header class="modern-header">
        <ion-toolbar>
          <ion-title>
            <span class="gradient-text">Mi Nutrición</span>
          </ion-title>
          <ion-buttons slot="end">
            <ion-button class="profile-button" (click)="goToProfile()">
              <ion-icon slot="icon-only" name="person"></ion-icon>
            </ion-button>
            <ion-button class="logout-button" (click)="logout()">
              <ion-icon slot="icon-only" name="log-out"></ion-icon>
            </ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>

      <ion-content>
        <div class="welcome-card" *ngIf="!profileComplete">
          <h2>¡Bienvenido!</h2>
          <p>Para comenzar, completa tu perfil</p>
          <ion-button expand="block" (click)="goToProfile()" class="profile-complete-button">
            Completar Perfil
          </ion-button>
        </div>

        <div class="menu-grid">
          <ion-grid>
            <ion-row>
              <ion-col size="6">
                <ion-button class="modern-button" expand="block" (click)="goTo('despensa')">
                  <div class="button-content">
                    <ion-icon name="basket"></ion-icon>
                    <span>Despensa</span>
                  </div>
                </ion-button>
              </ion-col>
              <ion-col size="6">
                <ion-button class="modern-button" expand="block" (click)="goTo('recetas')">
                  <div class="button-content">
                    <ion-icon name="restaurant"></ion-icon>
                    <span>Buscar Recetas</span>
                  </div>
                </ion-button>
              </ion-col>
            </ion-row>
            <ion-row>
              <ion-col size="6">
                <ion-button class="modern-button" expand="block" (click)="goTo('consejos')">
                  <div class="button-content">
                    <ion-icon name="nutrition"></ion-icon>
                    <span>Consejos Nutricionales</span>
                  </div>
                </ion-button>
              </ion-col>
              <ion-col size="6">
                <ion-button class="modern-button" expand="block" (click)="goTo('compras')">
                  <div class="button-content">
                    <ion-icon name="cart"></ion-icon>
                    <span>Lista de Compras</span>
                  </div>
                </ion-button>
              </ion-col>
            </ion-row>
            <ion-row>
              <ion-col size="12">
                <ion-button class="modern-button accent" expand="block" (click)="goTo('meal-plan')">
                  <div class="button-content">
                    <ion-icon name="calendar"></ion-icon>
                    <span>Mi Plan Semanal</span>
                  </div>
                </ion-button>
              </ion-col>
            </ion-row>
          </ion-grid>
        </div>
      </ion-content>
    </div>
  `,
  styles: [`
    .app-container {
      --primary-color: #4CAF50;
      --secondary-color: #2E7D32;
      --accent-color: #FFA726;
      --background-color: #f5f5f5;
      height: 100%;
      background: var(--background-color);
    }

    .modern-header ion-toolbar {
      --background: transparent;
      --border-width: 0;
      padding: 8px;
    }

    .gradient-text {
      background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      font-weight: bold;
      font-size: 1.5em;
    }

    .welcome-card {
      background: white;
      border-radius: 20px;
      padding: 20px;
      margin: 16px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      text-align: center;
    }

    .welcome-card h2 {
      color: var(--primary-color);
      margin-bottom: 8px;
    }

    .profile-complete-button {
      --background: var(--primary-color);
      --border-radius: 12px;
      margin-top: 16px;
    }

    .menu-grid {
      padding: 16px;
    }

    .modern-button {
      --background: white;
      --color: var(--primary-color);
      --box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      --border-radius: 12px;
      height: 80px;
      margin: 8px 0;
    }

    .modern-button.accent {
      --background: var(--primary-color);
      --color: white;
    }

    .button-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      width: 100%;
      padding: 8px;
    }

    .button-content ion-icon {
      font-size: 24px;
      margin-bottom: 4px;
    }

    .button-content span {
      font-size: 0.9em;
      text-align: center;
    }

    ion-icon {
      font-size: 24px;
    }
  `]
})
export class HomePage {
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
      this.profileComplete = Boolean(
        profile &&
        profile.edad &&
        profile.edad > 0 &&
        profile.peso_actual &&
        profile.peso_actual > 0 &&
        profile.altura &&
        profile.altura > 0 &&
        profile.sexo &&
        profile.actividad_fisica &&
        profile.objetivo &&
        Array.isArray(profile.enfermedades)
      );
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
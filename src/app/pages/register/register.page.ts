import { Component } from '@angular/core';
import { AuthService } from '../../services/auth/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>Register</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <ion-item>
        <ion-label position="floating">Email</ion-label>
        <ion-input type="email" [(ngModel)]="email"></ion-input>
      </ion-item>

      <ion-item>
        <ion-label position="floating">Password</ion-label>
        <ion-input type="password" [(ngModel)]="password"></ion-input>
      </ion-item>

      <ion-button expand="block" class="ion-margin-top" (click)="register()">
        Register
      </ion-button>

      <ion-button expand="block" fill="clear" (click)="goToLogin()">
        Already have an account
      </ion-button>
    </ion-content>
  `
})
export class RegisterPage {
  email: string = '';
  password: string = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  async register() {
    try {
      await this.authService.register(this.email, this.password);
      this.router.navigate(['/home']);
    } catch (error) {
      console.error('Register error:', error);
    }
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }
}
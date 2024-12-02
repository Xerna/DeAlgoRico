// login.page.ts
import { Component } from '@angular/core';
import { AuthService } from '../../services/auth/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>Login</ion-title>
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

      <ion-button expand="block" class="ion-margin-top" (click)="login()">
        Login
      </ion-button>

      <ion-button expand="block" class="ion-margin-top" (click)="loginWithGoogle()">
        Login with Google
      </ion-button>

      <ion-button expand="block" fill="clear" (click)="goToRegister()">
        Create Account
      </ion-button>
    </ion-content>
  `
})
export class LoginPage {
  email: string = '';
  password: string = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  async login() {
    try {
      await this.authService.login(this.email, this.password);
      this.router.navigate(['/home']);
    } catch (error) {
      console.error('Login error:', error);
    }
  }

  async loginWithGoogle() {
    try {
      await this.authService.loginWithGoogle();
      this.router.navigate(['/home']);
    } catch (error) {
      console.error('Google login error:', error);
    }
  }

  goToRegister() {
    this.router.navigate(['/register']);
  }
}
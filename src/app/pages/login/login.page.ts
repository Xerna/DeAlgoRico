import { Component } from '@angular/core';
import { AuthService } from '../../services/auth/auth.service';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-login',
  template: `
    <div class="login-container">
      <div class="logo-section">
        <div class="app-logo">
          <ion-icon name="nutrition-outline"></ion-icon>
        </div>
        <h1>DeAlgoRico</h1>
        <p>Gestiona tu nutrición de forma inteligente</p>
      </div>

      <div class="form-container">
        <div class="input-group">
          <div class="modern-input">
            <ion-icon name="mail-outline"></ion-icon>
            <ion-input
              type="email"
              placeholder="Correo electrónico"
              [(ngModel)]="email"
              class="custom-input">
            </ion-input>
          </div>

          <div class="modern-input">
            <ion-icon name="lock-closed-outline"></ion-icon>
            <ion-input
              [type]="showPassword ? 'text' : 'password'"
              placeholder="Contraseña"
              [(ngModel)]="password"
              class="custom-input">
            </ion-input>
            <ion-icon
              [name]="showPassword ? 'eye-outline' : 'eye-off-outline'"
              class="toggle-password"
              (click)="togglePassword()">
            </ion-icon>
          </div>
        </div>

        <div class="buttons-container">
          <ion-button expand="block" class="login-button" (click)="login()">
            <ion-icon name="log-in-outline" slot="start"></ion-icon>
            Iniciar Sesión
          </ion-button>

          <div class="divider">
            <span>O continúa con</span>
          </div>

          <ion-button expand="block" class="google-button" (click)="loginWithGoogle()">
            <ion-icon name="logo-google" slot="start"></ion-icon>
            Google
          </ion-button>

          <ion-button expand="block" fill="clear" class="register-button" (click)="goToRegister()">
            ¿No tienes cuenta? <span>Regístrate</span>
          </ion-button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      --primary-color: #4CAF50;
      --secondary-color: #2E7D32;
      --background-color: #f5f5f5;
      min-height: 100vh;
      background: var(--background-color);
      padding: 20px;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }

    .logo-section {
      text-align: center;
      margin-bottom: 40px;
    }

    .app-logo {
      width: 80px;
      height: 80px;
      background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
      border-radius: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 20px;
    }

    .app-logo ion-icon {
      font-size: 40px;
      color: white;
    }

    .logo-section h1 {
      font-size: 24px;
      color: #333;
      margin: 0 0 8px;
      font-weight: 600;
    }

    .logo-section p {
      color: #666;
      margin: 0;
      font-size: 14px;
    }

    .form-container {
      background: white;
      border-radius: 20px;
      padding: 24px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }

    .input-group {
      margin-bottom: 24px;
    }

    .modern-input {
      display: flex;
      align-items: center;
      background: #f5f5f5;
      border-radius: 12px;
      padding: 4px 16px;
      margin-bottom: 16px;
    }

    .modern-input ion-icon {
      color: #666;
      font-size: 20px;
      margin-right: 12px;
    }

    .custom-input {
      --padding-start: 0;
      --padding-end: 0;
      --background: transparent;
      --padding-top: 12px;
      --padding-bottom: 12px;
    }

    .toggle-password {
      color: #666;
      font-size: 20px;
      cursor: pointer;
    }

    .buttons-container {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .login-button {
      --background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
      --border-radius: 12px;
      --box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
      margin: 0;
    }

    .google-button {
      --background: white;
      --color: #333;
      --border-radius: 12px;
      --border-color: #ddd;
      --border-style: solid;
      --border-width: 1px;
      --box-shadow: none;
      margin: 0;
    }

    .divider {
      text-align: center;
      position: relative;
      margin: 8px 0;
    }

    .divider::before,
    .divider::after {
      content: '';
      position: absolute;
      top: 50%;
      width: calc(50% - 30px);
      height: 1px;
      background-color: #ddd;
    }

    .divider::before {
      left: 0;
    }

    .divider::after {
      right: 0;
    }

    .divider span {
      background: white;
      padding: 0 10px;
      color: #666;
      font-size: 14px;
    }

    .register-button {
      --color: #666;
      font-size: 14px;
      margin: 0;
    }

    .register-button span {
      color: var(--primary-color);
      margin-left: 4px;
      font-weight: 500;
    }
  `]
})
export class LoginPage {
  email: string = '';
  password: string = '';
  showPassword: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastCtrl: ToastController
  ) {}

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  async login() {
    if (!this.email || !this.password) {
      this.showToast('Por favor, completa todos los campos');
      return;
    }

    try {
      await this.authService.login(this.email, this.password);
      this.router.navigate(['/home']);
    } catch (error: any) {
      console.error('Login error:', error);
      this.showToast(this.getErrorMessage(error.code));
    }
  }

  async loginWithGoogle() {
    try {
      await this.authService.loginWithGoogle();
      this.router.navigate(['/home']);
    } catch (error: any) {
      console.error('Google login error:', error);
      this.showToast(this.getErrorMessage(error.code));
    }
  }

  goToRegister() {
    this.router.navigate(['/register']);
  }

  private async showToast(message: string) {
    const toast = await this.toastCtrl.create({
      message,
      duration: 3000,
      position: 'bottom',
      color: 'danger',
      cssClass: 'modern-toast'
    });
    await toast.present();
  }

  private getErrorMessage(errorCode: string): string {
    switch (errorCode) {
      case 'auth/invalid-email':
        return 'El correo electrónico no es válido';
      case 'auth/user-disabled':
        return 'Esta cuenta ha sido deshabilitada';
      case 'auth/user-not-found':
        return 'No existe una cuenta con este correo';
      case 'auth/wrong-password':
        return 'Contraseña incorrecta';
      default:
        return 'Error al iniciar sesión. Intenta nuevamente';
    }
  }
}
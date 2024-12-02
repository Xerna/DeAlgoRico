import { Component } from '@angular/core';
import { SpoonacularService } from '../../services/spoonacular.service';
import { DespensaService } from '../../services/despensa.service';
import { ModalController, ToastController } from '@ionic/angular';

@Component({
  selector: 'app-buscar-ingrediente',
  template: `
    <div class="search-container">
      <ion-header class="modern-header">
        <ion-toolbar>
          <ion-buttons slot="start">
            <ion-button class="cancel-button" (click)="dismissModal()">
              <ion-icon name="arrow-back-outline"></ion-icon>
              <span>Volver</span>
            </ion-button>
          </ion-buttons>
          <ion-title>
            <span class="gradient-text">Buscar Ingrediente</span>
          </ion-title>
        </ion-toolbar>
        <ion-toolbar>
          <div class="search-wrapper">
            <ion-searchbar
              class="modern-searchbar"
              placeholder="Buscar ingredientes..."
              [debounce]="500"
              (ionChange)="searchIngredients($event)"
              [value]="searchTerm"
              animated="true"
              mode="md">
            </ion-searchbar>
          </div>
        </ion-toolbar>
      </ion-header>
      
      <ion-content>
        <!-- Progress Bar -->
        <div class="progress-wrapper" *ngIf="loading">
          <ion-progress-bar type="indeterminate" class="custom-progress"></ion-progress-bar>
        </div>
        
        <!-- Empty State -->
        <div class="empty-state" *ngIf="!loading && ingredients.length === 0 && searchTerm.length > 0">
          <ion-icon name="search-outline"></ion-icon>
          <h3>No se encontraron ingredientes</h3>
          <p>Intenta con otra búsqueda</p>
        </div>

        <!-- Initial State -->
        <div class="empty-state" *ngIf="!loading && ingredients.length === 0 && searchTerm.length === 0">
          <ion-icon name="nutrition-outline"></ion-icon>
          <h3>Busca Ingredientes</h3>
          <p>Escribe al menos 3 caracteres para comenzar</p>
        </div>
        
        <!-- Results List -->
        <ion-list *ngIf="!loading && ingredients.length > 0" class="results-list">
          <ion-item *ngFor="let ingredient of ingredients" 
                    (click)="selectIngredient(ingredient)"
                    class="ingredient-item"
                    lines="full"
                    detail="true">
            <ion-icon name="leaf-outline" slot="start"></ion-icon>
            <ion-label>
              <h2>{{ingredient.name}}</h2>
            </ion-label>
          </ion-item>
        </ion-list>
      </ion-content>
    </div>
  `,
  styles: [`
    .search-container {
      --primary-color: #4CAF50;
      --secondary-color: #2E7D32;
      --background-color: #f5f5f5;
      height: 100%;
      background: var(--background-color);
    }

    .modern-header ion-toolbar {
      --background: transparent;
      --border-width: 0;
    }

    .gradient-text {
      background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      font-weight: bold;
      font-size: 1.2em;
    }

    .cancel-button {
      display: flex;
      align-items: center;
      gap: 4px;
      --color: var(--primary-color);
    }

    .search-wrapper {
      padding: 0 10px;
    }

    .modern-searchbar {
      --border-radius: 12px;
      --box-shadow: 0 2px 6px rgba(0,0,0,0.1);
      --placeholder-color: #666;
      --icon-color: var(--primary-color);
      --background: white;
    }

    .progress-wrapper {
      padding: 10px 20px;
    }

    .custom-progress {
      border-radius: 4px;
      height: 4px;
      --progress-background: var(--primary-color);
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px 20px;
      text-align: center;
      color: #666;
    }

    .empty-state ion-icon {
      font-size: 48px;
      color: var(--primary-color);
      margin-bottom: 16px;
    }

    .empty-state h3 {
      margin: 0;
      color: #333;
      font-size: 1.2em;
      margin-bottom: 8px;
    }

    .empty-state p {
      margin: 0;
      font-size: 0.9em;
    }

    .results-list {
      background: transparent;
      padding: 8px;
    }

    .ingredient-item {
      --background: white;
      --padding-start: 16px;
      --padding-end: 16px;
      --padding-top: 12px;
      --padding-bottom: 12px;
      --border-radius: 12px;
      margin-bottom: 8px;
      --border-color: transparent;
      box-shadow: 0 2px 6px rgba(0,0,0,0.06);
    }

    .ingredient-item ion-icon {
      color: var(--primary-color);
      font-size: 20px;
    }

    .ingredient-item ion-label h2 {
      font-size: 1em;
      font-weight: 500;
      color: #333;
    }
  `]
})
export class BuscarIngredientePage {
  ingredients: any[] = [];
  loading = false;
  searchTerm = '';

  constructor(
    private spoonacularService: SpoonacularService,
    private modalCtrl: ModalController,
    private toastCtrl: ToastController
  ) {}

  searchIngredients(event: any) {
    const query = event.detail.value?.trim();
    this.searchTerm = query || '';
    
    if (query && query.length > 2) {
      this.loading = true;
      this.ingredients = [];

      this.spoonacularService.getIngredients(query).subscribe({
        next: (data) => {
          this.ingredients = data;
          this.loading = false;
        },
        error: async (error) => {
          console.error('Error:', error);
          this.loading = false;
          const toast = await this.toastCtrl.create({
            message: 'Error al buscar ingredientes',
            duration: 2000,
            color: 'danger',
            position: 'top',
            cssClass: 'custom-toast'
          });
          await toast.present();
        }
      });
    } else {
      this.ingredients = [];
    }
  }

  selectIngredient(ingredient: any) {
    this.modalCtrl.dismiss(ingredient);
  }

  dismissModal() {
    this.modalCtrl.dismiss();
  }
}
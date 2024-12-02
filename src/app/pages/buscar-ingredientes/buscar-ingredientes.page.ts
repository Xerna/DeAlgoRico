import { Component } from '@angular/core';
import { SpoonacularService } from '../../services/spoonacular.service';
import { DespensaService } from '../../services/despensa.service';
import { ModalController, ToastController } from '@ionic/angular';

@Component({
  selector: 'app-buscar-ingrediente',
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-button (click)="dismissModal()">Cancelar</ion-button>
        </ion-buttons>
        <ion-title>Buscar Ingrediente</ion-title>
      </ion-toolbar>
      <ion-toolbar>
        <ion-searchbar
          placeholder="Buscar ingredientes..."
          [debounce]="500"
          (ionChange)="searchIngredients($event)"
          [value]="searchTerm">
        </ion-searchbar>
      </ion-toolbar>
    </ion-header>
    
    <ion-content>
      <ion-progress-bar type="indeterminate" *ngIf="loading"></ion-progress-bar>
      
      <ion-list *ngIf="!loading">
        <ion-item *ngFor="let ingredient of ingredients" (click)="selectIngredient(ingredient)">
          <ion-label>{{ingredient.name}}</ion-label>
        </ion-item>
      </ion-list>
    </ion-content>
  `
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
    const query = event.detail.value;
    if (query && query.length > 2) {
      this.loading = true;
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
            duration: 2000
          });
          await toast.present();
        }
      });
    }
  }

  selectIngredient(ingredient: any) {
    this.modalCtrl.dismiss(ingredient);
  }

  dismissModal() {
    this.modalCtrl.dismiss();
  }
}
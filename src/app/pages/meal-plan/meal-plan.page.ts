import { Component, OnInit } from '@angular/core';
import { SavedRecipesService, SavedRecipe } from '../../services/saved-recipes.service';
import { SpoonacularService } from '../../services/spoonacular.service';
import { LoadingController, AlertController } from '@ionic/angular';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';

interface RecipeDisplay {
  id: string;
  id_receta: number;
  titulo: string;
  imagen: string;
}

@Component({
  selector: 'app-meal-plan',
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/home"></ion-back-button>
        </ion-buttons>
        <ion-title>Mis Recetas Guardadas</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <ion-refresher slot="fixed" (ionRefresh)="doRefresh($event)">
        <ion-refresher-content></ion-refresher-content>
      </ion-refresher>

      <div *ngIf="!recetas.length" class="ion-text-center ion-padding">
        <p>No hay recetas guardadas</p>
        <ion-button expand="block" (click)="irARecetas()">
          Buscar Recetas
        </ion-button>
      </div>

      <ion-list>
        <ion-item-sliding *ngFor="let receta of recetas">
          <ion-item>
            <ion-thumbnail slot="start">
              <img [src]="receta.imagen" [alt]="receta.titulo">
            </ion-thumbnail>
            <ion-label>
              <h2>{{ receta.titulo }}</h2>
            </ion-label>
          </ion-item>

          <ion-item-options side="end">
            <ion-item-option color="danger" (click)="eliminarReceta(receta)">
              <ion-icon slot="icon-only" name="trash"></ion-icon>
            </ion-item-option>
          </ion-item-options>
        </ion-item-sliding>
      </ion-list>
    </ion-content>
  `
})
export class MealPlanPage implements OnInit {
  recetas: RecipeDisplay[] = [];

  constructor(
    private savedRecipesService: SavedRecipesService,
    private spoonacularService: SpoonacularService,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController,
    private router: Router
  ) {}

  ngOnInit() {
    this.cargarRecetas();
  }

  async cargarRecetas() {
    const loading = await this.loadingCtrl.create({
      message: 'Cargando recetas...'
    });
    await loading.present();

    try {
      // Obtener los IDs de las recetas guardadas
      const recetasGuardadas = await firstValueFrom(this.savedRecipesService.getSavedRecipes());
      
      this.recetas = [];

      // Por cada receta guardada, obtener sus detalles de la API
      for (const receta of recetasGuardadas) {
        try {
          const detalleReceta = await firstValueFrom(
            this.spoonacularService.getRecipeDetails(receta.id_receta)
          );

          this.recetas.push({
            id: receta.id!,
            id_receta: receta.id_receta,
            titulo: detalleReceta.title,
            imagen: detalleReceta.image
          });
        } catch (error) {
          console.error(`Error al obtener detalles de receta ${receta.id_receta}:`, error);
        }
      }
    } catch (error) {
      console.error('Error al cargar recetas:', error);
      this.mostrarError('Error al cargar las recetas');
    } finally {
      loading.dismiss();
    }
  }

  async eliminarReceta(receta: RecipeDisplay) {
    const alert = await this.alertCtrl.create({
      header: '¿Eliminar receta?',
      message: `¿Estás seguro de que deseas eliminar ${receta.titulo}?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: async () => {
            try {
              await this.savedRecipesService.deleteRecipe(receta.id);
              await this.cargarRecetas(); // Recargar la lista
              this.mostrarMensaje('Receta eliminada');
            } catch (error) {
              console.error('Error al eliminar:', error);
              this.mostrarError('Error al eliminar la receta');
            }
          }
        }
      ]
    });

    await alert.present();
  }

  async doRefresh(event: any) {
    await this.cargarRecetas();
    event.target.complete();
  }

  irARecetas() {
    this.router.navigate(['/recetas']);
  }

  private async mostrarError(mensaje: string) {
    const alert = await this.alertCtrl.create({
      header: 'Error',
      message: mensaje,
      buttons: ['OK']
    });
    await alert.present();
  }

  private async mostrarMensaje(mensaje: string) {
    const alert = await this.alertCtrl.create({
      message: mensaje,
      buttons: ['OK']
    });
    await alert.present();
  }
}
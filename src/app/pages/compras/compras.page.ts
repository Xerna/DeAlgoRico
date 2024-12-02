import { Component, OnInit } from '@angular/core';
import { ShoppingListService, ShoppingListItem } from '../../services/shopping-list.service';
import { AlertController, LoadingController, ToastController } from '@ionic/angular';

@Component({
  selector: 'app-compras',
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/home"></ion-back-button>
        </ion-buttons>
        <ion-title>Lista de Compras</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <ion-list>
        <ion-item *ngFor="let item of shoppingList">
          <ion-checkbox 
            slot="start" 
            [checked]="item.completed"
            (ionChange)="toggleComplete(item)">
          </ion-checkbox>
          <ion-label [class.completed]="item.completed">
            {{ item.ingredientName }}
          </ion-label>
          <ion-button 
            slot="end" 
            fill="clear" 
            color="danger"
            (click)="deleteItem(item)">
            <ion-icon name="trash"></ion-icon>
          </ion-button>
        </ion-item>
      </ion-list>

      <div *ngIf="shoppingList.length === 0" class="ion-text-center ion-padding">
        <p>No hay ingredientes en tu lista de compras</p>
      </div>
    </ion-content>

    <ion-footer>
      <ion-toolbar>
        <ion-button expand="block" (click)="clearCompleted()" [disabled]="!hasCompletedItems">
          Limpiar Completados
        </ion-button>
      </ion-toolbar>
    </ion-footer>
  `,
  styles: [`
    .completed {
      text-decoration: line-through;
      color: var(--ion-color-medium);
    }
  `]
})
export class ComprasPage implements OnInit {
  shoppingList: ShoppingListItem[] = [];
  hasCompletedItems = false;

  constructor(
    private shoppingListService: ShoppingListService,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController
  ) {}

  ngOnInit() {
    this.loadShoppingList();
  }

  loadShoppingList() {
    this.shoppingListService.getShoppingList().subscribe(items => {
      this.shoppingList = items;
      this.hasCompletedItems = items.some(item => item.completed);
    });
  }

  async toggleComplete(item: ShoppingListItem) {
    if (!item.id) return;
    try {
      await this.shoppingListService.toggleComplete(item.id, !item.completed);
    } catch (error) {
      console.error('Error al actualizar item:', error);
      const toast = await this.toastCtrl.create({
        message: 'Error al actualizar el estado',
        duration: 2000,
        color: 'danger'
      });
      await toast.present();
    }
  }

  async deleteItem(item: ShoppingListItem) {
    if (!item.id) return;
    
    const alert = await this.alertCtrl.create({
      header: 'Confirmar eliminación',
      message: `¿Deseas eliminar ${item.ingredientName} de la lista?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Eliminar',
          handler: async () => {
            try {
              await this.shoppingListService.deleteItem(item.id!);
              const toast = await this.toastCtrl.create({
                message: 'Ingrediente eliminado',
                duration: 2000
              });
              await toast.present();
            } catch (error) {
              console.error('Error al eliminar:', error);
              const toast = await this.toastCtrl.create({
                message: 'Error al eliminar el ingrediente',
                duration: 2000,
                color: 'danger'
              });
              await toast.present();
            }
          }
        }
      ]
    });
    await alert.present();
  }

  async clearCompleted() {
    const loading = await this.loadingCtrl.create({
      message: 'Limpiando items completados...'
    });
    await loading.present();

    try {
      const completedItems = this.shoppingList.filter(item => item.completed && item.id);
      await Promise.all(completedItems.map(item => this.shoppingListService.deleteItem(item.id!)));
      
      loading.dismiss();
      const toast = await this.toastCtrl.create({
        message: 'Items completados eliminados',
        duration: 2000
      });
      await toast.present();
    } catch (error) {
      console.error('Error al limpiar items:', error);
      loading.dismiss();
      const toast = await this.toastCtrl.create({
        message: 'Error al limpiar los items',
        duration: 2000,
        color: 'danger'
      });
      await toast.present();
    }
  }
}
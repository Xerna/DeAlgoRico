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
        <ion-title>
          <span class="gradient-text">Lista de Compras</span>
        </ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="content-container">
      <!-- Estado vacío -->
      <div *ngIf="shoppingList.length === 0" class="empty-state">
        <ion-icon name="cart-outline"></ion-icon>
        <h3>Lista de compras vacía</h3>
        <p>Agrega ingredientes desde las recetas</p>
      </div>

      <!-- Lista de compras -->
      <ion-list *ngIf="shoppingList.length > 0" class="shopping-list">
        <ion-item-sliding *ngFor="let item of shoppingList">
          <ion-item class="shopping-item" [class.completed]="item.completed">
            <ion-checkbox 
              slot="start" 
              [checked]="item.completed"
              (ionChange)="toggleComplete(item)"
              class="custom-checkbox">
            </ion-checkbox>
            <ion-label>{{ item.ingredientName }}</ion-label>
            <ion-button 
              slot="end" 
              fill="clear" 
              color="danger"
              (click)="deleteItem(item)">
              <ion-icon name="trash-outline"></ion-icon>
            </ion-button>
          </ion-item>
        </ion-item-sliding>
      </ion-list>
    </ion-content>

    <ion-footer *ngIf="hasCompletedItems" class="footer">
      <ion-toolbar>
        <ion-button expand="block" (click)="clearCompleted()" class="clear-button">
          <ion-icon name="checkmark-done-outline" slot="start"></ion-icon>
          Limpiar Completados
        </ion-button>
      </ion-toolbar>
    </ion-footer>
  `,
  styles: [`
    .content-container {
      --background: #f5f5f5;
    }

    .gradient-text {
      font-weight: bold;
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 60vh;
      text-align: center;
      padding: 20px;
    }

    .empty-state ion-icon {
      font-size: 64px;
      color: #4CAF50;
      margin-bottom: 16px;
    }

    .empty-state h3 {
      margin: 0 0 8px;
      color: #333;
      font-size: 1.2em;
    }

    .empty-state p {
      margin: 0;
      color: #666;
    }

    .shopping-list {
      background: transparent;
      padding: 8px 16px;
    }

    .shopping-item {
      --background: white;
      --border-radius: 12px;
      margin-bottom: 8px;
      --padding-start: 8px;
      --padding-end: 8px;
      box-shadow: 0 2px 6px rgba(0,0,0,0.06);
    }

    .shopping-item.completed {
      --background: #f8f8f8;
    }

    .completed ion-label {
      text-decoration: line-through;
      color: #888;
    }

    .custom-checkbox {
      --size: 24px;
      --checkbox-background-checked: #4CAF50;
      margin-right: 12px;
    }

    .footer {
      padding: 8px 16px;
      --background: transparent;
    }

    .clear-button {
      --background: #4CAF50;
      --border-radius: 12px;
      margin: 0;
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
        color: 'danger',
        position: 'bottom'
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
                duration: 2000,
                position: 'bottom'
              });
              await toast.present();
            } catch (error) {
              console.error('Error al eliminar:', error);
              const toast = await this.toastCtrl.create({
                message: 'Error al eliminar el ingrediente',
                duration: 2000,
                color: 'danger',
                position: 'bottom'
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
      message: 'Limpiando items completados...',
      cssClass: 'custom-loading'
    });
    await loading.present();

    try {
      const completedItems = this.shoppingList.filter(item => item.completed && item.id);
      await Promise.all(completedItems.map(item => this.shoppingListService.deleteItem(item.id!)));
      
      loading.dismiss();
      const toast = await this.toastCtrl.create({
        message: 'Items completados eliminados',
        duration: 2000,
        position: 'bottom'
      });
      await toast.present();
    } catch (error) {
      console.error('Error al limpiar items:', error);
      loading.dismiss();
      const toast = await this.toastCtrl.create({
        message: 'Error al limpiar los items',
        duration: 2000,
        color: 'danger',
        position: 'bottom'
      });
      await toast.present();
    }
  }
}
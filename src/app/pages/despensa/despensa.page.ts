import { Component, OnInit } from '@angular/core';
import { DespensaService, DespensaItem } from '../../services/despensa.service';
import { ModalController, AlertController, ToastController } from '@ionic/angular';
import { BuscarIngredientePage } from '../buscar-ingredientes/buscar-ingredientes.page';

@Component({
  selector: 'app-despensa',
  template: `
    <div class="despensa-container">
      <ion-header class="modern-header">
        <ion-toolbar>
          <ion-buttons slot="start">
            <ion-back-button defaultHref="/home" text="Volver" icon="arrow-back-outline">
            </ion-back-button>
          </ion-buttons>
          <ion-title>
            <span class="gradient-text">Mi Despensa</span>
          </ion-title>
        </ion-toolbar>
      </ion-header>

      <ion-content>
        <!-- Estado vacío -->
        <div class="empty-state" *ngIf="ingredientes.length === 0">
          <ion-icon name="basket-outline"></ion-icon>
          <h3>Tu despensa está vacía</h3>
          <p>Agrega ingredientes para comenzar</p>
          <ion-button class="add-button" (click)="agregarIngrediente()">
            <ion-icon name="add-outline" slot="start"></ion-icon>
            Agregar Ingrediente
          </ion-button>
        </div>

        <!-- Lista de ingredientes -->
        <div class="ingredients-container" *ngIf="ingredientes.length > 0">
          <div class="ingredients-header">
            <h3>Ingredientes</h3>
            <span class="count-badge">{{ingredientes.length}}</span>
          </div>

          <ion-list class="modern-list">
            <ion-item-sliding *ngFor="let item of ingredientes">
              <ion-item class="ingredient-item">
                <div class="ingredient-content">
                  <ion-icon name="nutrition-outline" class="ingredient-icon"></ion-icon>
                  <ion-label>
                    <h2>{{ item.nombre_ingrediente }}</h2>
                    <div class="expiry-date">
                      <ion-icon name="calendar-outline"></ion-icon>
                      <span [ngClass]="{'expiring': isExpiringSoon(item.fecha_caducidad.toDate())}">
                        Caduca: {{ item.fecha_caducidad.toDate() | date:'dd/MM/yyyy' }}
                      </span>
                    </div>
                  </ion-label>
                </div>
              </ion-item>

              <ion-item-options side="end">
                <ion-item-option color="danger" (click)="eliminarIngrediente(item.id)">
                  <ion-icon slot="icon-only" name="trash-outline"></ion-icon>
                </ion-item-option>
              </ion-item-options>
            </ion-item-sliding>
          </ion-list>
        </div>

        <!-- Botón flotante -->
        <ion-fab vertical="bottom" horizontal="end" slot="fixed" *ngIf="ingredientes.length > 0">
          <ion-fab-button class="modern-fab" (click)="agregarIngrediente()">
            <ion-icon name="add-outline"></ion-icon>
          </ion-fab-button>
        </ion-fab>
      </ion-content>
    </div>
  `,
  styles: [`
    .despensa-container {
      --primary-color: #4CAF50;
      --secondary-color: #2E7D32;
      --background-color: #f5f5f5;
      --danger-color: #ef5350;
      --warning-color: #FFA726;
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
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px 20px;
      text-align: center;
      height: 80vh;
    }

    .empty-state ion-icon {
      font-size: 64px;
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
      color: #666;
      margin-bottom: 24px;
    }

    .add-button {
      --background: var(--primary-color);
      --border-radius: 12px;
      --box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
    }

    .ingredients-container {
      padding: 16px;
    }

    .ingredients-header {
      display: flex;
      align-items: center;
      margin-bottom: 16px;
      padding: 0 8px;
    }

    .ingredients-header h3 {
      margin: 0;
      color: #333;
      font-size: 1.2em;
      font-weight: 500;
    }

    .count-badge {
      background: var(--primary-color);
      color: white;
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 0.8em;
      margin-left: 8px;
    }

    .modern-list {
      background: transparent;
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

    .ingredient-content {
      display: flex;
      align-items: center;
      width: 100%;
    }

    .ingredient-icon {
      font-size: 24px;
      color: var(--primary-color);
      margin-right: 12px;
    }

    .expiry-date {
      display: flex;
      align-items: center;
      gap: 4px;
      color: #666;
      font-size: 0.9em;
      margin-top: 4px;
    }

    .expiry-date ion-icon {
      font-size: 16px;
    }

    .expiring {
      color: var(--warning-color);
    }

    .modern-fab {
      --background: var(--primary-color);
      --box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
    }

    ion-item-option {
      --border-radius: 8px;
      font-size: 18px;
    }
  `]
})
export class DespensaPage implements OnInit {
  ingredientes: DespensaItem[] = [];

  constructor(
    private despensaService: DespensaService,
    private modalCtrl: ModalController,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController
  ) {}

  ngOnInit() {
    this.loadDespensa();
  }

  loadDespensa() {
    this.despensaService.getDespensa().subscribe(items => {
      this.ingredientes = items;
    });
  }

  isExpiringSoon(date: Date): boolean {
    const today = new Date();
    const daysUntilExpiry = Math.floor((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 7 && daysUntilExpiry >= 0;
  }

  async agregarIngrediente() {
    const modal = await this.modalCtrl.create({
      component: BuscarIngredientePage,
      cssClass: 'modern-modal'
    });
    
    await modal.present();
    const { data: ingredienteSeleccionado } = await modal.onDidDismiss();
    
    if (ingredienteSeleccionado) {
      const alert = await this.alertCtrl.create({
        header: 'Fecha de caducidad',
        cssClass: 'modern-alert',
        inputs: [
          {
            name: 'fecha_caducidad',
            type: 'date',
            min: new Date().toISOString().split('T')[0]
          }
        ],
        buttons: [
          {
            text: 'Cancelar',
            role: 'cancel',
            cssClass: 'alert-button-cancel'
          },
          {
            text: 'Guardar',
            cssClass: 'alert-button-confirm',
            handler: async (data) => {
              if (data.fecha_caducidad) {
                try {
                  await this.despensaService.addIngrediente(
                    ingredienteSeleccionado.name,
                    new Date(data.fecha_caducidad)
                  );
                  this.showToast('Ingrediente agregado correctamente', 'success');
                } catch (error) {
                  this.showToast('Error al agregar ingrediente', 'danger');
                }
              }
            }
          }
        ]
      });
      await alert.present();
    }
  }

  async eliminarIngrediente(id: string | undefined) {
    if (!id) {
      await this.showToast('Error: ID de ingrediente no válido', 'danger');
      return;
    }

    const alert = await this.alertCtrl.create({
      header: '¿Eliminar ingrediente?',
      message: '¿Estás seguro de que deseas eliminar este ingrediente?',
      cssClass: 'modern-alert',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'alert-button-cancel'
        },
        {
          text: 'Eliminar',
          cssClass: 'alert-button-delete',
          handler: async () => {
            try {
              await this.despensaService.deleteIngrediente(id);
              await this.showToast('Ingrediente eliminado correctamente', 'success');
            } catch (error) {
              await this.showToast('Error al eliminar ingrediente', 'danger');
            }
          }
        }
      ]
    });

    await alert.present();
  }

  private async showToast(message: string, color: 'success' | 'danger') {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2000,
      position: 'bottom',
      color,
      cssClass: 'modern-toast'
    });
    await toast.present();
  }
}
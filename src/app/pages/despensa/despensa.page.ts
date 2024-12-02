//despensa.page.ts
import { Component, OnInit } from '@angular/core';
import { DespensaService, DespensaItem } from '../../services/despensa.service';
import { ModalController, AlertController, ToastController } from '@ionic/angular';
import { BuscarIngredientePage } from '../buscar-ingredientes/buscar-ingredientes.page';

@Component({
  selector: 'app-despensa',
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/home"></ion-back-button>
        </ion-buttons>
        <ion-title>Mi Despensa</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <ion-list>
        <ion-item *ngFor="let item of ingredientes">
          <ion-label>
            <h2>{{ item.nombre_ingrediente }}</h2>
            <p>Caduca: {{ item.fecha_caducidad.toDate() | date:'dd/MM/yyyy' }}</p>
          </ion-label>
          <ion-button slot="end" color="danger" (click)="eliminarIngrediente(item.id)">
            <ion-icon name="trash"></ion-icon>
          </ion-button>
        </ion-item>
      </ion-list>
      <ion-fab vertical="bottom" horizontal="end" slot="fixed">
        <ion-fab-button (click)="agregarIngrediente()">
          <ion-icon name="add"></ion-icon>
        </ion-fab-button>
      </ion-fab>
    </ion-content>
  `
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

  async agregarIngrediente() {
    const modal = await this.modalCtrl.create({
      component: BuscarIngredientePage
    });
    await modal.present();
    const { data: ingredienteSeleccionado } = await modal.onDidDismiss();
    
    if (ingredienteSeleccionado) {
      const alert = await this.alertCtrl.create({
        header: 'Fecha de caducidad',
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
            role: 'cancel'
          },
          {
            text: 'Guardar',
            handler: async (data) => {
              if (data.fecha_caducidad) {
                try {
                  await this.despensaService.addIngrediente(
                    ingredienteSeleccionado.name,
                    new Date(data.fecha_caducidad)
                  );
                  this.showToast('Ingrediente agregado correctamente');
                } catch (error) {
                  this.showToast('Error al agregar ingrediente');
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
      await this.showToast('Error: ID de ingrediente no válido');
      return;
    }

    try {
      await this.despensaService.deleteIngrediente(id);
      await this.showToast('Ingrediente eliminado correctamente');
    } catch (error) {
      await this.showToast('Error al eliminar ingrediente');
    }
  }

  private async showToast(message: string) {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2000,
      position: 'bottom'
    });
    await toast.present();
  }
}
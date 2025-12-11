import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonButton,
  IonIcon,
  IonFab,
  IonFabButton,
    IonButtons,
    IonBadge,
  AlertController,
  ToastController
} from '@ionic/angular/standalone';
import { add, checkmarkCircle, ellipsisVertical, fitnessOutline, trash, personOutline } from 'ionicons/icons';
import { addIcons } from 'ionicons';
import { TrainingPlanService } from '../../services/training-plan.service';
import { TrainingPlan } from '../../models';

@Component({
  selector: 'app-training-plans',
  templateUrl: './training-plans.page.html',
  styleUrls: ['./training-plans.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent,
    IonButton,
    IonIcon,
    IonFab,
    IonFabButton,
    IonButtons,
    IonBadge
  ]
})
export class TrainingPlansPage implements OnInit {
  trainingPlans: TrainingPlan[] = [];
  loading = false;

  get hasActivePlan(): boolean {
    return this.trainingPlans.some(p => p.isActive);
  }

  constructor(
    private trainingPlanService: TrainingPlanService,
    private router: Router,
    private alertController: AlertController,
    private toastController: ToastController,
    private cdr: ChangeDetectorRef
  ) {
    addIcons({ add, checkmarkCircle, ellipsisVertical, fitnessOutline, trash, personOutline });
  }

  async ngOnInit() {
    await this.loadTrainingPlans();
  }

  async loadTrainingPlans() {
    console.log('=== LOAD TRAINING PLANS START ===');
    this.loading = true;
    this.cdr.detectChanges();
    
    try {
      const plans = await this.trainingPlanService.getAllTrainingPlans();
      console.log('✅ Geladene Trainingspläne:', plans);
      console.log('Typ:', typeof plans);
      console.log('Ist Array?', Array.isArray(plans));
      
      // Sicherstellen, dass es ein Array ist
      this.trainingPlans = Array.isArray(plans) ? plans : [];
      
      console.log('✅ TrainingPlans Array gesetzt:', this.trainingPlans);
      console.log('✅ Anzahl Trainingspläne:', this.trainingPlans.length);
      
      // Debug: Zeige alle Pläne
      if (this.trainingPlans.length > 0) {
        console.log('✅ Erster Plan:', JSON.stringify(this.trainingPlans[0], null, 2));
        console.log('✅ Alle Pläne:', this.trainingPlans.map(p => p.name));
      } else {
        console.warn('⚠️ KEINE TRAININGSPLÄNE GELADEN!');
      }
      
      // Change Detection MEHRMALS erzwingen
      setTimeout(() => {
        this.cdr.detectChanges();
        console.log('✅ Change Detection nach Timeout');
      }, 100);
      
    } catch (error) {
      console.error('❌ Error loading training plans:', error);
      this.showToast('Fehler beim Laden der Trainingspläne', 'danger');
      this.trainingPlans = [];
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
      console.log('=== LOAD TRAINING PLANS END ===');
    }
  }

  trackByPlanId(index: number, plan: TrainingPlan): any {
    return plan.id || index;
  }

  async createTrainingPlan() {
    const alert = await this.alertController.create({
      header: 'Neuer Trainingsplan',
      inputs: [
        {
          name: 'name',
          type: 'text',
          placeholder: 'Name des Trainingsplans',
          attributes: {
            required: true
          }
        },
        {
          name: 'description',
          type: 'textarea',
          placeholder: 'Beschreibung (optional)'
        }
      ],
      buttons: [
        {
          text: 'Abbrechen',
          role: 'cancel'
        },
        {
          text: 'Erstellen',
          handler: async (data) => {
            if (!data || !data.name || data.name.trim() === '') {
              return false;
            }
            
            // Alert schließen und dann erstellen
            setTimeout(async () => {
              try {
                console.log('Erstelle Trainingsplan mit Daten:', data);
                const newPlan: TrainingPlan = {
                  name: data.name.trim(),
                  description: (data.description || '').trim() || '',
                  isActive: false
                };
                console.log('Neuer Plan:', newPlan);
                const created = await this.trainingPlanService.createTrainingPlan(newPlan);
                console.log('Erstellter Plan:', created);
                await this.loadTrainingPlans();
                console.log('Trainingspläne nach dem Laden:', this.trainingPlans);
                this.cdr.detectChanges();
                this.showToast('Trainingsplan erstellt', 'success');
              } catch (error: any) {
                console.error('Error creating training plan:', error);
                const errorMessage = error?.message || 'Unbekannter Fehler beim Erstellen';
                this.showToast(`Fehler: ${errorMessage}`, 'danger');
              }
            }, 100);
            
            return true;
          }
        }
      ]
    });

    await alert.present();
  }

  async setActivePlan(plan: TrainingPlan) {
    if (plan.id) {
      try {
        await this.trainingPlanService.setActiveTrainingPlan(plan.id);
        await this.loadTrainingPlans();
        this.showToast(`${plan.name} ist jetzt aktiv`, 'success');
      } catch (error: any) {
        console.error('Error setting active plan:', error);
        const errorMessage = error?.message || 'Unbekannter Fehler beim Aktivieren';
        this.showToast(`Fehler: ${errorMessage}`, 'danger');
      }
    }
  }

  async deletePlan(plan: TrainingPlan) {
    const alert = await this.alertController.create({
      header: 'Trainingsplan löschen?',
      message: `Möchten Sie "${plan.name}" wirklich löschen?`,
      buttons: [
        {
          text: 'Abbrechen',
          role: 'cancel'
        },
        {
          text: 'Löschen',
          role: 'destructive',
          handler: async () => {
            if (plan.id) {
              try {
                await this.trainingPlanService.deleteTrainingPlan(plan.id);
                await this.loadTrainingPlans();
                this.showToast('Trainingsplan gelöscht', 'success');
              } catch (error: any) {
                console.error('Error deleting training plan:', error);
                const errorMessage = error?.message || 'Unbekannter Fehler beim Löschen';
                this.showToast(`Fehler: ${errorMessage}`, 'danger');
              }
            }
          }
        }
      ]
    });

    await alert.present();
  }

  openPlan(plan: TrainingPlan) {
    if (plan.id) {
      this.router.navigate(['/training-plan', plan.id]);
    }
  }

  async showToast(message: string, color: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      color
    });
    await toast.present();
  }
}


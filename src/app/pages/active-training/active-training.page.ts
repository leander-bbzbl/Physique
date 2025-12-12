import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonList,
  IonItem,
  IonLabel,
  IonButton,
  IonIcon,
  IonButtons,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  ToastController
} from '@ionic/angular/standalone';
import { arrowBack } from 'ionicons/icons';
import { addIcons } from 'ionicons';
import { TrainingPlanService } from '../../services/training-plan.service';
import { NotificationService } from '../../services/notification.service';
import { TrainingPlan, TrainingPlanExercise } from '../../models';

@Component({
  selector: 'app-active-training',
  templateUrl: './active-training.page.html',
  styleUrls: ['./active-training.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonList,
    IonItem,
    IonLabel,
    IonButton,
    IonIcon,
    IonButtons,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle
  ]
})
export class ActiveTrainingPage implements OnInit, OnDestroy {
  activePlan: TrainingPlan | null = null;
  planExercises: TrainingPlanExercise[] = [];
  loading = false;

  constructor(
    private trainingPlanService: TrainingPlanService,
    private notificationService: NotificationService,
    private toastController: ToastController
  ) {
    addIcons({ arrowBack });
  }

  async ngOnInit() {
    // Pausiere Benachrichtigungen während des Trainings
    this.notificationService.pauseNotifications();
    await this.loadActivePlan();
  }

  ngOnDestroy() {
    // Setze Benachrichtigungen fort, wenn die Seite verlassen wird
    this.notificationService.resumeNotifications();
  }

  async loadActivePlan() {
    this.loading = true;
    try {
      this.activePlan = await this.trainingPlanService.getActiveTrainingPlan();
      if (!this.activePlan) {
        this.showToast('Kein aktiver Trainingsplan gefunden', 'warning');
        return;
      }
      if (this.activePlan.id) {
        await this.loadPlanExercises();
      }
    } catch (error) {
      console.error('Error loading active plan:', error);
      this.showToast('Fehler beim Laden des Trainingsplans', 'danger');
    } finally {
      this.loading = false;
    }
  }

  async loadPlanExercises() {
    if (!this.activePlan?.id) return;
    try {
      this.planExercises = await this.trainingPlanService.getExercisesForPlan(this.activePlan.id);
    } catch (error) {
      console.error('Error loading plan exercises:', error);
      this.showToast('Fehler beim Laden der Übungen', 'danger');
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


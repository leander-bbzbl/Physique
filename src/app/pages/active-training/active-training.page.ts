import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
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
  IonBadge,
  IonInput,
  IonCheckbox,
  ToastController,
  AlertController
} from '@ionic/angular/standalone';
import { play, pause, checkmark, arrowBack, stop } from 'ionicons/icons';
import { addIcons } from 'ionicons';
import { TrainingPlanService } from '../../services/training-plan.service';
import { TrainingPlan, TrainingPlanExercise } from '../../models';

interface ExerciseProgress {
  planExercise: TrainingPlanExercise;
  completedSets: boolean[];
  currentSet: number;
  isCompleted: boolean;
}

@Component({
  selector: 'app-active-training',
  templateUrl: './active-training.page.html',
  styleUrls: ['./active-training.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
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
    IonCardTitle,
    IonBadge,
    IonInput,
    IonCheckbox
  ]
})
export class ActiveTrainingPage implements OnInit {
  activePlan: TrainingPlan | null = null;
  planExercises: TrainingPlanExercise[] = [];
  exerciseProgress: ExerciseProgress[] = [];
  isTraining = false;
  currentExerciseIndex = 0;
  restTimer: any = null;
  restTimeRemaining = 0;
  loading = false;

  constructor(
    private trainingPlanService: TrainingPlanService,
    private router: Router,
    private toastController: ToastController,
    private alertController: AlertController
  ) {
    addIcons({ play, pause, checkmark, arrowBack, stop });
  }

  async ngOnInit() {
    await this.loadActivePlan();
  }

  async loadActivePlan() {
    this.loading = true;
    try {
      this.activePlan = await this.trainingPlanService.getActiveTrainingPlan();
      if (!this.activePlan) {
        this.showToast('Kein aktiver Trainingsplan gefunden', 'warning');
        this.router.navigate(['/training-plans']);
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
      this.initializeProgress();
    } catch (error) {
      console.error('Error loading plan exercises:', error);
      this.showToast('Fehler beim Laden der Übungen', 'danger');
    }
  }

  initializeProgress() {
    this.exerciseProgress = this.planExercises.map(planExercise => ({
      planExercise,
      completedSets: new Array(planExercise.sets).fill(false),
      currentSet: 0,
      isCompleted: false
    }));
  }

  startTraining() {
    if (this.planExercises.length === 0) {
      this.showToast('Keine Übungen im Trainingsplan', 'warning');
      return;
    }
    this.isTraining = true;
    this.currentExerciseIndex = 0;
    this.showToast('Training gestartet!', 'success');
  }

  pauseTraining() {
    this.isTraining = false;
    if (this.restTimer) {
      clearInterval(this.restTimer);
      this.restTimer = null;
    }
  }

  async finishTraining() {
    const alert = await this.alertController.create({
      header: 'Training beenden?',
      message: 'Möchten Sie das Training wirklich beenden?',
      buttons: [
        {
          text: 'Abbrechen',
          role: 'cancel'
        },
        {
          text: 'Beenden',
          handler: () => {
            this.isTraining = false;
            this.currentExerciseIndex = 0;
            this.restTimeRemaining = 0;
            if (this.restTimer) {
              clearInterval(this.restTimer);
              this.restTimer = null;
            }
            this.initializeProgress();
            this.showToast('Training beendet', 'success');
          }
        }
      ]
    });

    await alert.present();
  }

  completeSet(exerciseIndex: number, setIndex: number) {
    const progress = this.exerciseProgress[exerciseIndex];
    progress.completedSets[setIndex] = !progress.completedSets[setIndex];
    
    const allSetsCompleted = progress.completedSets.every(completed => completed);
    progress.isCompleted = allSetsCompleted;

    if (allSetsCompleted && exerciseIndex < this.exerciseProgress.length - 1) {
      // Starte Pause-Timer für nächste Übung
      const nextExercise = this.exerciseProgress[exerciseIndex + 1];
      if (nextExercise.planExercise.restSeconds) {
        this.startRestTimer(nextExercise.planExercise.restSeconds);
      }
    }
  }

  startRestTimer(seconds: number) {
    this.restTimeRemaining = seconds;
    this.restTimer = setInterval(() => {
      this.restTimeRemaining--;
      if (this.restTimeRemaining <= 0) {
        clearInterval(this.restTimer);
        this.restTimer = null;
        this.showToast('Pause vorbei! Weiter geht\'s!', 'success');
      }
    }, 1000);
  }

  nextExercise() {
    if (this.currentExerciseIndex < this.exerciseProgress.length - 1) {
      this.currentExerciseIndex++;
    }
  }

  previousExercise() {
    if (this.currentExerciseIndex > 0) {
      this.currentExerciseIndex--;
    }
  }

  getCurrentExercise(): ExerciseProgress | null {
    return this.exerciseProgress[this.currentExerciseIndex] || null;
  }

  getCompletedExercisesCount(): number {
    return this.exerciseProgress.filter(ep => ep.isCompleted).length;
  }

  getCompletedSetsCount(progress: ExerciseProgress): number {
    return progress.completedSets.filter(c => c).length;
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


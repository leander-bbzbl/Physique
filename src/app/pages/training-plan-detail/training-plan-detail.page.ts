import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
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
  IonFab,
  IonFabButton,
  IonButtons,
  IonBackButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonBadge,
  AlertController,
  ToastController
} from '@ionic/angular/standalone';
import { add, create, trash, arrowBack } from 'ionicons/icons';
import { addIcons } from 'ionicons';
import { TrainingPlanService } from '../../services/training-plan.service';
import { ExerciseService } from '../../services/exercise.service';
import { TrainingPlan, TrainingPlanExercise, Exercise } from '../../models';

@Component({
  selector: 'app-training-plan-detail',
  templateUrl: './training-plan-detail.page.html',
  styleUrls: ['./training-plan-detail.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonList,
    IonItem,
    IonLabel,
    IonButton,
    IonIcon,
    IonFab,
    IonFabButton,
    IonButtons,
    IonBackButton,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonBadge
  ]
})
export class TrainingPlanDetailPage implements OnInit {
  planId: string | null = null;
  trainingPlan: TrainingPlan | null = null;
  planExercises: TrainingPlanExercise[] = [];
  allExercises: Exercise[] = [];
  loading = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private trainingPlanService: TrainingPlanService,
    private exerciseService: ExerciseService,
    private alertController: AlertController,
    private toastController: ToastController
  ) {
    addIcons({ add, create, trash, arrowBack });
  }

  async ngOnInit() {
    this.planId = this.route.snapshot.paramMap.get('id');
    if (this.planId) {
      await this.loadPlan();
      await this.loadPlanExercises();
      await this.loadAllExercises();
    }
  }

  async loadPlan() {
    if (!this.planId) return;
    this.loading = true;
    try {
      this.trainingPlan = await this.trainingPlanService.getTrainingPlanById(this.planId);
    } catch (error) {
      console.error('Error loading training plan:', error);
      this.showToast('Fehler beim Laden des Trainingsplans', 'danger');
    } finally {
      this.loading = false;
    }
  }

  async loadPlanExercises() {
    if (!this.planId) return;
    try {
      this.planExercises = await this.trainingPlanService.getExercisesForPlan(this.planId);
    } catch (error) {
      console.error('Error loading plan exercises:', error);
      this.showToast('Fehler beim Laden der Übungen', 'danger');
    }
  }

  async loadAllExercises() {
    try {
      this.allExercises = await this.exerciseService.getAllExercises();
    } catch (error) {
      console.error('Error loading exercises:', error);
    }
  }

  async addExerciseToPlan() {
    if (!this.planId) return;

    const inputs = this.allExercises.map(exercise => ({
      type: 'radio' as const,
      label: exercise.name,
      value: exercise.id,
      checked: false
    }));

    if (inputs.length === 0) {
      this.showToast('Erstellen Sie zuerst Übungen', 'warning');
      this.router.navigate(['/exercises']);
      return;
    }

    const alert = await this.alertController.create({
      header: 'Übung hinzufügen',
      inputs: inputs,
      buttons: [
        {
          text: 'Abbrechen',
          role: 'cancel'
        },
        {
          text: 'Hinzufügen',
          handler: async (exerciseId) => {
            if (exerciseId) {
              const setsAlert = await this.alertController.create({
                header: 'Trainingsdetails',
                inputs: [
                  {
                    name: 'sets',
                    type: 'number',
                    placeholder: 'Anzahl Sätze',
                    value: '3'
                  },
                  {
                    name: 'reps',
                    type: 'number',
                    placeholder: 'Wiederholungen',
                    value: '10'
                  },
                  {
                    name: 'weight',
                    type: 'number',
                    placeholder: 'Gewicht (kg, optional)'
                  },
                  {
                    name: 'restSeconds',
                    type: 'number',
                    placeholder: 'Pause (Sekunden, optional)',
                    value: '60'
                  }
                ],
                buttons: [
                  {
                    text: 'Abbrechen',
                    role: 'cancel'
                  },
                  {
                    text: 'Hinzufügen',
                    handler: async (data) => {
                      try {
                        const newPlanExercise: TrainingPlanExercise = {
                          training_plan_id: this.planId!,
                          exercise_id: exerciseId,
                          sets: parseInt(data.sets) || 3,
                          reps: parseInt(data.reps) || 10,
                          weight: data.weight ? parseFloat(data.weight) : undefined,
                          restSeconds: data.restSeconds ? parseInt(data.restSeconds) : undefined,
                          order: this.planExercises.length
                        };
                        await this.trainingPlanService.addExerciseToPlan(newPlanExercise);
                        await this.loadPlanExercises();
                        this.showToast('Übung hinzugefügt', 'success');
                      } catch (error) {
                        console.error('Error adding exercise:', error);
                        this.showToast('Fehler beim Hinzufügen', 'danger');
                      }
                    }
                  }
                ]
              });
              await setsAlert.present();
            }
          }
        }
      ]
    });

    await alert.present();
  }

  async removeExercise(exercise: TrainingPlanExercise) {
    const alert = await this.alertController.create({
      header: 'Übung entfernen?',
      message: `Möchten Sie "${exercise.exercise?.name}" aus dem Plan entfernen?`,
      buttons: [
        {
          text: 'Abbrechen',
          role: 'cancel'
        },
        {
          text: 'Entfernen',
          role: 'destructive',
          handler: async () => {
            if (exercise.id) {
              try {
                await this.trainingPlanService.removeExerciseFromPlan(exercise.id);
                await this.loadPlanExercises();
                this.showToast('Übung entfernt', 'success');
              } catch (error) {
                console.error('Error removing exercise:', error);
                this.showToast('Fehler beim Entfernen', 'danger');
              }
            }
          }
        }
      ]
    });

    await alert.present();
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


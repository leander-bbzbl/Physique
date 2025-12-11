import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
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
  IonFab,
  IonFabButton,
  IonButtons,
  IonSearchbar,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonBadge,
  AlertController,
  ToastController
} from '@ionic/angular/standalone';
import { add, create, trash, arrowBack, fitness, barbellOutline, personOutline } from 'ionicons/icons';
import { addIcons } from 'ionicons';
import { ExerciseService } from '../../services/exercise.service';
import { Exercise } from '../../models';

@Component({
  selector: 'app-exercises',
  templateUrl: './exercises.page.html',
  styleUrls: ['./exercises.page.scss'],
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
    IonFab,
    IonFabButton,
    IonButtons,
    IonSearchbar,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonBadge
  ]
})
export class ExercisesPage implements OnInit {
  exercises: Exercise[] = [];
  filteredExercises: Exercise[] = [];
  searchTerm = '';
  loading = false;

  constructor(
    private exerciseService: ExerciseService,
    private router: Router,
    private alertController: AlertController,
    private toastController: ToastController,
    private cdr: ChangeDetectorRef
  ) {
    addIcons({ add, create, trash, fitness, barbellOutline, personOutline });
  }

  async ngOnInit() {
    await this.loadExercises();
  }

  async loadExercises() {
    console.log('=== LOAD EXERCISES START ===');
    this.loading = true;
    this.cdr.detectChanges();
    
    try {
      const exercises = await this.exerciseService.getAllExercises();
      console.log('✅ Geladene Übungen:', exercises);
      console.log('Typ:', typeof exercises);
      console.log('Ist Array?', Array.isArray(exercises));
      
      // Sicherstellen, dass es ein Array ist
      this.exercises = Array.isArray(exercises) ? exercises : [];
      this.filteredExercises = Array.from(this.exercises); // Neue Array-Instanz
      
      console.log('✅ Exercises Array gesetzt:', this.exercises);
      console.log('✅ Filtered Exercises Array gesetzt:', this.filteredExercises);
      console.log('✅ Anzahl Übungen:', this.exercises.length);
      console.log('✅ Anzahl gefilterte Übungen:', this.filteredExercises.length);
      
      // Debug: Zeige alle Übungen
      if (this.exercises.length > 0) {
        console.log('✅ Erste Übung:', JSON.stringify(this.exercises[0], null, 2));
        console.log('✅ Alle Übungen:', this.exercises.map(e => e.name));
      } else {
        console.warn('⚠️ KEINE ÜBUNGEN GELADEN!');
      }
      
      // Change Detection MEHRMALS erzwingen
      setTimeout(() => {
        this.cdr.detectChanges();
        console.log('✅ Change Detection nach Timeout');
      }, 100);
      
    } catch (error) {
      console.error('❌ Error loading exercises:', error);
      this.showToast('Fehler beim Laden der Übungen', 'danger');
      this.exercises = [];
      this.filteredExercises = [];
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
      console.log('=== LOAD EXERCISES END ===');
    }
  }

  trackByExerciseId(index: number, exercise: Exercise): any {
    return exercise.id || index;
  }

  filterExercises(event: any) {
    const searchTerm = event?.detail?.value?.toLowerCase() || '';
    this.searchTerm = event?.detail?.value || '';
    
    if (!searchTerm || searchTerm.trim() === '') {
      // Wenn keine Suche, zeige alle Übungen
      this.filteredExercises = [...this.exercises];
    } else {
      // Filtere die Übungen
      this.filteredExercises = this.exercises.filter(exercise =>
        exercise.name.toLowerCase().includes(searchTerm) ||
        (exercise.description && exercise.description.toLowerCase().includes(searchTerm)) ||
        (exercise.muscleGroups && exercise.muscleGroups.some(mg => mg.toLowerCase().includes(searchTerm)))
      );
    }
    
    console.log('Filter angewendet. SearchTerm:', this.searchTerm);
    console.log('Gefilterte Übungen:', this.filteredExercises.length);
    this.cdr.detectChanges();
  }

  clearSearch() {
    this.searchTerm = '';
    this.filteredExercises = [...this.exercises];
    this.cdr.detectChanges();
  }

  async createExercise() {
    const alert = await this.alertController.create({
      header: 'Neue Übung',
      inputs: [
        {
          name: 'name',
          type: 'text',
          placeholder: 'Name der Übung',
          attributes: {
            required: true
          }
        },
        {
          name: 'description',
          type: 'textarea',
          placeholder: 'Beschreibung (optional)'
        },
        {
          name: 'muscleGroups',
          type: 'text',
          placeholder: 'Muskelgruppen (kommagetrennt, optional)'
        },
        {
          name: 'equipment',
          type: 'text',
          placeholder: 'Gerät/Ausrüstung (optional)'
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
                console.log('Erstelle Übung mit Daten:', data);
                const newExercise: Exercise = {
                  name: data.name.trim(),
                  description: (data.description || '').trim() || undefined,
                  muscleGroups: data.muscleGroups && data.muscleGroups.trim()
                    ? data.muscleGroups.split(',').map((mg: string) => mg.trim()).filter((mg: string) => mg)
                    : undefined,
                  equipment: (data.equipment || '').trim() || undefined
                };
                console.log('Neue Übung:', newExercise);
                const created = await this.exerciseService.createExercise(newExercise);
                console.log('Erstellte Übung:', created);
                await this.loadExercises();
                console.log('Übungen nach dem Laden:', this.exercises);
                
                // Stelle sicher, dass filteredExercises aktualisiert wird
                if (this.searchTerm && this.searchTerm.trim() !== '') {
                  // Wenn eine Suche aktiv ist, filtere erneut
                  const searchTermLower = this.searchTerm.toLowerCase();
                  this.filteredExercises = this.exercises.filter(exercise =>
                    exercise.name.toLowerCase().includes(searchTermLower) ||
                    (exercise.description && exercise.description.toLowerCase().includes(searchTermLower)) ||
                    (exercise.muscleGroups && exercise.muscleGroups.some(mg => mg.toLowerCase().includes(searchTermLower)))
                  );
                } else {
                  // Wenn keine Suche, zeige alle
                  this.filteredExercises = [...this.exercises];
                }
                
                console.log('Filtered Exercises nach Erstellen:', this.filteredExercises.length);
                this.cdr.detectChanges();
                this.showToast('Übung erstellt', 'success');
              } catch (error: any) {
                console.error('Error creating exercise:', error);
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

  async editExercise(exercise: Exercise) {
    const alert = await this.alertController.create({
      header: 'Übung bearbeiten',
      inputs: [
        {
          name: 'name',
          type: 'text',
          placeholder: 'Name der Übung',
          value: exercise.name,
          attributes: {
            required: true
          }
        },
        {
          name: 'description',
          type: 'textarea',
          placeholder: 'Beschreibung (optional)',
          value: exercise.description
        },
        {
          name: 'muscleGroups',
          type: 'text',
          placeholder: 'Muskelgruppen (kommagetrennt, optional)',
          value: exercise.muscleGroups?.join(', ')
        },
        {
          name: 'equipment',
          type: 'text',
          placeholder: 'Gerät/Ausrüstung (optional)',
          value: exercise.equipment
        }
      ],
      buttons: [
        {
          text: 'Abbrechen',
          role: 'cancel'
        },
        {
          text: 'Speichern',
          handler: async (data) => {
            if (data.name && exercise.id) {
              try {
                const updatedExercise: Partial<Exercise> = {
                  name: data.name,
                  description: data.description || undefined,
                  muscleGroups: data.muscleGroups
                    ? data.muscleGroups.split(',').map((mg: string) => mg.trim()).filter((mg: string) => mg)
                    : undefined,
                  equipment: data.equipment || undefined
                };
                await this.exerciseService.updateExercise(exercise.id, updatedExercise);
                await this.loadExercises();
                this.showToast('Übung aktualisiert', 'success');
              } catch (error: any) {
                console.error('Error updating exercise:', error);
                const errorMessage = error?.message || 'Unbekannter Fehler beim Aktualisieren';
                this.showToast(`Fehler: ${errorMessage}`, 'danger');
              }
            }
          }
        }
      ]
    });

    await alert.present();
  }

  async deleteExercise(exercise: Exercise) {
    const alert = await this.alertController.create({
      header: 'Übung löschen?',
      message: `Möchten Sie "${exercise.name}" wirklich löschen?`,
      buttons: [
        {
          text: 'Abbrechen',
          role: 'cancel'
        },
        {
          text: 'Löschen',
          role: 'destructive',
          handler: async () => {
            if (exercise.id) {
              try {
                await this.exerciseService.deleteExercise(exercise.id);
                await this.loadExercises();
                this.showToast('Übung gelöscht', 'success');
              } catch (error: any) {
                console.error('Error deleting exercise:', error);
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

  async showToast(message: string, color: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      color
    });
    await toast.present();
  }
}


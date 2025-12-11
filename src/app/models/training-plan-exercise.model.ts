import { Exercise } from './exercise.model';

export interface TrainingPlanExercise {
  id?: string;
  training_plan_id: string;
  exercise_id: string;
  exercise?: Exercise;
  sets: number;
  reps: number;
  weight?: number;
  restSeconds?: number;
  order: number;
  notes?: string;
  created_at?: string;
}


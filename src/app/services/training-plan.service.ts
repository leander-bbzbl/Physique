import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { TrainingPlan, TrainingPlanExercise, Exercise } from '../models';

@Injectable({
  providedIn: 'root'
})
export class TrainingPlanService {
  private tableName = 'training_plans';
  private planExerciseTableName = 'training_plan_exercises';

  constructor(private supabase: SupabaseService) {}

  async getAllTrainingPlans(): Promise<TrainingPlan[]> {
    if (!this.supabase.isConfigured) {
      console.warn('⚠️ Supabase nicht konfiguriert - gebe leere Liste zurück');
      return [];
    }
    
    try {
      console.log('🔍 Lade Trainingspläne von Tabelle:', this.tableName);
      const { data, error } = await this.supabase.client
        .from(this.tableName)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Supabase Fehler beim Laden:', error);
        console.error('Fehler-Code:', error.code);
        console.error('Fehler-Message:', error.message);
        console.error('Fehler-Details:', error.details);
        console.error('Fehler-Hint:', error.hint);
        throw error;
      }
      
      console.log('✓ Daten geladen:', data);
      console.log('Anzahl Zeilen:', data?.length || 0);
      
      // Konvertiere Datenbank-Felder zu Model-Feldern
      const plans = (data || []).map((plan: any) => ({
        ...plan,
        isActive: plan.is_active || false
      }));
      
      console.log('✓ Konvertierte Pläne:', plans);
      return plans;
    } catch (error: any) {
      console.error('❌ Fehler beim Laden der Trainingspläne:', error);
      console.error('Fehler-Stack:', error.stack);
      return [];
    }
  }

  async getTrainingPlanById(id: string): Promise<TrainingPlan | null> {
    if (!this.supabase.isConfigured) {
      return null;
    }
    
    try {
      const { data, error } = await this.supabase.client
        .from(this.tableName)
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Supabase Fehler beim Laden:', error);
        throw error;
      }
      
      if (!data) return null;
      
      // Konvertiere Datenbank-Felder zu Model-Feldern
      return {
        ...data,
        isActive: data.is_active || false
      };
    } catch (error) {
      console.error('Fehler beim Laden des Trainingsplans:', error);
      return null;
    }
  }

  async getActiveTrainingPlan(): Promise<TrainingPlan | null> {
    if (!this.supabase.isConfigured) {
      return null;
    }
    
    try {
      const { data, error } = await this.supabase.client
        .from(this.tableName)
        .select('*')
        .eq('is_active', true)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Fehler beim Laden des aktiven Plans:', error);
        throw error;
      }
      
      if (!data) return null;
      
      // Konvertiere Datenbank-Felder zu Model-Feldern
      return {
        ...data,
        isActive: data.is_active || false
      };
    } catch (error) {
      console.error('Fehler beim Laden des aktiven Trainingsplans:', error);
      return null;
    }
  }

  async createTrainingPlan(plan: TrainingPlan): Promise<TrainingPlan> {
    if (!this.supabase.isConfigured) {
      throw new Error('Supabase nicht konfiguriert');
    }
    
    try {
      const planData: any = {
        name: plan.name,
        description: plan.description || null,
        is_active: plan.isActive || false
      };

      console.log('🔍 Erstelle Trainingsplan in Tabelle:', this.tableName);
      console.log('Daten:', planData);
      
      const { data, error } = await this.supabase.client
        .from(this.tableName)
        .insert(planData)
        .select()
        .single();

      if (error) {
        console.error('❌ Supabase Fehler beim Erstellen:', error);
        console.error('Fehler-Code:', error.code);
        console.error('Fehler-Message:', error.message);
        console.error('Fehler-Details:', error.details);
        console.error('Fehler-Hint:', error.hint);
        throw new Error(`Fehler beim Erstellen: ${error.message} (Code: ${error.code})`);
      }
      
      console.log('✓ Trainingsplan erstellt:', data);
      
      // Konvertiere Datenbank-Felder zu Model-Feldern
      return {
        ...data,
        isActive: data.is_active || false
      };
    } catch (error: any) {
      console.error('Fehler beim Erstellen des Trainingsplans:', error);
      throw error;
    }
  }

  async updateTrainingPlan(id: string, plan: Partial<TrainingPlan>): Promise<TrainingPlan> {
    if (!this.supabase.isConfigured) {
      throw new Error('Supabase nicht konfiguriert');
    }
    
    try {
      const updateData: any = {};
      if (plan.name !== undefined) updateData.name = plan.name;
      if (plan.description !== undefined) updateData.description = plan.description || null;
      if (plan.isActive !== undefined) updateData.is_active = plan.isActive;

      const { data, error } = await this.supabase.client
        .from(this.tableName)
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Supabase Fehler beim Aktualisieren:', error);
        throw error;
      }
      
      // Konvertiere Datenbank-Felder zu Model-Feldern
      return {
        ...data,
        isActive: data.is_active || false
      };
    } catch (error: any) {
      console.error('Fehler beim Aktualisieren des Trainingsplans:', error);
      throw error;
    }
  }

  async deleteTrainingPlan(id: string): Promise<void> {
    if (!this.supabase.isConfigured) {
      throw new Error('Supabase nicht konfiguriert');
    }
    
    const { error } = await this.supabase.client
      .from(this.tableName)
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  async setActiveTrainingPlan(id: string): Promise<void> {
    if (!this.supabase.isConfigured) {
      throw new Error('Supabase nicht konfiguriert');
    }
    
    try {
      // Setze alle anderen Pläne auf inaktiv
      const { error: error1 } = await this.supabase.client
        .from(this.tableName)
        .update({ is_active: false })
        .neq('id', id);
      
      if (error1) {
        console.error('Fehler beim Deaktivieren anderer Pläne:', error1);
        throw error1;
      }

      // Setze den gewählten Plan auf aktiv
      const { error: error2 } = await this.supabase.client
        .from(this.tableName)
        .update({ is_active: true })
        .eq('id', id);
      
      if (error2) {
        console.error('Fehler beim Aktivieren des Plans:', error2);
        throw error2;
      }
    } catch (error: any) {
      console.error('Fehler beim Setzen des aktiven Plans:', error);
      throw error;
    }
  }

  async getExercisesForPlan(planId: string): Promise<TrainingPlanExercise[]> {
    if (!this.supabase.isConfigured) {
      return [];
    }
    
    try {
      const { data, error } = await this.supabase.client
        .from(this.planExerciseTableName)
        .select(`
          *,
          exercise:exercises(*)
        `)
        .eq('training_plan_id', planId)
        .order('order');

      if (error) {
        console.error('❌ Fehler beim Laden der Plan-Übungen:', error);
        throw error;
      }

      // Konvertiere Datenbank-Felder zu Model-Feldern
      return (data || []).map((item: any) => ({
        ...item,
        restSeconds: item.rest_seconds || undefined
      }));
    } catch (error) {
      console.error('Fehler beim Laden der Plan-Übungen:', error);
      return [];
    }
  }

  async addExerciseToPlan(planExercise: TrainingPlanExercise): Promise<TrainingPlanExercise> {
    if (!this.supabase.isConfigured) {
      throw new Error('Supabase nicht konfiguriert');
    }
    
    try {
      // Konvertiere zu Supabase-Format (snake_case)
      const planExerciseData: any = {
        training_plan_id: planExercise.training_plan_id,
        exercise_id: planExercise.exercise_id,
        sets: planExercise.sets,
        reps: planExercise.reps,
        weight: planExercise.weight || null,
        rest_seconds: planExercise.restSeconds || null,
        order: planExercise.order || 0,
        notes: planExercise.notes || null
      };

      console.log('🔍 Füge Übung zum Plan hinzu:', planExerciseData);

      const { data, error } = await this.supabase.client
        .from(this.planExerciseTableName)
        .insert(planExerciseData)
        .select(`
          *,
          exercise:exercises(*)
        `)
        .single();

      if (error) {
        console.error('❌ Supabase Fehler beim Hinzufügen:', error);
        console.error('Fehler-Code:', error.code);
        console.error('Fehler-Message:', error.message);
        console.error('Fehler-Details:', error.details);
        console.error('Fehler-Hint:', error.hint);
        throw error;
      }

      console.log('✅ Übung erfolgreich hinzugefügt:', data);
      
      // Konvertiere zurück zu Model-Format
      return {
        ...data,
        restSeconds: data.rest_seconds || undefined
      };
    } catch (error: any) {
      console.error('❌ Fehler beim Hinzufügen der Übung zum Plan:', error);
      throw error;
    }
  }

  async updatePlanExercise(id: string, planExercise: Partial<TrainingPlanExercise>): Promise<TrainingPlanExercise> {
    if (!this.supabase.isConfigured) {
      throw new Error('Supabase nicht konfiguriert');
    }
    
    const { data, error } = await this.supabase.client
      .from(this.planExerciseTableName)
      .update(planExercise)
      .eq('id', id)
      .select(`
        *,
        exercise:exercises(*)
      `)
      .single();

    if (error) throw error;
    return data;
  }

  async removeExerciseFromPlan(id: string): Promise<void> {
    if (!this.supabase.isConfigured) {
      throw new Error('Supabase nicht konfiguriert');
    }
    
    const { error } = await this.supabase.client
      .from(this.planExerciseTableName)
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
}


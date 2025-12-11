import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Exercise } from '../models';

@Injectable({
  providedIn: 'root'
})
export class ExerciseService {
  private tableName = 'exercises';

  constructor(private supabase: SupabaseService) {}

  async getAllExercises(): Promise<Exercise[]> {
    if (!this.supabase.isConfigured) {
      console.warn('⚠️ Supabase nicht konfiguriert - gebe leere Liste zurück');
      return [];
    }
    
    try {
      console.log('🔍 Lade Übungen von Tabelle:', this.tableName);
      const { data, error } = await this.supabase.client
        .from(this.tableName)
        .select('*')
        .order('name');

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
      const exercises = (data || []).map((exercise: any) => ({
        ...exercise,
        muscleGroups: exercise.muscle_groups || undefined,
        imageUrl: exercise.image_url || undefined
      }));
      
      console.log('✓ Konvertierte Übungen:', exercises);
      return exercises;
    } catch (error: any) {
      console.error('❌ Fehler beim Laden der Übungen:', error);
      console.error('Fehler-Stack:', error.stack);
      return [];
    }
  }

  async getExerciseById(id: string): Promise<Exercise | null> {
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
      const exercise: any = { ...data };
      exercise.muscleGroups = data.muscle_groups || undefined;
      exercise.imageUrl = data.image_url || undefined;
      
      return exercise;
    } catch (error) {
      console.error('Fehler beim Laden der Übung:', error);
      return null;
    }
  }

  async createExercise(exercise: Exercise): Promise<Exercise> {
    if (!this.supabase.isConfigured) {
      throw new Error('Supabase nicht konfiguriert');
    }
    
    try {
      // Supabase unterstützt Arrays direkt, keine JSON-Konvertierung nötig
      const exerciseData: any = {
        name: exercise.name,
        description: exercise.description || null,
        muscle_groups: exercise.muscleGroups && exercise.muscleGroups.length > 0 ? exercise.muscleGroups : null,
        equipment: exercise.equipment || null,
        image_url: exercise.imageUrl || null
      };

      console.log('🔍 Erstelle Übung in Tabelle:', this.tableName);
      console.log('Daten:', exerciseData);
      
      const { data, error } = await this.supabase.client
        .from(this.tableName)
        .insert(exerciseData)
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
      
      console.log('✓ Übung erstellt:', data);
      
      // Konvertiere Datenbank-Felder zu Model-Feldern
      const result: any = { ...data };
      result.muscleGroups = data.muscle_groups || undefined;
      result.imageUrl = data.image_url || undefined;
      
      return result;
    } catch (error: any) {
      console.error('Fehler beim Erstellen der Übung:', error);
      throw error;
    }
  }

  async updateExercise(id: string, exercise: Partial<Exercise>): Promise<Exercise> {
    if (!this.supabase.isConfigured) {
      throw new Error('Supabase nicht konfiguriert');
    }
    
    try {
      const updateData: any = {};
      if (exercise.name !== undefined) updateData.name = exercise.name;
      if (exercise.description !== undefined) updateData.description = exercise.description || null;
      if (exercise.muscleGroups !== undefined) {
        updateData.muscle_groups = exercise.muscleGroups && exercise.muscleGroups.length > 0 ? exercise.muscleGroups : null;
      }
      if (exercise.equipment !== undefined) updateData.equipment = exercise.equipment || null;
      if (exercise.imageUrl !== undefined) updateData.image_url = exercise.imageUrl || null;

      const { data, error } = await this.supabase.client
        .from(this.tableName)
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Supabase Fehler beim Aktualisieren:', error);
        throw new Error(`Fehler beim Aktualisieren: ${error.message}`);
      }
      
      // Konvertiere Datenbank-Felder zu Model-Feldern
      const result: any = { ...data };
      result.muscleGroups = data.muscle_groups || undefined;
      result.imageUrl = data.image_url || undefined;
      
      return result;
    } catch (error: any) {
      console.error('Fehler beim Aktualisieren der Übung:', error);
      throw error;
    }
  }

  async deleteExercise(id: string): Promise<void> {
    if (!this.supabase.isConfigured) {
      throw new Error('Supabase nicht konfiguriert');
    }
    
    const { error } = await this.supabase.client
      .from(this.tableName)
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
}


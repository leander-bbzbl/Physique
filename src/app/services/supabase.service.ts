import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient | null = null;

  constructor() {
    // Nur initialisieren, wenn gültige Credentials vorhanden sind
    if (environment.supabaseUrl && 
        environment.supabaseKey && 
        environment.supabaseUrl !== 'YOUR_SUPABASE_URL' &&
        environment.supabaseKey !== 'YOUR_SUPABASE_ANON_KEY') {
      try {
        this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey);
      } catch (error) {
        console.error('Fehler beim Initialisieren von Supabase:', error);
      }
    } else {
      console.warn('Supabase-Credentials nicht konfiguriert. Bitte in environment.ts eintragen.');
    }
  }

  get client(): SupabaseClient {
    if (!this.supabase) {
      throw new Error('Supabase ist nicht initialisiert. Bitte Credentials in environment.ts konfigurieren.');
    }
    return this.supabase;
  }

  get isConfigured(): boolean {
    return this.supabase !== null;
  }

  async testConnection(): Promise<boolean> {
    if (!this.supabase) {
      console.error('❌ Supabase nicht initialisiert');
      return false;
    }
    
    try {
      console.log('🔍 Teste Supabase-Verbindung...');
      console.log('URL:', environment.supabaseUrl);
      
      // Test 1: Versuche eine einfache Query auf exercises
      const { data: exercisesData, error: exercisesError } = await this.supabase
        .from('exercises')
        .select('id')
        .limit(1);
      
      if (exercisesError) {
        console.error('❌ Fehler bei exercises Tabelle:', exercisesError);
        console.error('Fehler-Code:', exercisesError.code);
        console.error('Fehler-Message:', exercisesError.message);
        console.error('Fehler-Details:', exercisesError.details);
        console.error('Fehler-Hint:', exercisesError.hint);
      } else {
        console.log('✓ exercises Tabelle erreichbar');
      }
      
      // Test 2: Versuche eine einfache Query auf training_plans
      const { data: plansData, error: plansError } = await this.supabase
        .from('training_plans')
        .select('id')
        .limit(1);
      
      if (plansError) {
        console.error('❌ Fehler bei training_plans Tabelle:', plansError);
        console.error('Fehler-Code:', plansError.code);
        console.error('Fehler-Message:', plansError.message);
        console.error('Fehler-Details:', plansError.details);
        console.error('Fehler-Hint:', plansError.hint);
      } else {
        console.log('✓ training_plans Tabelle erreichbar');
      }
      
      // Wenn beide Tests erfolgreich sind oder nur "keine Zeilen" Fehler
      const hasExercisesError = exercisesError && exercisesError.code !== 'PGRST116';
      const hasPlansError = plansError && plansError.code !== 'PGRST116';
      
      if (hasExercisesError || hasPlansError) {
        console.error('❌ Supabase Verbindung fehlgeschlagen');
        return false;
      }
      
      console.log('✓✓✓ Supabase Verbindung erfolgreich - Alle Tabellen erreichbar');
      return true;
    } catch (error: any) {
      console.error('❌ Unerwarteter Fehler beim Testen der Supabase-Verbindung:', error);
      console.error('Fehler-Stack:', error.stack);
      return false;
    }
  }
}


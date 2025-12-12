import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';

export interface UserProfile {
  id?: string;
  user_id: string;
  profile_image_url?: string;
  created_at?: string;
  updated_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private tableName = 'user_profiles';

  constructor(private supabaseService: SupabaseService) {}

  /**
   * Lädt das Profilbild des aktuellen Benutzers
   */
  async getProfileImage(): Promise<string | null> {
    if (!this.supabaseService.isConfigured) {
      console.warn('Supabase nicht konfiguriert');
      return null;
    }

    try {
      const { data: { user } } = await this.supabaseService.client.auth.getUser();
      if (!user) {
        return null;
      }

      const { data, error } = await this.supabaseService.client
        .from(this.tableName)
        .select('profile_image_url')
        .eq('user_id', user.id)
        .single();

      if (error) {
        // Wenn kein Profil existiert, ist das kein Fehler
        if (error.code === 'PGRST116') {
          return null;
        }
        console.error('Fehler beim Laden des Profilbilds:', error);
        return null;
      }

      return data?.profile_image_url || null;
    } catch (error) {
      console.error('Fehler beim Laden des Profilbilds:', error);
      return null;
    }
  }

  /**
   * Speichert das Profilbild des aktuellen Benutzers
   */
  async saveProfileImage(imageDataUrl: string): Promise<boolean> {
    if (!this.supabaseService.isConfigured) {
      console.warn('Supabase nicht konfiguriert');
      return false;
    }

    try {
      const { data: { user } } = await this.supabaseService.client.auth.getUser();
      if (!user) {
        console.error('Kein Benutzer angemeldet');
        return false;
      }

      // Prüfe ob bereits ein Profil existiert
      const { data: existingProfile, error: selectError } = await this.supabaseService.client
        .from(this.tableName)
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle(); // maybeSingle() statt single() um keinen Fehler zu werfen wenn kein Eintrag existiert

      if (selectError && selectError.code !== 'PGRST116') {
        // Fehler beim Abfragen (außer "kein Eintrag gefunden")
        console.error('Fehler beim Prüfen des Profils:', selectError);
        console.error('Fehler-Code:', selectError.code);
        console.error('Fehler-Message:', selectError.message);
        console.error('Fehler-Details:', selectError.details);
        console.error('Fehler-Hint:', selectError.hint);
        
        // Wenn die Tabelle nicht existiert, ist das ein kritisches Problem
        if (selectError.code === '42P01' || selectError.message?.includes('does not exist')) {
          console.error('❌ FEHLER: Die Tabelle "user_profiles" existiert nicht!');
          console.error('Bitte führe das SQL-Script "supabase_user_profiles.sql" in deiner Supabase-Datenbank aus.');
        }
        return false;
      }

      if (existingProfile) {
        // Update vorhandenes Profil
        const { error } = await this.supabaseService.client
          .from(this.tableName)
          .update({ profile_image_url: imageDataUrl })
          .eq('user_id', user.id);

        if (error) {
          console.error('Fehler beim Aktualisieren des Profilbilds:', error);
          console.error('Fehler-Code:', error.code);
          console.error('Fehler-Message:', error.message);
          console.error('Fehler-Details:', error.details);
          return false;
        }
        console.log('✓ Profilbild erfolgreich aktualisiert in Supabase');
      } else {
        // Erstelle neues Profil
        const { error } = await this.supabaseService.client
          .from(this.tableName)
          .insert({
            user_id: user.id,
            profile_image_url: imageDataUrl
          });

        if (error) {
          console.error('Fehler beim Erstellen des Profils:', error);
          console.error('Fehler-Code:', error.code);
          console.error('Fehler-Message:', error.message);
          console.error('Fehler-Details:', error.details);
          console.error('Fehler-Hint:', error.hint);
          
          // Wenn die Tabelle nicht existiert, ist das ein kritisches Problem
          if (error.code === '42P01' || error.message?.includes('does not exist')) {
            console.error('❌ FEHLER: Die Tabelle "user_profiles" existiert nicht!');
            console.error('Bitte führe das SQL-Script "supabase_user_profiles.sql" in deiner Supabase-Datenbank aus.');
          }
          return false;
        }
        console.log('✓ Profilbild erfolgreich in Supabase gespeichert');
      }

      return true;
    } catch (error) {
      console.error('Fehler beim Speichern des Profilbilds:', error);
      return false;
    }
  }

  /**
   * Löscht das Profilbild des aktuellen Benutzers
   */
  async deleteProfileImage(): Promise<boolean> {
    if (!this.supabaseService.isConfigured) {
      console.warn('Supabase nicht konfiguriert');
      return false;
    }

    try {
      const { data: { user } } = await this.supabaseService.client.auth.getUser();
      if (!user) {
        console.error('Kein Benutzer angemeldet');
        return false;
      }

      const { error } = await this.supabaseService.client
        .from(this.tableName)
        .update({ profile_image_url: null })
        .eq('user_id', user.id);

      if (error) {
        console.error('Fehler beim Löschen des Profilbilds:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Fehler beim Löschen des Profilbilds:', error);
      return false;
    }
  }
}


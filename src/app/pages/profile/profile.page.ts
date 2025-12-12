import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButton,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonAvatar,
  IonButtons,
  IonToggle,
  ToastController
} from '@ionic/angular/standalone';
import { 
  personOutline, 
  settingsOutline,
  personCircleOutline,
  moonOutline,
  cameraOutline
} from 'ionicons/icons';
import { addIcons } from 'ionicons';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { SupabaseService } from '../../services/supabase.service';
import { ThemeService } from '../../services/theme.service';
import { ProfileService } from '../../services/profile.service';
import { Platform } from '@ionic/angular/standalone';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonButton,
    IonIcon,
    IonItem,
    IonLabel,
    IonList,
    IonAvatar,
    IonButtons,
    IonToggle
  ],
  providers: [ToastController]
})
export class ProfilePage implements OnInit {
  userEmail: string = '';
  userName: string = '';
  isDarkMode: boolean = true;
  profileImageUrl: string | null = null;

  constructor(
    private supabaseService: SupabaseService,
    private themeService: ThemeService,
    private profileService: ProfileService,
    private toastController: ToastController,
    private platform: Platform
  ) {
    addIcons({ 
      personOutline, 
      settingsOutline,
      personCircleOutline,
      moonOutline,
      cameraOutline
    });
  }

  async ngOnInit() {
    await this.loadUserProfile();
    await this.loadProfileImage();
    this.isDarkMode = this.themeService.getCurrentTheme() === 'dark';
    // Subscribe to theme changes
    this.themeService.theme$.subscribe(theme => {
      this.isDarkMode = theme === 'dark';
    });
  }

  async loadUserProfile() {
    try {
      if (this.supabaseService.isConfigured) {
        const { data: { user } } = await this.supabaseService.client.auth.getUser();
        if (user) {
          this.userEmail = user.email || '';
          this.userName = user.user_metadata?.['full_name'] || user.email?.split('@')[0] || 'Benutzer';
        }
      } else {
        // Fallback für Demo-Zwecke
        this.userEmail = 'demo@example.com';
        this.userName = 'Demo Benutzer';
      }
    } catch (error) {
      console.error('Fehler beim Laden des Profils:', error);
      this.userEmail = 'Nicht verfügbar';
      this.userName = 'Benutzer';
    }
  }

  toggleTheme() {
    this.themeService.toggleTheme();
    this.isDarkMode = this.themeService.getCurrentTheme() === 'dark';
  }

  async showToast(message: string, color: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      color
    });
    await toast.present();
  }

  /**
   * Lädt das gespeicherte Profilbild aus der Datenbank
   */
  async loadProfileImage() {
    try {
      const imageUrl = await this.profileService.getProfileImage();
      if (imageUrl) {
        this.profileImageUrl = imageUrl;
      } else {
        // Fallback: Prüfe localStorage für Migration
        const savedImage = localStorage.getItem('profileImage');
        if (savedImage) {
          // Migriere von localStorage zur Datenbank
          await this.profileService.saveProfileImage(savedImage);
          this.profileImageUrl = savedImage;
          localStorage.removeItem('profileImage'); // Entferne aus localStorage
        }
      }
    } catch (error) {
      console.error('Fehler beim Laden des Profilbilds:', error);
      // Fallback zu localStorage falls Datenbank nicht verfügbar
      const savedImage = localStorage.getItem('profileImage');
      if (savedImage) {
        this.profileImageUrl = savedImage;
      }
    }
  }

  /**
   * Speichert das Profilbild in der Datenbank
   */
  async saveProfileImage(imageDataUrl: string) {
    try {
      // Prüfe ob Supabase konfiguriert ist
      if (!this.supabaseService.isConfigured) {
        console.warn('Supabase nicht konfiguriert - speichere lokal');
        localStorage.setItem('profileImage', imageDataUrl);
        this.profileImageUrl = imageDataUrl;
        this.showToast('Profilbild lokal gespeichert (Supabase nicht konfiguriert)', 'warning');
        return;
      }

      // Prüfe ob Benutzer angemeldet ist
      try {
        const { data: { user } } = await this.supabaseService.client.auth.getUser();
        if (!user) {
          console.warn('Kein Benutzer angemeldet - speichere lokal');
          localStorage.setItem('profileImage', imageDataUrl);
          this.profileImageUrl = imageDataUrl;
          this.showToast('Profilbild lokal gespeichert (Nicht angemeldet)', 'warning');
          return;
        }
      } catch (authError) {
        console.error('Fehler beim Prüfen der Authentifizierung:', authError);
        localStorage.setItem('profileImage', imageDataUrl);
        this.profileImageUrl = imageDataUrl;
        this.showToast('Profilbild lokal gespeichert (Authentifizierungsfehler)', 'warning');
        return;
      }

      // Versuche in Supabase zu speichern
      const success = await this.profileService.saveProfileImage(imageDataUrl);
      if (success) {
        this.profileImageUrl = imageDataUrl;
        // Entferne auch aus localStorage falls vorhanden (Migration)
        localStorage.removeItem('profileImage');
        this.showToast('Profilbild erfolgreich in der Datenbank gespeichert', 'success');
      } else {
        // Fehler beim Speichern in Supabase
        console.error('Fehler beim Speichern in Supabase - möglicherweise fehlt die user_profiles Tabelle');
        localStorage.setItem('profileImage', imageDataUrl);
        this.profileImageUrl = imageDataUrl;
        this.showToast('Fehler: Bitte führe das SQL-Script aus (supabase_user_profiles.sql)', 'danger');
      }
    } catch (error: any) {
      console.error('Fehler beim Speichern des Profilbilds:', error);
      console.error('Fehler-Details:', JSON.stringify(error, null, 2));
      // Fallback zu localStorage
      localStorage.setItem('profileImage', imageDataUrl);
      this.profileImageUrl = imageDataUrl;
      const errorMessage = error?.message || 'Unbekannter Fehler';
      this.showToast(`Fehler: ${errorMessage}. Bitte prüfe die Konsole.`, 'danger');
    }
  }

  /**
   * Öffnet die Kamera oder Galerie, um ein Profilbild aufzunehmen
   */
  async takeProfilePicture() {
    try {
      // Prüfe ob Kamera verfügbar ist
      if (!this.platform.is('capacitor')) {
        // Fallback für Browser: Datei-Input verwenden
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = async (event: any) => {
          const file = event.target.files[0];
          if (file) {
            const reader = new FileReader();
            reader.onload = (e: any) => {
              this.saveProfileImage(e.target.result);
              this.showToast('Profilbild erfolgreich gespeichert', 'success');
            };
            reader.onerror = () => {
              this.showToast('Fehler beim Laden des Bildes', 'danger');
            };
            reader.readAsDataURL(file);
          }
        };
        input.click();
        return;
      }

      // Prüfe ob Camera Plugin verfügbar ist
      if (!Camera) {
        console.error('Camera Plugin nicht verfügbar');
        this.showToast('Kamera-Funktion nicht verfügbar', 'danger');
        return;
      }

      // Auf nativen Plattformen: Kamera verwenden
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: true,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Prompt // Fragt User ob Kamera oder Galerie
      });

      if (image && image.dataUrl) {
        this.saveProfileImage(image.dataUrl);
        this.showToast('Profilbild erfolgreich gespeichert', 'success');
      } else {
        this.showToast('Kein Bild ausgewählt', 'warning');
      }
    } catch (error: any) {
      console.error('Fehler beim Aufnehmen des Fotos:', error);
      console.error('Fehler-Details:', JSON.stringify(error, null, 2));
      
      // Verschiedene Fehlermeldungen behandeln
      const errorMessage = error?.message || error?.toString() || 'Unbekannter Fehler';
      
      if (errorMessage.includes('User cancelled') || errorMessage.includes('cancel')) {
        // User hat abgebrochen - keine Fehlermeldung anzeigen
        return;
      } else if (errorMessage.includes('permission') || errorMessage.includes('Permission')) {
        this.showToast('Kamera-Berechtigung fehlt. Bitte in den Einstellungen aktivieren.', 'danger');
      } else if (errorMessage.includes('not available') || errorMessage.includes('not found')) {
        this.showToast('Kamera nicht verfügbar', 'danger');
      } else {
        this.showToast(`Fehler: ${errorMessage}`, 'danger');
      }
    }
  }
}

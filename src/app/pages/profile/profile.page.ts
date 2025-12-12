import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
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
  AlertController,
  ToastController
} from '@ionic/angular/standalone';
import { 
  personOutline, 
  logOutOutline, 
  settingsOutline,
  personCircleOutline,
  moonOutline,
  cameraOutline
} from 'ionicons/icons';
import { addIcons } from 'ionicons';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { SupabaseService } from '../../services/supabase.service';
import { ThemeService } from '../../services/theme.service';
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
  providers: [AlertController, ToastController]
})
export class ProfilePage implements OnInit {
  userEmail: string = '';
  userName: string = '';
  isDarkMode: boolean = true;
  profileImageUrl: string | null = null;

  constructor(
    private supabaseService: SupabaseService,
    private themeService: ThemeService,
    private router: Router,
    private alertController: AlertController,
    private toastController: ToastController,
    private platform: Platform
  ) {
    addIcons({ 
      personOutline, 
      logOutOutline, 
      settingsOutline,
      personCircleOutline,
      moonOutline,
      cameraOutline
    });
  }

  async ngOnInit() {
    await this.loadUserProfile();
    this.loadProfileImage();
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

  async logout() {
    const alert = await this.alertController.create({
      header: 'Abmelden?',
      message: 'Möchten Sie sich wirklich abmelden?',
      buttons: [
        {
          text: 'Abbrechen',
          role: 'cancel'
        },
        {
          text: 'Abmelden',
          role: 'destructive',
          handler: async () => {
            try {
              if (this.supabaseService.isConfigured) {
                await this.supabaseService.client.auth.signOut();
              }
              this.showToast('Erfolgreich abgemeldet', 'success');
              this.router.navigate(['/training-plans']);
            } catch (error) {
              console.error('Fehler beim Abmelden:', error);
              this.showToast('Fehler beim Abmelden', 'danger');
            }
          }
        }
      ]
    });

    await alert.present();
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
   * Lädt das gespeicherte Profilbild aus dem LocalStorage
   */
  loadProfileImage() {
    const savedImage = localStorage.getItem('profileImage');
    if (savedImage) {
      this.profileImageUrl = savedImage;
    }
  }

  /**
   * Speichert das Profilbild im LocalStorage
   */
  saveProfileImage(imageDataUrl: string) {
    localStorage.setItem('profileImage', imageDataUrl);
    this.profileImageUrl = imageDataUrl;
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

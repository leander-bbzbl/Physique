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
  moonOutline
} from 'ionicons/icons';
import { addIcons } from 'ionicons';
import { SupabaseService } from '../../services/supabase.service';
import { ThemeService } from '../../services/theme.service';

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

  constructor(
    private supabaseService: SupabaseService,
    private themeService: ThemeService,
    private router: Router,
    private alertController: AlertController,
    private toastController: ToastController
  ) {
    addIcons({ 
      personOutline, 
      logOutOutline, 
      settingsOutline,
      personCircleOutline,
      moonOutline
    });
  }

  async ngOnInit() {
    await this.loadUserProfile();
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
}

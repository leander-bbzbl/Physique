import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet, NavigationEnd, Router } from '@angular/router';
import { IonApp, Platform } from '@ionic/angular/standalone';
import { StatusBar, Style } from '@capacitor/status-bar';
import { App } from '@capacitor/app';
import { SupabaseService } from './services/supabase.service';
import { ThemeService } from './services/theme.service';
import { NotificationService } from './services/notification.service';
import { BottomNavComponent } from './components/bottom-nav/bottom-nav.component';
import { filter, Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, IonApp, BottomNavComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'Physique';
  private routerSubscription?: Subscription;

  constructor(
    private supabaseService: SupabaseService,
    private themeService: ThemeService,
    private notificationService: NotificationService,
    private platform: Platform,
    private router: Router
  ) {}

  async ngOnInit() {
    // Initialisiere Theme
    this.themeService.theme$.subscribe(theme => {
      if (this.platform.is('capacitor')) {
        try {
          StatusBar.setStyle({ style: theme === 'dark' ? Style.Dark : Style.Light });
          StatusBar.setOverlaysWebView({ overlay: false });
        } catch (error) {
          console.warn('Status-Bar konnte nicht initialisiert werden:', error);
        }
      }
    });

    // Initialisiere Status-Bar
    if (this.platform.is('capacitor')) {
      try {
        const currentTheme = this.themeService.getCurrentTheme();
        await StatusBar.setStyle({ style: currentTheme === 'dark' ? Style.Dark : Style.Light });
        await StatusBar.setOverlaysWebView({ overlay: false });
      } catch (error) {
        console.warn('Status-Bar konnte nicht initialisiert werden:', error);
      }
    }

    // Teste Supabase-Verbindung beim App-Start
    try {
      if (this.supabaseService.isConfigured) {
        await this.supabaseService.testConnection();
      } else {
        console.warn('⚠ Supabase nicht konfiguriert');
      }
    } catch (error) {
      console.error('Fehler beim Initialisieren der App:', error);
      // App sollte trotzdem weiterlaufen, auch wenn Supabase nicht verfügbar ist
    }

    // Initialisiere Benachrichtigungen
    try {
      await this.notificationService.initialize();
    } catch (error) {
      console.error('Fehler beim Initialisieren der Benachrichtigungen:', error);
      // App sollte trotzdem weiterlaufen, auch wenn Benachrichtigungen nicht verfügbar sind
    }

    // Überwache Navigation, um Benachrichtigungen zu steuern
    this.setupNavigationWatcher();

    // Überwache App Lifecycle Events
    if (this.platform.is('capacitor')) {
      this.setupAppLifecycleWatcher();
    }
  }

  /**
   * Überwacht Navigation, um Benachrichtigungen zu steuern
   */
  private setupNavigationWatcher(): void {
    this.routerSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        const url = event.urlAfterRedirects || event.url;
        
        // Wenn User die active-training Seite verlässt, Benachrichtigungen fortsetzen
        if (!url.includes('/active-training')) {
          // Prüfe ob Benachrichtigungen pausiert waren (z.B. von active-training)
          // und setze sie fort, wenn User eine andere Seite besucht
          this.notificationService.resumeNotifications();
        }
      });
  }

  /**
   * Überwacht App Lifecycle Events (App wird geschlossen/geöffnet)
   */
  private setupAppLifecycleWatcher(): void {
    // Wenn App in den Hintergrund geht, Benachrichtigungen fortsetzen
    App.addListener('appStateChange', ({ isActive }) => {
      if (!isActive) {
        // App geht in den Hintergrund - Benachrichtigungen fortsetzen
        this.notificationService.resumeNotifications();
      }
    });

    // Wenn App wieder aktiv wird, prüfe ob Benachrichtigungen laufen sollten
    App.addListener('appStateChange', ({ isActive }) => {
      if (isActive) {
        // App wird wieder aktiv - prüfe aktuelle Route
        const currentUrl = this.router.url;
        if (!currentUrl.includes('/active-training')) {
          // Nicht auf active-training Seite - Benachrichtigungen sollten laufen
          this.notificationService.resumeNotifications();
        }
      }
    });
  }

  ngOnDestroy() {
    // Cleanup
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }
}


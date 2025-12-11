import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { IonApp, Platform } from '@ionic/angular/standalone';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SupabaseService } from './services/supabase.service';
import { ThemeService } from './services/theme.service';
import { BottomNavComponent } from './components/bottom-nav/bottom-nav.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, IonApp, BottomNavComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'Physique';

  constructor(
    private supabaseService: SupabaseService,
    private themeService: ThemeService,
    private platform: Platform
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
  }
}


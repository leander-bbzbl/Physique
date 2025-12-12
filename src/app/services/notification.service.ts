import { Injectable } from '@angular/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Platform } from '@ionic/angular/standalone';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private intervalId: number | null = null;
  private readonly NOTIFICATION_INTERVAL = 5 * 1000; // 10 Sekunden in Millisekunden
  private readonly NOTIFICATION_ID = 1;

  constructor(private platform: Platform) {}

  /**
   * Initialisiert die Benachrichtigungen und fragt nach Berechtigungen
   */
  async initialize(): Promise<void> {
    // Nur auf nativen Plattformen (nicht im Browser)
    if (!this.platform.is('capacitor')) {
      console.log('Benachrichtigungen werden nur auf nativen Plattformen unterstützt');
      return;
    }

    try {
      // Prüfe ob Berechtigungen vorhanden sind
      const permissionStatus = await LocalNotifications.checkPermissions();
      
      if (permissionStatus.display === 'denied') {
        console.warn('Benachrichtigungs-Berechtigung wurde verweigert');
        return;
      }

      // Frage nach Berechtigung falls noch nicht erteilt
      if (permissionStatus.display !== 'granted') {
        const requestResult = await LocalNotifications.requestPermissions();
        if (requestResult.display !== 'granted') {
          console.warn('Benachrichtigungs-Berechtigung wurde nicht erteilt');
          return;
        }
      }

      // Starte die periodischen Benachrichtigungen
      this.startPeriodicNotifications();
    } catch (error) {
      console.error('Fehler beim Initialisieren der Benachrichtigungen:', error);
    }
  }

  /**
   * Startet die periodischen Benachrichtigungen alle 10 Sekunden
   */
  private startPeriodicNotifications(): void {
    // Stoppe eventuell laufende Benachrichtigungen
    this.stopPeriodicNotifications();

    // Erste Benachrichtigung sofort senden
    this.sendNotification();

    // Dann alle 10 Sekunden
    this.intervalId = window.setInterval(() => {
      this.sendNotification();
    }, this.NOTIFICATION_INTERVAL);

    console.log('Periodische Benachrichtigungen gestartet (alle 5 Sekunden)');
  }

  /**
   * Sendet eine Benachrichtigung an den User
   */
  private async sendNotification(): Promise<void> {
    try {
      await LocalNotifications.schedule({
        notifications: [
          {
            title: 'komm sofort zurück digga',
            body: '',
            id: this.NOTIFICATION_ID,
            sound: 'default',
            attachments: undefined,
            actionTypeId: '',
            extra: null
          }
        ]
      });
    } catch (error) {
      console.error('Fehler beim Senden der Benachrichtigung:', error);
    }
  }

  /**
   * Stoppt die periodischen Benachrichtigungen
   */
  stopPeriodicNotifications(): void {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('Periodische Benachrichtigungen gestoppt');
    }
  }

  /**
   * Prüft ob Benachrichtigungen aktiviert sind
   */
  async isEnabled(): Promise<boolean> {
    if (!this.platform.is('capacitor')) {
      return false;
    }

    try {
      const permissionStatus = await LocalNotifications.checkPermissions();
      return permissionStatus.display === 'granted';
    } catch (error) {
      console.error('Fehler beim Prüfen der Benachrichtigungs-Berechtigung:', error);
      return false;
    }
  }
}


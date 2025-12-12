# Physique - Trainingsplan App

Eine mobile Fitness-App zur Verwaltung von Trainingsplänen und Übungen, entwickelt mit Ionic, Angular und Capacitor.

## Features

- **Trainingspläne verwalten**: Erstelle und verwalte deine Trainingspläne
- **Übungen verwalten**: Erstelle Übungen mit Details zu Muskelgruppen, Geräten und Beschreibungen
- **Aktives Training**: Zeige deinen aktiven Trainingsplan mit allen Übungen an
- **Profil**: Profilbild mit Kamera-Funktion, Dark Mode Toggle
- **Benachrichtigungen**: Erinnerungen zum Training (pausiert während aktiven Trainings)
- **Dark Mode**: Unterstützung für Light und Dark Theme

## Voraussetzungen

Bevor du die App lokal starten kannst, benötigst du:

- **Node.js** (Version 18 oder höher) - [Download](https://nodejs.org/)
- **npm** (wird mit Node.js installiert)
- **Git** - [Download](https://git-scm.com/)

Optional für Android-Build:
- **Android Studio** - [Download](https://developer.android.com/studio)
- **Java JDK** (Version 11 oder höher)

## Installation

1. **Repository klonen**
   ```bash
   git clone <repository-url>
   cd Physique
   ```

2. **Dependencies installieren**
   ```bash
   npm install
   ```

3. **Supabase konfigurieren**

   Die App benötigt eine Supabase-Datenbank. Öffne `src/environments/environment.ts` und trage deine Supabase-Credentials ein:

   ```typescript
   export const environment = {
     production: false,
     supabaseUrl: 'DEINE_SUPABASE_URL',
     supabaseKey: 'DEINE_SUPABASE_ANON_KEY'
   };
   ```

   **Datenbank-Setup:**
   
   Führe die SQL-Scripts in deiner Supabase-Datenbank aus:
   - `supabase_setup.sql` - Erstellt die Haupttabellen (exercises, training_plans, training_plan_exercises)
   - `supabase_user_profiles.sql` - Erstellt die user_profiles Tabelle für Profilbilder

## Lokales Starten

### Entwicklungsserver starten

```bash
npm start
```

oder

```bash
npm run serve
```

Die App läuft dann auf `http://localhost:8100` und öffnet sich automatisch im Browser.

### Im Browser testen

Die App kann direkt im Browser getestet werden. Einige Features (wie Kamera und Benachrichtigungen) funktionieren nur auf nativen Plattformen.

## Build für Android

1. **App bauen**
   ```bash
   npm run build
   ```

2. **Capacitor synchronisieren**
   ```bash
   npm run cap:sync
   ```

3. **Android Studio öffnen**
   ```bash
   npm run cap:open:android
   ```

4. **In Android Studio:**
   - Warte bis Gradle Sync abgeschlossen ist
   - Wähle ein Gerät oder Emulator
   - Klicke auf "Run" oder drücke `Shift + F10`

## 🔨 Verfügbare npm Scripts

- `npm start` - Startet den Entwicklungsserver
- `npm run build` - Baut die App für Produktion
- `npm run build:prod` - Baut die App für Produktion (optimiert)
- `npm run watch` - Baut die App im Watch-Modus
- `npm run cap:sync` - Synchronisiert Web-Code mit nativen Projekten
- `npm run cap:open` - Öffnet das Capacitor-Projekt
- `npm run cap:open:android` - Öffnet Android Studio
- `npm test` - Führt Tests aus
- `npm run lint` - Führt Linting aus

## Projektstruktur

```
Physique/
├── src/
│   ├── app/
│   │   ├── components/       # Wiederverwendbare Komponenten
│   │   ├── models/           # TypeScript Modelle
│   │   ├── pages/             # App-Seiten
│   │   │   ├── active-training/
│   │   │   ├── exercises/
│   │   │   ├── profile/
│   │   │   ├── training-plans/
│   │   │   └── training-plan-detail/
│   │   └── services/          # Services (API, Theme, etc.)
│   ├── assets/                # Statische Assets
│   ├── environments/          # Environment-Konfiguration
│   └── theme/                  # Theme-Variablen
├── android/                    # Android-Projekt (wird generiert)
├── capacitor.config.ts         # Capacitor-Konfiguration
└── package.json               # Dependencies und Scripts
```

## Wichtige Hinweise

### Supabase-Konfiguration

- Die App benötigt eine konfigurierte Supabase-Datenbank
- Die Credentials müssen in `src/environments/environment.ts` eingetragen werden
- Die Datenbank-Tabellen müssen mit den SQL-Scripts erstellt werden

### Native Features

Folgende Features funktionieren nur auf nativen Plattformen (Android/iOS):
- **Kamera** (Profilbild)
- **Benachrichtigungen** (Training-Erinnerungen)
- **Status Bar** (Theme-Anpassung)

Im Browser werden diese Features mit Fallbacks oder Warnungen behandelt.

### Benachrichtigungen

- Benachrichtigungen werden alle 10 Sekunden gesendet
- Sie werden automatisch pausiert, wenn der User auf der "Active Training" Seite ist
- Sie werden automatisch fortgesetzt, wenn die Seite verlassen wird oder die App geschlossen wird

## Technologie-Stack

- **Ionic 7** - UI Framework
- **Angular 17** - Framework
- **Capacitor 5** - Native Bridge
- **Supabase** - Backend/Datenbank
- **TypeScript** - Programmiersprache

## Weitere Informationen

- [Ionic Dokumentation](https://ionicframework.com/docs)
- [Angular Dokumentation](https://angular.io/docs)
- [Capacitor Dokumentation](https://capacitorjs.com/docs)
- [Supabase Dokumentation](https://supabase.com/docs)

## Troubleshooting

### Probleme beim Starten

- Stelle sicher, dass alle Dependencies installiert sind: `npm install`
- Prüfe, ob Node.js Version 18+ installiert ist: `node --version`
- Lösche `node_modules` und `package-lock.json` und installiere neu

### Probleme mit Supabase

- Prüfe, ob die Credentials in `environment.ts` korrekt sind
- Stelle sicher, dass die SQL-Scripts in Supabase ausgeführt wurden
- Prüfe die Browser-Konsole auf Fehlermeldungen

### Probleme mit Android Build

- Stelle sicher, dass Android Studio installiert ist
- Prüfe, ob Java JDK installiert ist
- Führe `npm run cap:sync` aus, bevor du Android Studio öffnest

## Lizenz

Dieses Projekt ist privat.


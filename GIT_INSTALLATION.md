# Git Installation und Repository Setup

## Schritt 1: Git installieren

Git ist aktuell nicht installiert. Bitte installiere es:

1. **Download:** https://git-scm.com/download/win
2. **Installation:** Führe den Installer aus
3. **Wichtig:** Wähle während der Installation "Add Git to PATH" aus
4. **Nach Installation:** PowerShell/Terminal **neu starten**

## Schritt 2: Git konfigurieren (einmalig)

Nach der Installation führe aus:

```bash
git config --global user.name "Dein Name"
git config --global user.email "deine.email@example.com"
```

## Schritt 3: GitLab Personal Access Token erstellen

Um auf GitLab zugreifen zu können, benötigst du einen Personal Access Token:

1. **Gehe zu GitLab:** https://gitlab.com/-/user_settings/personal_access_tokens
2. **Erstelle einen neuen Token:**
   - Name: z.B. "Physique App"
   - Scopes: Aktiviere `write_repository` (mindestens)
   - Expiration: Wähle ein Ablaufdatum (optional)
   - Klicke auf **"Create personal access token"**
3. **WICHTIG:** Kopiere den Token sofort! Er wird nur einmal angezeigt.

## Schritt 4: Repository einrichten

Führe diese Befehle im Projektordner aus:

```bash
# Git initialisieren
git init

# Remote Repository hinzufügen (HTTPS-Methode)
git remote add origin https://gitlab.com/Leandros111/physique.git

# Alle Dateien hinzufügen
git add .

# Commit erstellen
git commit -m "Initial commit: Physique App mit Logo, Dark Mode, CRUD-Operationen"

# Branch zu main umbenennen (falls master verwendet wurde)
git branch -M main

# Zum Repository pushen
# Beim ersten Push wirst du nach Benutzername und Passwort gefragt:
# - Username: Dein GitLab-Benutzername
# - Password: Der Personal Access Token (NICHT dein GitLab-Passwort!)
git push -u origin main
```

**Falls der Branch `master` heißt statt `main`:**
```bash
git branch -M main
git push -u origin main
```

**Alternative: SSH-Methode** (erfordert SSH-Schlüssel-Setup):
```bash
git remote set-url origin git@gitlab.com:Leandros111/physique.git
```

## Alternative: GitLab Web-Interface

Falls Git nicht installiert werden soll, kannst du die Dateien auch über das GitLab Web-Interface hochladen:
1. Gehe zu: https://gitlab.com/Leandros111/physique
2. Klicke auf "Upload file" oder verwende den Web-Editor


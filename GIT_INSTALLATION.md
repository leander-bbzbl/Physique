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

## Schritt 3: Repository einrichten

Führe diese Befehle im Projektordner aus:

```bash
# Git initialisieren
git init

# Remote Repository hinzufügen
git remote add origin git@gitlab.com:Leandros111/physique.git

# Alle Dateien hinzufügen
git add .

# Commit erstellen
git commit -m "Initial commit: Physique App mit Logo, Dark Mode, CRUD-Operationen"

# Zum Repository pushen
git push -u origin main
```

**Falls der Branch `master` heißt statt `main`:**
```bash
git push -u origin master
```

## Alternative: GitLab Web-Interface

Falls Git nicht installiert werden soll, kannst du die Dateien auch über das GitLab Web-Interface hochladen:
1. Gehe zu: https://gitlab.com/Leandros111/physique
2. Klicke auf "Upload file" oder verwende den Web-Editor


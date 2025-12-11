# Git Repository Setup

## Repository bereits konfiguriert

Das Remote-Repository ist: `git@gitlab.com:Leandros111/physique.git`

## Git-Befehle zum Pushen

Falls Git installiert ist, führe folgende Befehle aus:

```bash
# Git initialisieren (falls noch nicht geschehen)
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

Falls der Branch `master` heißt statt `main`:
```bash
git push -u origin master
```

## Falls Git nicht installiert ist

1. Git installieren von: https://git-scm.com/download/win
2. Nach Installation PowerShell/Terminal neu starten
3. Die obigen Befehle ausführen


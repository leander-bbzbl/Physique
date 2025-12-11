# Java Setup für Android Development

## Problem
`JAVA_HOME` ist nicht gesetzt und Java wurde nicht im PATH gefunden.

## Lösung

### Option 1: Android Studio JDK verwenden (empfohlen)

Android Studio bringt ein JDK mit. Setzen Sie JAVA_HOME temporär:

```powershell
# Temporär für diese Session
$env:JAVA_HOME = "$env:LOCALAPPDATA\Programs\Android\Android Studio\jbr"
$env:PATH = "$env:JAVA_HOME\bin;$env:PATH"

# Testen
java -version
```

### Option 2: JAVA_HOME permanent setzen

1. **Windows-Taste + R** → `sysdm.cpl` → Enter
2. Registerkarte **"Erweitert"** → **"Umgebungsvariablen"**
3. **"Neu"** unter Systemvariablen:
   - **Name:** `JAVA_HOME`
   - **Wert:** `C:\Users\admin.local\AppData\Local\Programs\Android\Android Studio\jbr`
   (oder Ihr Android Studio Installationspfad + `\jbr`)
4. **PATH** bearbeiten → **"Neu"** hinzufügen:
   - `%JAVA_HOME%\bin`
5. **OK** klicken
6. **Neue PowerShell/CMD öffnen** (Umgebungsvariablen werden neu geladen)

### Option 3: Java JDK separat installieren

Falls Android Studio JDK nicht gefunden wird:

1. **Java JDK 17 oder höher herunterladen:**
   - https://adoptium.net/ (empfohlen)
   - Oder Oracle JDK: https://www.oracle.com/java/technologies/downloads/

2. **Installieren** und JAVA_HOME auf den Installationspfad setzen (z.B. `C:\Program Files\Java\jdk-17`)

## Nach dem Setup

```powershell
# Prüfen ob Java funktioniert
java -version

# Dann Android App starten
npx cap run android
```

## Alternative: Über Android Studio

Sie können die App auch direkt in Android Studio starten:
1. Android Studio öffnen
2. Projekt öffnen: `android` Ordner
3. Emulator auswählen
4. Run-Button klicken


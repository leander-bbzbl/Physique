@echo off
echo Git Repository Setup fuer Physique App
echo.
echo Stelle sicher, dass Git installiert ist!
echo.
pause

REM Git initialisieren
git init

REM Remote Repository hinzufuegen
git remote add origin git@gitlab.com:Leandros111/physique.git

REM Alle Dateien hinzufuegen
git add .

REM Commit erstellen
git commit -m "Initial commit: Physique App mit Logo, Dark Mode, CRUD-Operationen"

REM Zum Repository pushen
git push -u origin main

echo.
echo Fertig! Falls main nicht existiert, versuche: git push -u origin master
pause


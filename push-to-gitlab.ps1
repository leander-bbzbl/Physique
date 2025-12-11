# PowerShell Script zum Pushen zu GitLab
# Führe dieses Script aus, NACHDEM Git installiert wurde

Write-Host "Git Repository Setup für Physique App" -ForegroundColor Green
Write-Host ""

# Prüfe ob Git verfügbar ist
try {
    $gitVersion = git --version
    Write-Host "Git gefunden: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "FEHLER: Git ist nicht installiert oder nicht im PATH!" -ForegroundColor Red
    Write-Host "Bitte installiere Git von: https://git-scm.com/download/win" -ForegroundColor Yellow
    Write-Host "Nach der Installation PowerShell neu starten!" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "Initialisiere Git Repository..." -ForegroundColor Cyan
git init

Write-Host ""
Write-Host "Füge Remote Repository hinzu..." -ForegroundColor Cyan
git remote remove origin 2>$null
git remote add origin git@gitlab.com:Leandros111/physique.git

Write-Host ""
Write-Host "Füge alle Dateien hinzu..." -ForegroundColor Cyan
git add .

Write-Host ""
Write-Host "Erstelle Commit..." -ForegroundColor Cyan
git commit -m "Initial commit: Physique App mit Logo, Dark Mode, CRUD-Operationen"

Write-Host ""
Write-Host "Pushe zu GitLab..." -ForegroundColor Cyan
Write-Host "Hinweis: Falls 'main' nicht existiert, wird 'master' verwendet" -ForegroundColor Yellow

# Versuche zuerst main, dann master
$branch = "main"
$result = git push -u origin $branch 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "Versuche Branch 'master'..." -ForegroundColor Yellow
    $branch = "master"
    git push -u origin $branch
}

Write-Host ""
Write-Host "Fertig! Repository erfolgreich zu GitLab gepusht." -ForegroundColor Green


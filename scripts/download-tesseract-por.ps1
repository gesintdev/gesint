# Baixa por.traineddata para OCR de holerites (dev local Windows/Linux sem Tesseract instalado).
# Uso: powershell -ExecutionPolicy Bypass -File scripts/download-tesseract-por.ps1

$ErrorActionPreference = "Stop"
$destDir = Join-Path (Join-Path (Join-Path $PSScriptRoot "..") "data") "tessdata"
$destFile = Join-Path $destDir "por.traineddata"
$url = "https://github.com/tesseract-ocr/tessdata/raw/main/por.traineddata"

New-Item -ItemType Directory -Force -Path $destDir | Out-Null

if (Test-Path $destFile) {
    Write-Host "OK: $destFile ja existe"
    exit 0
}

Write-Host "Baixando por.traineddata para $destFile ..."
Invoke-WebRequest -Uri $url -OutFile $destFile -UseBasicParsing
Write-Host "Concluido. Reinicie o gommo-backend (profile dev)."

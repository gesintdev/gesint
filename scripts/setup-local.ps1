# Setup local (Windows PowerShell) — cria .env se ainda nao existir
if (-not (Test-Path ".env")) {
  Copy-Item ".env.example" ".env"
  Write-Host "Arquivo .env criado a partir de .env.example"
} else {
  Write-Host ".env ja existe — nada alterado"
}

if (-not (Test-Path "gesint-frontend\.env.local")) {
  Copy-Item "gesint-frontend\.env.example" "gesint-frontend\.env.local"
  Write-Host "Arquivo gesint-frontend\.env.local criado"
}

Write-Host ""
Write-Host "Subindo PostgreSQL..."
docker compose up -d

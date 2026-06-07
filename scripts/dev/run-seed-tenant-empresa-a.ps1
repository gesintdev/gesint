# Aplica seed dev multi-tenant para Empresa A no Postgres local.
# Uso (na raiz do repo): .\scripts\dev\run-seed-tenant-empresa-a.ps1

$ErrorActionPreference = "Stop"
$Root = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
Set-Location $Root

$envFile = Join-Path $Root ".env"
if (-not (Test-Path $envFile)) {
    Write-Error "Arquivo .env nao encontrado em $Root"
}

Get-Content $envFile | ForEach-Object {
    if ($_ -match '^\s*([^#=]+)=(.*)$') {
        $name = $matches[1].Trim()
        $value = $matches[2].Trim().Trim('"').Trim("'")
        Set-Item -Path "Env:$name" -Value $value
    }
}

$dbUser = if ($env:DB_USER) { $env:DB_USER } else { $env:POSTGRES_USER }
$dbName = if ($env:DB_NAME) { $env:DB_NAME } else { $env:POSTGRES_DB }
$dbPassword = if ($env:DB_PASSWORD) { $env:DB_PASSWORD } else { $env:POSTGRES_PASSWORD }
$container = "gommo-postgres"

if (-not $dbUser -or -not $dbName -or -not $dbPassword) {
    Write-Error "Defina DB_USER/DB_NAME/DB_PASSWORD (ou POSTGRES_*) no .env"
}

$sqlPath = Join-Path $PSScriptRoot "seed-tenant-empresa-a.sql"
if (-not (Test-Path $sqlPath)) {
    Write-Error "SQL nao encontrado: $sqlPath"
}

$running = docker ps --filter "name=$container" --format "{{.Names}}" 2>$null
if (-not $running) {
    Write-Error "Container $container nao esta rodando. Execute: docker compose up -d postgres"
}

Write-Host "Aplicando seed em $dbName@$container ..." -ForegroundColor Cyan
Get-Content $sqlPath -Raw | docker exec -i -e PGPASSWORD=$dbPassword $container psql -v ON_ERROR_STOP=1 -U $dbUser -d $dbName

if ($LASTEXITCODE -ne 0) {
    Write-Error "Falha ao aplicar seed (exit $LASTEXITCODE)"
}

Write-Host ""
Write-Host "Seed concluido." -ForegroundColor Green
Write-Host "  URL:   http://empresa-a.localhost:3000"
Write-Host "  Login: admin / $($env:DEV_ADMIN_PASSWORD)"

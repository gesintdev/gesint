# Remove dados de teste da Empresa A (schema tenant + client_user + assinatura).
# Uso (na raiz do repo): .\scripts\dev\run-reset-tenant-empresa-a.ps1

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

$sqlPath = Join-Path $PSScriptRoot "reset-tenant-empresa-a.sql"
if (-not (Test-Path $sqlPath)) {
    Write-Error "SQL nao encontrado: $sqlPath"
}

$running = docker ps --filter "name=$container" --format "{{.Names}}" 2>$null
if (-not $running) {
    Write-Error "Container $container nao esta rodando. Execute: docker compose up -d postgres"
}

Write-Host "Aplicando reset em $dbName@$container ..." -ForegroundColor Yellow
Get-Content $sqlPath -Raw | docker exec -i -e PGPASSWORD=$dbPassword $container psql -v ON_ERROR_STOP=1 -U $dbUser -d $dbName

if ($LASTEXITCODE -ne 0) {
    Write-Error "Falha ao aplicar reset (exit $LASTEXITCODE)"
}

Write-Host ""
Write-Host "Reset concluido. Base limpa para validar o fluxo:" -ForegroundColor Green
Write-Host "  1. Gommo Admin: cadastrar usuario da empresa"
Write-Host "  2. Gommo Admin: Provisionar o cliente"
Write-Host "  3. Login em http://empresa-a.localhost:3000 com o usuario cadastrado"

# Oracle Free Tier — retry until Ampere capacity is available.
# Usage: .\retry-until-provisioned.ps1
# Stop anytime with Ctrl+C.

param(
    [int]$IntervalSeconds = 300,   # wait between attempts (default 5 min)
    [string]$TelegramToken = "",   # optional: bot token for notification
    [string]$TelegramChatId = ""   # optional: your chat id
)

$ErrorActionPreference = "Continue"

function Send-Telegram {
    param([string]$Message)
    if ($TelegramToken -and $TelegramChatId) {
        $body = @{ chat_id = $TelegramChatId; text = $Message } | ConvertTo-Json
        try {
            Invoke-RestMethod -Uri "https://api.telegram.org/bot$TelegramToken/sendMessage" `
                -Method Post -ContentType "application/json" -Body $body | Out-Null
        } catch {}
    }
}

function Show-Banner {
    Write-Host ""
    Write-Host "  Oracle Free Tier — Ampere capacity retry script" -ForegroundColor Cyan
    Write-Host "  Intervalo: $IntervalSeconds s  |  Iniciado: $(Get-Date -Format 'HH:mm:ss dd/MM/yyyy')" -ForegroundColor DarkGray
    Write-Host ""
}

Show-Banner
terraform init -upgrade | Out-Null

$attempt = 0

while ($true) {
    $attempt++
    $timestamp = Get-Date -Format "HH:mm:ss"
    Write-Host "[$timestamp] Tentativa #$attempt..." -ForegroundColor Yellow

    $output = terraform apply -auto-approve 2>&1
    $outputText = $output -join "`n"

    # Oracle returns these messages when the shape has no available capacity
    $capacityErrors = @(
        "Out of host capacity",
        "InternalError",
        "shape VM.Standard.A1.Flex is not available",
        "500-"
    )

    $isCapacityError = $capacityErrors | Where-Object { $outputText -match [regex]::Escape($_) }

    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "  Instancia criada com sucesso!" -ForegroundColor Green
        terraform output
        Send-Telegram "Oracle Free Tier: instancia Ampere provisionada! Acesse: $(terraform output -raw instance_public_ip 2>$null)"
        break
    }
    elseif ($isCapacityError) {
        Write-Host "  Sem capacidade disponivel. Proxima tentativa em $IntervalSeconds s..." -ForegroundColor DarkYellow
        terraform destroy -auto-approve 2>&1 | Out-Null  # limpa estado parcial se necessario
    }
    else {
        # Erro diferente (credencial, rede, config) — para e mostra
        Write-Host ""
        Write-Host "  Erro nao relacionado a capacidade. Verifique:" -ForegroundColor Red
        Write-Host $outputText -ForegroundColor Red
        Write-Host ""
        Write-Host "  Corrija o problema e rode o script novamente." -ForegroundColor Yellow
        Send-Telegram "Oracle Free Tier script: erro inesperado na tentativa #$attempt. Verifique o terminal."
        break
    }

    Start-Sleep -Seconds $IntervalSeconds
}

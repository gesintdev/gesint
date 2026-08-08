# Rode no PowerShell como Administrador para Chrome/Edge confiarem na CA do lab
$cer = Join-Path $PSScriptRoot 'gommo-lab-ca.cer'
Import-Certificate -FilePath $cer -CertStoreLocation 'Cert:\LocalMachine\Root'
Write-Host 'CA instalada em LocalMachine\Root. Feche e reabra o Chrome.'

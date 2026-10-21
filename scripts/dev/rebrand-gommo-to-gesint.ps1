#Requires -Version 5.1
$ErrorActionPreference = "Stop"
$Root = Resolve-Path (Join-Path $PSScriptRoot "..\..")
Set-Location $Root

$ExcludeDirNames = @(
    ".git", "node_modules", ".next", "target", "dist", "build",
    "data", ".idea", ".vscode", ".claude"
)

function Test-IsExcludedPath([string]$FullPath) {
    $rel = $FullPath.Substring($Root.Path.Length).TrimStart("\", "/")
    foreach ($part in $rel.Split([char[]]@("\", "/"))) {
        if ($ExcludeDirNames -contains $part) { return $true }
    }
    return $false
}

Write-Host "==> Step 1: Rename top-level app folders"
$map = @{
    "gesint-backend"         = "gesint-backend"
    "gesint-admin-backend"   = "gesint-admin-backend"
    "gesint-frontend"        = "gesint-frontend"
    "gesint-admin-frontend"  = "gesint-admin-frontend"
}
foreach ($old in $map.Keys) {
    $src = Join-Path $Root $old
    $dst = Join-Path $Root $map[$old]
    if ((Test-Path $src) -and -not (Test-Path $dst)) {
        Rename-Item -LiteralPath $src -NewName $map[$old]
        Write-Host "  renamed $old -> $($map[$old])"
    } elseif (Test-Path $dst) {
        Write-Host "  skip $old (target exists)"
    }
}

Write-Host "==> Step 2: Move Java package trees br/com/gesint -> br/com/gesint"
$javaRoots = @(
    "gesint-backend\src\main\java\br\com",
    "gesint-backend\src\test\java\br\com",
    "gesint-admin-backend\src\main\java\br\com",
    "gesint-admin-backend\src\test\java\br\com"
)
foreach ($base in $javaRoots) {
    $gesintDir = Join-Path $Root (Join-Path $base "gesint")
    $gesintDir = Join-Path $Root (Join-Path $base "gesint")
    if (Test-Path $gesintDir) {
        $parent = Split-Path $gesintDir -Parent
        if (-not (Test-Path $parent)) { New-Item -ItemType Directory -Path $parent -Force | Out-Null }
        if (Test-Path $gesintDir) {
            # merge: move children then remove empty gesint
            Get-ChildItem -LiteralPath $gesintDir -Force | ForEach-Object {
                $target = Join-Path $gesintDir $_.Name
                if (Test-Path $target) {
                    Write-Warning "  conflict: $target exists"
                } else {
                    Move-Item -LiteralPath $_.FullName -Destination $gesintDir
                }
            }
            Remove-Item -LiteralPath $gesintDir -Recurse -Force -ErrorAction SilentlyContinue
        } else {
            Rename-Item -LiteralPath $gesintDir -NewName "gesint"
        }
        Write-Host "  package path ready: $base\gesint"
    }
}

Write-Host "==> Step 3: Rename known brand files"
$renameFiles = @(
    @{ Old = "gesint-frontend\src\shared\components\layout\GesintLogo.tsx"; New = "GesintLogo.tsx" },
    @{ Old = "gesint-admin-frontend\src\shared\components\layout\GesintLogo.tsx"; New = "GesintLogo.tsx" },
    @{ Old = "gesint-backend\src\main\java\br\com\gesint\GesintApplication.java"; New = "GesintApplication.java" },
    @{ Old = "gesint-backend\src\test\java\br\com\gesint\GesintApplicationTests.java"; New = "GesintApplicationTests.java" },
    @{ Old = "gesint-admin-backend\src\main\java\br\com\gesint\admin\GesintAdminApplication.java"; New = "GesintAdminApplication.java" },
    @{ Old = "gesint-admin-backend\src\test\java\br\com\gesint\admin\GesintAdminApplicationTests.java"; New = "GesintAdminApplicationTests.java" },
    @{ Old = "gesint-admin-backend\.run\GesintAdminApplication.run.xml"; New = "GesintAdminApplication.run.xml" },
    @{ Old = ".agents\rules\gesint.mdc"; New = "gesint.mdc" },
    @{ Old = ".agents\rules\gesint-ui-system.mdc"; New = "gesint-ui-system.mdc" },
    @{ Old = ".agents\rules\gesint-frontend-ui.mdc"; New = "gesint-frontend-ui.mdc" },
    @{ Old = ".agents\rules\gesint-payroll-module.mdc"; New = "gesint-payroll-module.mdc" },
    @{ Old = ".agents\instrucoes\gesint-ui-system.mdc"; New = "gesint-ui-system.mdc" },
    @{ Old = "infra\coolify\env\lab-gesint.local.env.example"; New = "lab-gesint.local.env.example" },
    @{ Old = "infra\coolify\intellij-gesint-lab.jdbc.txt"; New = "intellij-gesint-lab.jdbc.txt" }
)
foreach ($rf in $renameFiles) {
    $full = Join-Path $Root $rf.Old
    if (Test-Path $full) {
        Rename-Item -LiteralPath $full -NewName $rf.New
        Write-Host "  file $($rf.Old) -> $($rf.New)"
    }
}

# Brand SVGs
Get-ChildItem -Path (Join-Path $Root "gesint-frontend\public\brand"), (Join-Path $Root "gesint-admin-frontend\public\brand") -Filter "gesint-*" -ErrorAction SilentlyContinue | ForEach-Object {
    $newName = $_.Name -replace "^gesint-", "gesint-"
    Rename-Item -LiteralPath $_.FullName -NewName $newName
    Write-Host "  asset $($_.Name) -> $newName"
}

# Certs lab
$certs = Join-Path $Root "infra\coolify\certs-lab"
if (Test-Path $certs) {
    Get-ChildItem -Path $certs -Filter "*gesint*" -ErrorAction SilentlyContinue | ForEach-Object {
        $newName = $_.Name -replace "gesint", "gesint"
        Rename-Item -LiteralPath $_.FullName -NewName $newName
        Write-Host "  cert $($_.Name) -> $newName"
    }
}

# Backend iml
$iml = Join-Path $Root "gesint-backend\gesint-backend.iml"
if (Test-Path $iml) {
    Rename-Item -LiteralPath $iml -NewName "gesint-backend.iml"
}

Write-Host "==> Step 4: Bulk content replace in text files"
$exts = @(
    ".java", ".ts", ".tsx", ".js", ".mjs", ".cjs", ".json", ".yml", ".yaml",
    ".xml", ".md", ".mdc", ".css", ".scss", ".sql", ".example", ".env",
    ".txt", ".sh", ".ps1", ".cmd", ".bat", ".properties", ".html", ".svg",
    ".gitignore", ".gitattributes", ".prettierignore", ".editorconfig",
    ".iml", ".Dockerfile", ""
)
# also Dockerfiles without extension
$textNameExact = @("Dockerfile", "docker-entrypoint.sh", "Jenkinsfile", "Makefile", "AGENTS.md", "README.md")

$replacements = @(
    # longest / most specific first
    @{ From = "br.com.gesint.admin"; To = "br.com.gesint.admin" },
    @{ From = "br.com.gesint"; To = "br.com.gesint" },
    @{ From = "br/com/gesint/admin"; To = "br/com/gesint/admin" },
    @{ From = "br/com/gesint"; To = "br/com/gesint" },
    @{ From = "GesintAdminApplication"; To = "GesintAdminApplication" },
    @{ From = "GesintApplication"; To = "GesintApplication" },
    @{ From = "GesintLogo"; To = "GesintLogo" },
    @{ From = "gesint-admin-frontend"; To = "gesint-admin-frontend" },
    @{ From = "gesint-admin-backend"; To = "gesint-admin-backend" },
    @{ From = "gesint-frontend"; To = "gesint-frontend" },
    @{ From = "gesint-backend"; To = "gesint-backend" },
    @{ From = "gesint-admin"; To = "gesint-admin" },
    @{ From = "GESINT_"; To = "GESINT_" },
    @{ From = "gesint-admin."; To = "gesint-admin." },
    @{ From = "gesint."; To = "gesint." },  # spring keys / domains partial — careful later
    @{ From = "admGesint"; To = "admGesint" },
    @{ From = "gesint.admin@gmail.com"; To = "flavio.henrique.dev@gmail.com" },
    @{ From = "gesint.com.br"; To = "gesint.com.br" },
    @{ From = "gesint.local"; To = "gesint.local" },
    @{ From = "gesint_types"; To = "gesint_types" },
    @{ From = "public.gesint_"; To = "public.gesint_" },
    @{ From = "gesint_audit_"; To = "gesint_audit_" },
    @{ From = "gesint_sync_"; To = "gesint_sync_" },
    @{ From = "gesint_admin_"; To = "gesint_admin_" },
    @{ From = "gesint_seed_"; To = "gesint_seed_" },
    @{ From = "lab-gesint"; To = "lab-gesint" },
    @{ From = "--gesint-"; To = "--gesint-" },
    @{ From = "gesint-"; To = "gesint-" },
    @{ From = '"gesint"'; To = '"gesint"' },
    @{ From = "'gesint'"; To = "'gesint'" },
    @{ From = "data-theme=`"gesint`""; To = "data-theme=`"gesint`"" },
    @{ From = "Gesint"; To = "Gesint" },
    @{ From = "GESINT"; To = "GESINT" },
    @{ From = "gesint"; To = "gesint" }
)

$skipBinaryExt = @(".png", ".jpg", ".jpeg", ".gif", ".webp", ".avif", ".ico", ".woff", ".woff2", ".ttf", ".eot", ".pdf", ".zip", ".jar", ".class", ".crt", ".key", ".p12", ".jks")

$filesChanged = 0
$filesScanned = 0

Get-ChildItem -Path $Root -Recurse -File -Force | ForEach-Object {
    if (Test-IsExcludedPath $_.FullName) { return }
    if ($skipBinaryExt -contains $_.Extension.ToLowerInvariant()) { return }

    $ext = $_.Extension.ToLowerInvariant()
    $isText = ($exts -contains $ext) -or ($textNameExact -contains $_.Name) -or ($_.Name -like "*.env*") -or ($_.Name -like "Dockerfile*")
    if (-not $isText -and $ext -ne "") {
        # allow extensionless known configs already handled
        return
    }

    $filesScanned++
    try {
        $content = [System.IO.File]::ReadAllText($_.FullName)
    } catch {
        return
    }
    if ($content -notmatch "(?i)gesint") { return }

    $newContent = $content
    foreach ($r in $replacements) {
        if ($newContent.Contains($r.From)) {
            $newContent = $newContent.Replace($r.From, $r.To)
        }
    }

    if ($newContent -ne $content) {
        [System.IO.File]::WriteAllText($_.FullName, $newContent)
        $filesChanged++
    }
}

Write-Host "==> Done. Scanned $filesScanned files, changed $filesChanged"
Write-Host "==> Remaining gesint hits (sample):"
rg -i "gesint" --glob "!node_modules/**" --glob "!.git/**" --glob "!data/**" --glob "!target/**" --glob "!.next/**" -c . 2>$null | Select-Object -First 40

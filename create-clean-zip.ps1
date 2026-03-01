# Create a clean ZIP of the project (excludes target/, logs/, and other build artifacts)
# Run from: springboot_backend_template folder.
# Stop the Spring Boot app and LoggingService before running if you had "file in use" errors.

$ErrorActionPreference = "Stop"
$projectRoot = $PSScriptRoot
$zipName = "springboot_backend_template_clean.zip"
$zipPath = Join-Path (Split-Path $projectRoot -Parent) $zipName

$tempDir = Join-Path $env:TEMP "springboot_zip_$(Get-Random)"
$copyTo = Join-Path $tempDir "springboot_backend_template"
New-Item -ItemType Directory -Path $copyTo -Force | Out-Null

try {
    # Use robocopy to copy excluding build/runtime dirs (avoids locked files and missing paths)
    $excludeDirs = "target", "node_modules", ".git", ".metadata", ".idea", ".vs", ".vscode", "bin", "obj", "logs"
    $xd = ($excludeDirs | ForEach-Object { "/XD", $_ }) -join " "
    & robocopy $projectRoot $copyTo /E /XD target node_modules .git .metadata .idea .vs .vscode bin obj logs /XF *.log *.zip /NFL /NDL /NJH /NJS /NC /NS
    # robocopy exit 0=no copy, 1=ok, 2+ = extra; 0 and 1 are success
    if ($LASTEXITCODE -ge 8) { throw "Robocopy failed with exit $LASTEXITCODE" }

    if (Test-Path $zipPath) { Remove-Item $zipPath -Force }
    Compress-Archive -Path $copyTo -DestinationPath $zipPath -Force
    Write-Host "Created: $zipPath" -ForegroundColor Green
} finally {
    Remove-Item $tempDir -Recurse -Force -ErrorAction SilentlyContinue
}

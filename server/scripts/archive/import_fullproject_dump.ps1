$ErrorActionPreference = "Stop"

$root = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$dumpPath = Join-Path (Split-Path -Parent $root) "DataBase FullProjectPython.sql"
$envPath = Join-Path $root ".env"

if (!(Test-Path $dumpPath)) {
    throw "Dump file not found at: $dumpPath"
}

if (!(Test-Path $envPath)) {
    throw ".env not found at: $envPath"
}

Get-Content $envPath | ForEach-Object {
    if ($_ -match '^\s*#' -or $_ -match '^\s*$') { return }
    $pair = $_ -split '=', 2
    if ($pair.Length -eq 2) {
        [System.Environment]::SetEnvironmentVariable($pair[0].Trim(), $pair[1].Trim(), "Process")
    }
}

$pgUser = $env:PGUSER
$pgPassword = $env:PGPASSWORD
$pgHost = $env:PGHOST
$pgPort = $env:PGPORT
$pgDatabase = $env:PGDATABASE

if (-not $pgUser -or -not $pgHost -or -not $pgPort -or -not $pgDatabase) {
    throw "Missing PostgreSQL connection settings in .env"
}

$env:PGPASSWORD = $pgPassword

Write-Host "Importing dump into PostgreSQL database '$pgDatabase' on $pgHost`:$pgPort ..."
Write-Host "Dump: $dumpPath"

& psql -h $pgHost -p $pgPort -U $pgUser -d $pgDatabase -f $dumpPath

if ($LASTEXITCODE -ne 0) {
    throw "psql import failed with exit code $LASTEXITCODE"
}

Write-Host "Import completed successfully."

param([ValidateSet('start','stop')][string]$Action='start')
$ErrorActionPreference='Stop'
$projectRoot=Split-Path $PSScriptRoot -Parent
$localDir=Join-Path $projectRoot '.local'
$pgBin=if ($env:PG_BIN) {$env:PG_BIN} else {'C:\Program Files\PostgreSQL\17\bin'}
if (-not (Test-Path "$pgBin/initdb.exe")) { throw 'Set PG_BIN to the PostgreSQL bin directory.' }
New-Item -ItemType Directory -Path $localDir -Force | Out-Null
if ($Action -eq 'stop') { & "$pgBin/pg_ctl.exe" -D "$localDir/postgres" stop; exit $LASTEXITCODE }
if (-not (Test-Path "$localDir/db-password")) {
  $bytes=[byte[]]::new(32); $rng=[Security.Cryptography.RandomNumberGenerator]::Create(); $rng.GetBytes($bytes); $rng.Dispose()
  [IO.File]::WriteAllText("$localDir/db-password",[Convert]::ToBase64String($bytes))
}
if (-not (Test-Path "$localDir/postgres/PG_VERSION")) {
  & "$pgBin/initdb.exe" -D "$localDir/postgres" -U queueflow --auth=scram-sha-256 --pwfile="$localDir/db-password" --encoding=UTF8 --locale=C
  if ($LASTEXITCODE -ne 0) {throw 'Database initialization failed'}
}
& "$pgBin/pg_ctl.exe" -D "$localDir/postgres" status *> $null
if ($LASTEXITCODE -ne 0) {
  & "$pgBin/pg_ctl.exe" -D "$localDir/postgres" -l "$localDir/postgres.log" -o '-p 55432 -h 127.0.0.1' -w start
  if ($LASTEXITCODE -ne 0) {throw 'Database start failed'}
}
$env:PGPASSWORD=[IO.File]::ReadAllText("$localDir/db-password")
foreach ($databaseName in @('queueflow','queueflow_test')) {
  $exists=& "$pgBin/psql.exe" -h 127.0.0.1 -p 55432 -U queueflow -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname='$databaseName'"
  if ($exists -ne '1') { & "$pgBin/createdb.exe" -h 127.0.0.1 -p 55432 -U queueflow $databaseName; if ($LASTEXITCODE -ne 0) {throw 'Database creation failed'} }
}
Remove-Item Env:PGPASSWORD
Write-Host 'QueueFlow databases available on localhost:55432; credentials remain in ignored .local.'


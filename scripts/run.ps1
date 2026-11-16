$ErrorActionPreference='Stop'
$projectRoot=Split-Path $PSScriptRoot -Parent
& "$PSScriptRoot/local-db.ps1"
$jdk=Get-ChildItem "$projectRoot/.tools/jdk" -Directory -ErrorAction SilentlyContinue | Select-Object -First 1
if ($jdk) {$env:JAVA_HOME=$jdk.FullName;$env:PATH="$env:JAVA_HOME/bin;$env:PATH"}
$env:DB_URL='jdbc:postgresql://localhost:55432/queueflow'
$env:DB_USERNAME='queueflow'
$env:DB_PASSWORD=[IO.File]::ReadAllText("$projectRoot/.local/db-password")
if (-not (Test-Path "$projectRoot/.local/demo-password")) {
 $bytes=[byte[]]::new(18);$rng=[Security.Cryptography.RandomNumberGenerator]::Create();$rng.GetBytes($bytes);$rng.Dispose()
 [IO.File]::WriteAllText("$projectRoot/.local/demo-password",[Convert]::ToBase64String($bytes))
}
$env:DEMO_PASSWORD=[IO.File]::ReadAllText("$projectRoot/.local/demo-password")
$env:SPRING_PROFILES_ACTIVE='demo'
Write-Host 'Demo accounts: student@queueflow.local, staff@queueflow.local, admin@queueflow.local'
Write-Host 'Their initial password is in .local/demo-password. It is not tracked by Git.'
& "$env:JAVA_HOME/bin/java.exe" -jar "$projectRoot/app/target/queueflow-1.0.0.jar"

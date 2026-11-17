$ErrorActionPreference='Stop'
$projectRoot=Split-Path $PSScriptRoot -Parent
& "$PSScriptRoot/local-db.ps1"
$pgBin=if($env:PG_BIN){$env:PG_BIN}else{'C:\Program Files\PostgreSQL\17\bin'}
$env:PGPASSWORD=[IO.File]::ReadAllText("$projectRoot/.local/db-password")
$flowDatabase='queueflow_flow_'+(Get-Date -Format 'yyyyMMddHHmmss')
& "$pgBin/createdb.exe" -h 127.0.0.1 -p 55432 -U queueflow $flowDatabase
if($LASTEXITCODE -ne 0){throw 'Unable to create isolated flow-check database'}
Remove-Item Env:PGPASSWORD
$jdk=Get-ChildItem "$projectRoot/.tools/jdk" -Directory | Select-Object -First 1
$env:DB_URL="jdbc:postgresql://localhost:55432/$flowDatabase";$env:DB_USERNAME='queueflow'
$env:DB_PASSWORD=[IO.File]::ReadAllText("$projectRoot/.local/db-password")
$env:DEMO_PASSWORD=[IO.File]::ReadAllText("$projectRoot/.local/demo-password")
$env:SPRING_PROFILES_ACTIVE='demo';$env:PORT='8081';$env:FLOW_BASE_URL='http://localhost:8081'
$process=Start-Process -FilePath "$($jdk.FullName)/bin/java.exe" -ArgumentList @('-jar',"$projectRoot/app/target/queueflow-1.0.0.jar") -WindowStyle Hidden -PassThru -RedirectStandardOutput "$projectRoot/.local/flow-app.log" -RedirectStandardError "$projectRoot/.local/flow-app-errors.log"
try{
 $ready=$false
 for($i=0;$i -lt 45;$i++){if($process.HasExited){throw 'Flow application exited; inspect .local/flow-app-errors.log'};try{$r=Invoke-WebRequest 'http://localhost:8081/login' -TimeoutSec 2;if($r.StatusCode -eq 200){$ready=$true;break}}catch{};Start-Sleep -Seconds 1}
 if(-not $ready){throw 'Flow application startup timed out'}
 Push-Location $projectRoot
 try{& node scripts/full-flow.cjs;if($LASTEXITCODE -ne 0){throw 'Browser flow failed; inspect .local/ui-review'}}finally{Pop-Location}
}finally{if(-not $process.HasExited){Stop-Process -Id $process.Id};Remove-Item Env:PORT;Remove-Item Env:SPRING_PROFILES_ACTIVE;Remove-Item Env:FLOW_BASE_URL}

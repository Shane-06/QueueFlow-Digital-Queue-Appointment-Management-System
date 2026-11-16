param([string[]]$MavenArgs = @('verify'))
$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path $PSScriptRoot -Parent
$localJdk = Get-ChildItem "$projectRoot/.tools/jdk" -Directory -ErrorAction SilentlyContinue | Select-Object -First 1
if ($localJdk) { $env:JAVA_HOME = $localJdk.FullName; $env:PATH = "$env:JAVA_HOME/bin;$env:PATH" }
$env:MAVEN_USER_HOME = "$projectRoot/.tools/maven-user"
$maven = "$projectRoot/.tools/apache-maven-3.9.11/bin/mvn.cmd"
if (-not (Test-Path $maven)) { $maven = "$projectRoot/app/mvnw.cmd" }
Push-Location "$projectRoot/app"
try { & $maven "-Dmaven.repo.local=$projectRoot/.tools/m2" @MavenArgs; if ($LASTEXITCODE -ne 0) { throw "Maven failed: $LASTEXITCODE" } }
finally { Pop-Location }

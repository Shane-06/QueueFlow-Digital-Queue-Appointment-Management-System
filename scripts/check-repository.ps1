$ErrorActionPreference='Stop'
$projectRoot=Split-Path $PSScriptRoot -Parent
Push-Location $projectRoot
try {
  $tracked=git ls-files
  $forbidden=$tracked | Where-Object { $_ -match '(^|/)(\.env($|\.)|node_modules/|target/|dist/|\.local/|\.tools/)|\.(pem|key|p12|jks)$' -and $_ -notmatch '(^|/)\.env\.example$' }
  if ($forbidden) { throw 'Forbidden local/generated files are tracked. Review git ls-files before publishing.' }
  foreach ($file in $tracked) {
    if ($file -match '\.(java|yml|yaml|properties|json|md|ps1|xml|ts|tsx)$') {
      $body=[IO.File]::ReadAllText((Join-Path $projectRoot $file))
      if ($body -match '(gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{30,}|-----BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY-----)') { throw "Potential credential in tracked file: $file" }
    }
  }
  git diff --check
  if ($LASTEXITCODE -ne 0) {throw 'Whitespace check failed'}
  Write-Host 'Repository checks passed: local secrets and generated directories excluded; no recognized private keys or GitHub tokens.'
} finally { Pop-Location }

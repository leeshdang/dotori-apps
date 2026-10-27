$stage = "d:\DCL\release\web_staging"
if (Test-Path $stage) { Remove-Item $stage -Recurse -Force }
New-Item -ItemType Directory -Path $stage -Force | Out-Null
Copy-Item -Path "d:\DCL\dist\*" -Destination $stage -Recurse -Force
Copy-Item -Path "d:\DCL\web_dist\*.bat" -Destination $stage -Force

$zipPath = "d:\DCL\release\Dotori-ChessLearning-web.zip"
if (Test-Path $zipPath) { Remove-Item $zipPath -Force }

Compress-Archive -Path "$stage\*" -DestinationPath $zipPath -Force

$pkgDir = "D:\Package\Dotori_Chess_Learning"
if (-not (Test-Path $pkgDir)) { New-Item -ItemType Directory -Path $pkgDir -Force | Out-Null }
Copy-Item $zipPath -Destination "$pkgDir\Dotori-ChessLearning-web.zip" -Force

Remove-Item $stage -Recurse -Force

Write-Host "Created Dotori-ChessLearning-web.zip:"
Get-Item $zipPath | Select-Object Name, Length, LastWriteTime

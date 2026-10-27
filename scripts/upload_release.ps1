# Dotori Release Uploader using curl.exe for high-speed streaming
$psi = New-Object System.Diagnostics.ProcessStartInfo
$psi.FileName = "C:\Program Files\Git\mingw64\bin\git-credential-manager.exe"
$psi.Arguments = "get"
$psi.UseShellExecute = $false
$psi.RedirectStandardInput = $true
$psi.RedirectStandardOutput = $true
$proc = [System.Diagnostics.Process]::Start($psi)
$proc.StandardInput.WriteLine("protocol=https")
$proc.StandardInput.WriteLine("host=github.com")
$proc.StandardInput.WriteLine("")
$proc.StandardInput.Close()

$stdout = $proc.StandardOutput.ReadToEnd()
$proc.WaitForExit()

if (-not ($stdout -match "password=([^\r\n]+)")) {
    Write-Error "Failed to obtain GitHub token from git-credential-manager."
    exit 1
}

$token = $matches[1]
Write-Host "Obtained GitHub token successfully."

$owner = "leeshdang"
$repo = "dotori-apps"
$tag = "v1.0.0"

# Fetch release info
$releaseJson = curl.exe -s -H "Authorization: token $token" -H "Accept: application/vnd.github.v3+json" "https://api.github.com/repos/$owner/$repo/releases/tags/$tag"
$rel = $releaseJson | ConvertFrom-Json
$releaseId = $rel.id
Write-Host "Found Release: $tag (ID: $releaseId)"

$targetFiles = @(
    "Dotori-ChessLearning-win-x64.exe",
    "Dotori-ChessLearning-linux.AppImage",
    "Dotori-ChessLearning.apk",
    "Dotori-ChessLearning-web.zip"
)

$packageDir = "D:\Package\Dotori_Chess_Learning"

foreach ($file in $targetFiles) {
    $filePath = Join-Path $packageDir $file
    if (-not (Test-Path $filePath)) {
        Write-Error "File not found: $filePath"
        continue
    }

    $fileSize = (Get-Item $filePath).Length
    $fileSizeMB = [Math]::Round($fileSize / 1MB, 2)

    # Check for existing asset and delete if present
    $existing = $rel.assets | Where-Object { $_.name -eq $file }
    if ($existing) {
        Write-Host "Deleting previous asset: $file (ID: $($existing.id))..."
        curl.exe -s -X DELETE -H "Authorization: token $token" -H "Accept: application/vnd.github.v3+json" "https://api.github.com/repos/$owner/$repo/releases/assets/$($existing.id)"
        Start-Sleep -Seconds 2
    }

    $contentType = switch -wildcard ($file) {
        "*.exe" { "application/vnd.microsoft.portable-executable" }
        "*.AppImage" { "application/octet-stream" }
        "*.apk" { "application/vnd.android.package-archive" }
        "*.zip" { "application/zip" }
        default { "application/octet-stream" }
    }

    Write-Host "Uploading $file ($fileSizeMB MB) via curl..."
    $uploadUri = "https://uploads.github.com/repos/$owner/$repo/releases/$releaseId/assets?name=$file"
    
    $res = curl.exe -s -X POST `
        -H "Authorization: token $token" `
        -H "Content-Type: $contentType" `
        --data-binary "@$filePath" `
        "$uploadUri"

    if ($res -match '"browser_download_url":\s*"([^"]+)"') {
        Write-Host "SUCCESS: $file uploaded -> $($matches[1])`n"
    } else {
        Write-Host "Response: $res`n"
    }
}

Write-Host "Done! All Dotori Chess Learning assets uploaded to GitHub Release v1.0.0."

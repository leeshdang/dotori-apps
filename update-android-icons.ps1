Add-Type -AssemblyName System.Drawing
$srcPath = (Get-Item "public\master-icon.png").FullName
$src = [System.Drawing.Bitmap]::FromFile($srcPath)

$androidSizes = @{
    'mipmap-mdpi' = 48
    'mipmap-hdpi' = 72
    'mipmap-xhdpi' = 96
    'mipmap-xxhdpi' = 144
    'mipmap-xxxhdpi' = 192
}

foreach ($folder in $androidSizes.Keys) {
    $sz = $androidSizes[$folder]
    $bmp = New-Object System.Drawing.Bitmap $sz, $sz
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.DrawImage($src, 0, 0, $sz, $sz)
    
    $targetDir = Join-Path "android\app\src\main\res" $folder
    if (Test-Path $targetDir) {
        $bmp.Save((Join-Path $targetDir "ic_launcher.png"), [System.Drawing.Imaging.ImageFormat]::Png)
        $bmp.Save((Join-Path $targetDir "ic_launcher_round.png"), [System.Drawing.Imaging.ImageFormat]::Png)
        $bmp.Save((Join-Path $targetDir "ic_launcher_foreground.png"), [System.Drawing.Imaging.ImageFormat]::Png)
        Write-Host "Updated $folder icons ($sz x $sz)"
    }
    $g.Dispose()
    $bmp.Dispose()
}

$src.Dispose()
Write-Host "All Android icons updated successfully from master-icon.png!"

Add-Type -AssemblyName System.Drawing

$srcPath = "C:\Users\ADMIN\.gemini\antigravity\brain\96b496a4-c169-45c8-8c85-a6dc70698391\.user_uploaded\media_1795554529098_e957b820.jpg"
$publicDir = "c:\Users\ADMIN\Downloads\BroomBoom-Cabs-Vendor\Broomboomvendor page\public"
$appDir = "c:\Users\ADMIN\Downloads\BroomBoom-Cabs-Vendor\Broomboomvendor page\src\app"

$srcImg = [System.Drawing.Image]::FromFile($srcPath)
Write-Host ("Source dimensions: " + $srcImg.Width + "x" + $srcImg.Height)

function Save-ResizedPng {
    param([string]$OutPath, [int]$Size)
    $bmp = New-Object System.Drawing.Bitmap($Size, $Size, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.Clear([System.Drawing.Color]::Transparent)
    $g.DrawImage($srcImg, 0, 0, $Size, $Size)
    $g.Dispose()
    $bmp.Save($OutPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()
    Write-Host ("Saved logo: " + $OutPath + " (" + $Size + "x" + $Size + ")")
}

function New-CircularBitmap {
    param([int]$Size)
    $bmp = New-Object System.Drawing.Bitmap($Size, $Size, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.Clear([System.Drawing.Color]::Transparent)

    $path = New-Object System.Drawing.Drawing2D.GraphicsPath
    $path.AddEllipse(0, 0, $Size, $Size)
    $g.SetClip($path)

    # Crop slightly inward (5% each side) so the circular edge stays cleanly inside the yellow rounded square
    $insetX = [int]($srcImg.Width * 0.05)
    $insetY = [int]($srcImg.Height * 0.05)
    $cropW = $srcImg.Width - (2 * $insetX)
    $cropH = $srcImg.Height - (2 * $insetY)
    $destRect = New-Object System.Drawing.Rectangle(0, 0, $Size, $Size)
    $srcRect = New-Object System.Drawing.Rectangle($insetX, $insetY, $cropW, $cropH)
    $g.DrawImage($srcImg, $destRect, $srcRect, [System.Drawing.GraphicsUnit]::Pixel)

    $path.Dispose()
    $g.Dispose()
    return $bmp
}

function Save-CircularPng {
    param([string]$OutPath, [int]$Size)
    $bmp = New-CircularBitmap -Size $Size
    $bmp.Save($OutPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()
    Write-Host ("Saved circular icon: " + $OutPath + " (" + $Size + "x" + $Size + ")")
}

function Save-CircularIco {
    param([string]$OutPath, [int[]]$Sizes)
    $frames = @()
    foreach ($s in $Sizes) {
        $bmp = New-CircularBitmap -Size $s
        $ms = New-Object System.IO.MemoryStream
        $bmp.Save($ms, [System.Drawing.Imaging.ImageFormat]::Png)
        $bmp.Dispose()
        $frames += @{ Size = $s; Bytes = $ms.ToArray() }
        $ms.Dispose()
    }

    $fs = [System.IO.File]::Open($OutPath, [System.IO.FileMode]::Create)
    $bw = New-Object System.IO.BinaryWriter($fs)
    # ICONDIR header
    $bw.Write([uint16]0)
    $bw.Write([uint16]1)
    $bw.Write([uint16]$frames.Count)

    $offset = 6 + (16 * $frames.Count)
    foreach ($f in $frames) {
        $dim = if ($f.Size -ge 256) { [byte]0 } else { [byte]$f.Size }
        $bw.Write($dim)
        $bw.Write($dim)
        $bw.Write([byte]0)
        $bw.Write([byte]0)
        $bw.Write([uint16]1)
        $bw.Write([uint16]32)
        $bw.Write([uint32]$f.Bytes.Length)
        $bw.Write([uint32]$offset)
        $offset += $f.Bytes.Length
    }
    foreach ($f in $frames) {
        $bw.Write($f.Bytes)
    }
    $bw.Close()
    $fs.Close()
    Write-Host ("Saved circular ICO: " + $OutPath)
}

# 1. Replace all logo sizes with the uploaded logo
Save-ResizedPng -OutPath (Join-Path $publicDir "logo.png") -Size 512
Save-ResizedPng -OutPath (Join-Path $publicDir "broomboom-logo.png") -Size 512
Save-ResizedPng -OutPath (Join-Path $publicDir "broomboom-vendor-logo.png") -Size 512
Save-ResizedPng -OutPath (Join-Path $publicDir "icon-512x512.png") -Size 512
Save-ResizedPng -OutPath (Join-Path $publicDir "icon-192x192.png") -Size 192
Save-ResizedPng -OutPath (Join-Path $publicDir "apple-touch-icon.png") -Size 180

# 2. Replace all favicons with circular versions of the uploaded logo
Save-CircularPng -OutPath (Join-Path $publicDir "favicon-48x48.png") -Size 48
Save-CircularPng -OutPath (Join-Path $publicDir "favicon-96x96.png") -Size 96
Save-CircularIco -OutPath (Join-Path $publicDir "favicon.ico") -Sizes @(16, 32, 48)
Save-CircularPng -OutPath (Join-Path $appDir "icon.png") -Size 192
Save-CircularPng -OutPath (Join-Path $appDir "apple-icon.png") -Size 180

$srcImg.Dispose()
Write-Host "All logos and circular favicons generated successfully."

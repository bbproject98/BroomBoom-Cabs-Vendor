Add-Type -AssemblyName System.Drawing
$filePath = "c:\Users\ADMIN\Downloads\BroomBoom-Cabs-Vendor\Broomboomvendor page\public\hero-banner.jpg"
$img = [System.Drawing.Bitmap]::FromFile($filePath)
Write-Host "Width: $($img.Width) Height: $($img.Height)"
Write-Host "TopLeft: $($img.GetPixel(10, 10))"
Write-Host "TopRight: $($img.GetPixel(1000, 10))"
Write-Host "MidLeft: $($img.GetPixel(10, 340))"
Write-Host "BotLeft: $($img.GetPixel(10, 670))"
$img.Dispose()

Add-Type -AssemblyName System.Drawing
$filePath = "c:\Users\ADMIN\Downloads\BroomBoom-Cabs-Vendor\Broomboomvendor page\public\hero-banner.jpg"
$img = [System.Drawing.Bitmap]::FromFile($filePath)
Write-Host "Left edge pixels at x=0:"
for ($y = 0; $y -lt $img.Height; $y += 68) {
    $c = $img.GetPixel(0, $y)
    Write-Host ("y=" + $y + " R=" + $c.R + " G=" + $c.G + " B=" + $c.B)
}
Write-Host "---"
Write-Host "Right edge pixels at x=1023:"
for ($y = 0; $y -lt $img.Height; $y += 68) {
    $c = $img.GetPixel(1023, $y)
    Write-Host ("y=" + $y + " R=" + $c.R + " G=" + $c.G + " B=" + $c.B)
}
$img.Dispose()

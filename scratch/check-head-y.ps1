Add-Type -AssemblyName System.Drawing
$filePath = "c:\Users\ADMIN\Downloads\BroomBoom-Cabs-Vendor\Broomboomvendor page\public\hero-banner.jpg"
$img = [System.Drawing.Bitmap]::FromFile($filePath)
Write-Host "Scanning y at x=800 (man head):"
for ($y = 0; $y -lt 300; $y += 20) {
    $c = $img.GetPixel(800, $y)
    Write-Host ("y=" + $y + ": R=" + $c.R + " G=" + $c.G + " B=" + $c.B)
}
Write-Host "Scanning y at x=400 (cars at bottom):"
for ($y = 450; $y -lt $img.Height; $y += 20) {
    $c = $img.GetPixel(400, $y)
    Write-Host ("y=" + $y + ": R=" + $c.R + " G=" + $c.G + " B=" + $c.B)
}
$img.Dispose()

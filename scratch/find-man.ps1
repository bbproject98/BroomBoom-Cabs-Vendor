Add-Type -AssemblyName System.Drawing
$filePath = "c:\Users\ADMIN\Downloads\BroomBoom-Cabs-Vendor\Broomboomvendor page\public\hero-banner.jpg"
$img = [System.Drawing.Bitmap]::FromFile($filePath)
Write-Host "Width=$($img.Width), Height=$($img.Height)"
# Let's check horizontal slices to find where the man starts
# The man has dark hair / shirt, cars are white/dark
# Let's scan along x from left to right at y=100 (head height)
for ($x = 0; $x -lt $img.Width; $x += 50) {
    $c = $img.GetPixel($x, 100)
    Write-Host ("x=" + $x + ": R=" + $c.R + " G=" + $c.G + " B=" + $c.B)
}
$img.Dispose()

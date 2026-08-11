Add-Type -AssemblyName System.Drawing

$svgDir = "d:\my_portfolio_rose_phi_32.vercel.app\my-portfolio-rose-phi-32.vercel.app\svg"

function Clean-PngBackground($pngName) {
    $pngPath = Join-Path $svgDir $pngName
    if (-not (Test-Path $pngPath)) {
        Write-Output "File not found: $pngPath"
        return
    }

    $bmp = New-Object System.Drawing.Bitmap($pngPath)
    $newBmp = New-Object System.Drawing.Bitmap($bmp.Width, $bmp.Height)
    $g = [System.Drawing.Graphics]::FromImage($newBmp)
    $g.Clear([System.Drawing.Color]::Transparent)

    # Sample checkerboard background colors from the top-left edges
    $bgColors = @()
    $bgColors += $bmp.GetPixel(0, 0)
    $bgColors += $bmp.GetPixel(0, 16)
    $bgColors += $bmp.GetPixel(16, 0)
    $bgColors += $bmp.GetPixel(16, 16)

    # Clean pure white as well
    $whiteColor = [System.Drawing.Color]::FromArgb(255, 255, 255, 255)

    for ($y = 0; $y -lt $bmp.Height; $y++) {
        for ($x = 0; $x -lt $bmp.Width; $x++) {
            $pixel = $bmp.GetPixel($x, $y)
            $isBg = $false

            # Check if color matches any sampled background colors
            foreach ($bgColor in $bgColors) {
                if ([Math]::Abs($pixel.R - $bgColor.R) -lt 8 -and 
                    [Math]::Abs($pixel.G - $bgColor.G) -lt 8 -and 
                    [Math]::Abs($pixel.B - $bgColor.B) -lt 8) {
                    $isBg = $true
                    break
                }
            }

            # Check for pure white
            if ([Math]::Abs($pixel.R - 255) -lt 5 -and 
                [Math]::Abs($pixel.G - 255) -lt 5 -and 
                [Math]::Abs($pixel.B - 255) -lt 5) {
                # Only replace white if it is in the outer 15% boundary to prevent erasing design elements
                if ($x -lt ($bmp.Width * 0.18) -or $x -gt ($bmp.Width * 0.82) -or 
                    $y -lt ($bmp.Height * 0.18) -or $y -gt ($bmp.Height * 0.82)) {
                    $isBg = $true
                }
            }

            if (-not $isBg) {
                $newBmp.SetPixel($x, $y, $pixel)
            }
        }
    }

    $g.Dispose()
    $bmp.Dispose()

    # Save cleaned image back
    $tempPath = $pngPath + ".tmp"
    $newBmp.Save($tempPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $newBmp.Dispose()

    Remove-Item $pngPath
    Rename-Item $tempPath $pngName
    Write-Output "Cleaned background for $pngName"
}

Clean-PngBackground "education.png"
Clean-PngBackground "developer.png"
Clean-PngBackground "projects.png"

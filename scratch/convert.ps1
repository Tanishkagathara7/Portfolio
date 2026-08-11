$svgDir = "d:\my_portfolio_rose_phi_32.vercel.app\my-portfolio-rose-phi-32.vercel.app\svg"

function Convert-PngToSvg($pngName, $svgName) {
    $pngPath = Join-Path $svgDir $pngName
    if (Test-Path $pngPath) {
        $bytes = [System.IO.File]::ReadAllBytes($pngPath)
        $base64 = [Convert]::ToBase64String($bytes)
        $svgContent = @"
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%">
  <image href="data:image/png;base64,$base64" width="512" height="512"/>
</svg>
"@
        $svgPath = Join-Path $svgDir $svgName
        [System.IO.File]::WriteAllText($svgPath, $svgContent)
        Write-Output "Successfully created $svgName"
    } else {
        Write-Output "Error: $pngName not found"
    }
}

Convert-PngToSvg "education.png" "education.svg"
Convert-PngToSvg "developer.png" "developer.svg"
Convert-PngToSvg "projects.png" "projects.svg"

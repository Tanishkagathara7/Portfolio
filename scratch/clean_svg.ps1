$htmlPath = "d:\my_portfolio_rose_phi_32.vercel.app\my-portfolio-rose-phi-32.vercel.app\index.html"
$svgDir = "d:\my_portfolio_rose_phi_32.vercel.app\my-portfolio-rose-phi-32.vercel.app\svg"

if (Test-Path $htmlPath) {
    $htmlContent = [System.IO.File]::ReadAllText($htmlPath)
    
    # Get all files in svg folder
    $files = Get-ChildItem -Path $svgDir -File
    
    $keptCount = 0
    $removedCount = 0

    foreach ($file in $files) {
        $filename = $file.Name
        # Check if the filename is referenced in index.html
        if ($htmlContent -match [regex]::Escape($filename)) {
            $keptCount++
            Write-Output "Keeping: $filename"
        } else {
            $removedCount++
            Remove-Item $file.FullName -Force
            Write-Output "Removed: $filename"
        }
    }
    
    Write-Output "Done. Kept: $keptCount, Removed: $removedCount"
} else {
    Write-Output "Error: index.html not found"
}

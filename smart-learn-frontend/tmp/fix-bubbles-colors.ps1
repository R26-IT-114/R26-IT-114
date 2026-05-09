$pages = 'c:\Users\Dilshani\Desktop\R26-IT-114\smart-learn-frontend\src\modules\dysgraphia\pages'

$bubbleFiles = @('A','BA','DHA','GA','HA','I','KA','La','MA','NA','PA','RA','SA','TA','THA','U','WA','YA') |
    ForEach-Object { Join-Path $pages "DysgraphiaLetter$_.jsx" }

$caterpillarFiles = @('BA','DHA','HA','KA','RA','SA','THA','U','WA','YA') |
    ForEach-Object { Join-Path $pages "DysgraphiaLetter$_.jsx" }

# ── BUBBLE REMOVAL ────────────────────────────────────────────────────────
foreach ($file in $bubbleFiles) {
    if (-not (Test-Path $file)) { Write-Host "SKIP (not found): $file"; continue }
    $c = [IO.File]::ReadAllText($file)
    if (-not $c.Contains('setBubbles')) { Write-Host "SKIP (no bubbles): $file"; continue }

    # 1. Remove bubbles state declaration line
    $c = $c -replace '(?m)^[ \t]*const \[bubbles[^\n]*\r?\n', ''

    # 2. Remove playBubbleSound function
    $c = $c -replace '(?s)\r?\n[ \t]*const playBubbleSound = \(\) => \{.*?\r?\n[ \t]*\};', ''

    # 3. Remove burst bubble block (inside if nextProgress >= 1, after stopTrainSound)
    #    Matches: const path/pathElement = letterPathRef.current; if(path){...playBubbleSound...}
    $c = $c -replace '(?s)(stopTrainSound\(\);\r?\n)[ \t]*const (?:path|pathElement) = letterPathRef\.current;\r?\n[ \t]*if \((?:path|pathElement)\) \{.*?playBubbleSound\(\)[^\n]*\r?\n(?:[ \t]*\}\r?\n)?[ \t]*\}', '$1'
    # Also handle U-style where the for-loop is multiline: needs extra } to close
    $c = $c -replace '(?s)(stopTrainSound\(\);\r?\n)[ \t]*const (?:path|pathElement) = letterPathRef\.current;\r?\n\r?\n[ \t]*if \((?:path|pathElement)\) \{.*?playBubbleSound\(\)[^\n]*\r?\n[ \t]*\}\r?\n[ \t]*\}', '$1'

    # 4. Remove the Math.random() < 0.8 nb-bubble block during animation
    $c = $c -replace '(?s)\r?\n[ \t]*if \(Math\.random\(\) < 0\.8\) \{.*?playBubbleSound\(\);?[^\n]*\r?\n[ \t]*\}\r?\n[ \t]*\}', ''

    # 5. Remove setBubbles filter in progress useEffect (single-line compact)
    $c = $c -replace '(?m)^[ \t]*setBubbles\([a-z]+ => \{ const now[^\n]*\r?\n', ''
    # Multiline variant (U style): setBubbles((prev) => {\n  const now...\n  return...\n});
    $c = $c -replace '(?s)\r?\n[ \t]*setBubbles\([a-z]+ => \{[^}]*Date\.now\(\)[^}]*\}\s*\);', ''

    # 6. Remove remaining setBubbles([]) calls (inline and standalone)
    $c = $c -replace '[ \t]*setBubbles\(\[\]\);?', ''

    # 7. Remove any leftover setBubbles((prev) => [...]) calls
    $c = $c -replace '(?m)[ \t]*setBubbles\([a-z]+ => \[[^\n]*\][^\n]*\);?[ \t]*', ''

    # 8. Remove JSX bubble block: {/* ── Bubbles ── */} + {bubbles.map(...)}
    $c = $c -replace '(?s)\r?\n[ \t]*\{/\*[^*]*Bubbles[^*]*\*/\}\s*\r?\n[ \t]*\{bubbles\.map\(b => \{.*?\}\)\}', ''

    [IO.File]::WriteAllText($file, $c)
    Write-Host "Bubbles removed: $([System.IO.Path]::GetFileName($file))"
}

# ── CATERPILLAR COLOR CHANGE (purple → green) ─────────────────────────────
foreach ($file in $caterpillarFiles) {
    if (-not (Test-Path $file)) { Write-Host "SKIP (not found): $file"; continue }
    $c = [IO.File]::ReadAllText($file)
    if (-not $c.Contains('CaterpillarTracer')) { Write-Host "SKIP (no caterpillar): $file"; continue }

    # Body segment fill color
    $c = $c -replace "hsl\(271, 75%,", "hsl(120, 65%,"
    # Dark outline (legs, body stroke, antennae)
    $c = $c -replace "stroke='#4a148c'", "stroke='#1b5e20'"
    # Spot circles on body
    $c = $c -replace "fill='#6a1b9a'", "fill='#558b2f'"
    # Head fill
    $c = $c -replace "fill='#7b1fa2'", "fill='#2e7d32'"
    # Antenna ball circles
    $c = $c -replace "fill='#9c27b0'", "fill='#8bc34a'"

    [IO.File]::WriteAllText($file, $c)
    Write-Host "Colors updated: $([System.IO.Path]::GetFileName($file))"
}

Write-Host "`nDone."

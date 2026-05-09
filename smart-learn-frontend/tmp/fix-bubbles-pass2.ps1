$pages = 'c:\Users\Dilshani\Desktop\R26-IT-114\smart-learn-frontend\src\modules\dysgraphia\pages'

# Files still needing cleanup
$remainingFiles = @('GA','HA','KA','SA','TA','U') | ForEach-Object { Join-Path $pages "DysgraphiaLetter$_.jsx" }

foreach ($file in $remainingFiles) {
    if (-not (Test-Path $file)) { continue }
    $c = [IO.File]::ReadAllText($file)
    $before = $c

    # Fix 1: setBubbles filter using multiline (prev) => variant
    # Matches: setBubbles((prev) => {\n  const now = Date.now();\n  return ...\n});
    $c = $c -replace '(?s)\r?\n[ \t]*setBubbles\(\(?[a-z]+\)? => \{[\s\S]{1,200}?Date\.now\(\)[\s\S]{1,300}?\}\s*\);', ''

    # Fix 2: Remove JSX bubbles map block (no comment, with (b) => or b =>)
    # Uses indentation backreference to match the correct closing })}
    $c = $c -replace '(?s)\r?\n([ \t]*)\{bubbles\.map\([^\n]*\{[\s\S]*?\n\1\}\)\}', ''

    # Fix 3 (U only): Remove burst bubble block inside if(nextProgress >= 1)
    # The block starts with "const pathElement = letterPathRef.current;" after stopTrainSound
    $c = $c -replace '(?s)\r?\n[ \t]*const (?:path|pathElement) = letterPathRef\.current;[\s\S]{1,1200}?(?:playBubbleSound\(\)[^\n]*\r?\n[ \t]*\}\r?\n[ \t]*\}|\}\r?\n[ \t]*\})\s*(?=\r?\n[ \t]*return;)', ''

    if ($c -ne $before) {
        [IO.File]::WriteAllText($file, $c)
        Write-Host "Fixed: $([System.IO.Path]::GetFileName($file))"
    } else {
        Write-Host "No change: $([System.IO.Path]::GetFileName($file))"
    }
}

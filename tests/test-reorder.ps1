# test-reorder.ps1 — Exhaustive stack card reorder stress test
$ErrorActionPreference = "Stop"
$API = "https://vhgcmdgmmvarkqjfcytj.supabase.co/rest/v1"
$H = @{
    apikey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZoZ2NtZGdtbXZhcmtxamZjeXRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg5ODE3MzcsImV4cCI6MjEwNDU1NzczN30.1S8WuGio75wlZb3BIPbiIMz2f--AZHR7de8_QmAMEwY"
    Authorization = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZoZ2NtZGdtbXZhcmtxamZjeXRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg5ODE3MzcsImV4cCI6MjEwNDU1NzczN30.1S8WuGio75wlZb3BIPbiIMz2f--AZHR7de8_QmAMEwY"
    "Content-Type" = "application/json"
    Prefer = "return=representation"
}
$pass = 0; $fail = 0; $total = 0

function Assert($cond, $msg) {
    $script:total++
    if ($cond) { $script:pass++; Write-Output "  PASS: $msg" }
    else { $script:fail++; Write-Output "  FAIL: $msg" }
}

function Get-Cards($stackId) {
    Invoke-RestMethod -Uri "$API/stack_cards?select=id,record_id,position&stack_id=eq.$stackId&order=position" -Headers $H
}

function Set-Order($stackId, $cardIds) {
    $ids = @($cardIds)
    if ($ids.Count -eq 0) { return }
    for ($i = 0; $i -lt $ids.Count; $i++) {
        Invoke-RestMethod -Uri "$API/stack_cards?id=eq.$($ids[$i])" -Method PATCH -Headers $H -Body (@{
            stack_id = $stackId; position = $i
        } | ConvertTo-Json -Depth 5) | Out-Null
    }
}

function Move-Card($cardId, $newStackId, $newPosition) {
    $allStacks = @($sA.id, $sB.id)
    $srcStackId = $null
    foreach ($sid in $allStacks) {
        $found = Invoke-RestMethod -Uri "$API/stack_cards?select=id&stack_id=eq.$sid&id=eq.$cardId" -Headers $H -ErrorAction SilentlyContinue
        if ($found -and @($found).Count -gt 0) { $srcStackId = $sid; break }
    }
    Invoke-RestMethod -Uri "$API/stack_cards?id=eq.$cardId" -Method PATCH -Headers $H -Body (@{
        stack_id = $newStackId; position = $newPosition
    } | ConvertTo-Json -Depth 5) | Out-Null
    if ($srcStackId) {
        $srcCards = Invoke-RestMethod -Uri "$API/stack_cards?select=id&stack_id=eq.$srcStackId&order=position" -Headers $H
        $srcIds = @($srcCards | ForEach-Object { $_.id })
        if ($srcIds.Count -gt 0) {
            for ($j = 0; $j -lt $srcIds.Count; $j++) {
                Invoke-RestMethod -Uri "$API/stack_cards?id=eq.$($srcIds[$j])" -Method PATCH -Headers $H -Body (@{
                    stack_id = $srcStackId; position = $j
                } | ConvertTo-Json -Depth 5) | Out-Null
            }
        }
    }
    $dstCards = Invoke-RestMethod -Uri "$API/stack_cards?select=id&stack_id=eq.$newStackId&order=position" -Headers $H
    $dstIds = @($dstCards | ForEach-Object { $_.id })
    if ($dstIds.Count -gt 0) {
        for ($j = 0; $j -lt $dstIds.Count; $j++) {
            Invoke-RestMethod -Uri "$API/stack_cards?id=eq.$($dstIds[$j])" -Method PATCH -Headers $H -Body (@{
                stack_id = $newStackId; position = $j
            } | ConvertTo-Json -Depth 5) | Out-Null
        }
    }
}

# ─── Setup ───────────────────────────────────────────────────
Write-Output "`n=== SETUP ==="
$ts = Get-Date -Format yyyyMMddHHmmss
$rtId = "reordertest$ts"
Invoke-RestMethod -Uri "$API/record_types" -Method POST -Headers $H -Body (@{
    id = $rtId; name = "ReorderTest$ts"; slug = "reordertest$ts"
    fields = @(@{ name = "title"; type = "text"; label = "Title" })
} | ConvertTo-Json -Depth 5) | Out-Null

$sA = (Invoke-RestMethod -Uri "$API/stacks" -Method POST -Headers $H -Body (@{
    name = "StackA"; record_type_id = $rtId; display_fields = @("title")
} | ConvertTo-Json -Depth 5))[0]
$sB = (Invoke-RestMethod -Uri "$API/stacks" -Method POST -Headers $H -Body (@{
    name = "StackB"; record_type_id = $rtId; display_fields = @("title")
} | ConvertTo-Json -Depth 5))[0]

$rids = @()
for ($i = 1; $i -le 6; $i++) {
    $r = (Invoke-RestMethod -Uri "$API/records" -Method POST -Headers $H -Body (@{
        record_type_id = $rtId; data = @{ title = "Card $i" }
    } | ConvertTo-Json -Depth 5))[0]
    $rids += $r.id
}

$cids = @()
for ($i = 0; $i -lt 4; $i++) {
    $c = (Invoke-RestMethod -Uri "$API/stack_cards" -Method POST -Headers $H -Body (@{
        stack_id = $sA.id; record_id = $rids[$i]; position = $i
    } | ConvertTo-Json -Depth 5))[0]
    $cids += $c.id
}
for ($i = 4; $i -lt 6; $i++) {
    $c = (Invoke-RestMethod -Uri "$API/stack_cards" -Method POST -Headers $H -Body (@{
        stack_id = $sB.id; record_id = $rids[$i]; position = $i - 4
    } | ConvertTo-Json -Depth 5))[0]
    $cids += $c.id
}
Write-Output "Setup: type=$rtId stacks=$($sA.id),$($sB.id) cards=$($cids -join ',')"

# ─── Test 1: Initial positions ──────────────────────────────
Write-Output "`n=== TEST 1: Initial positions ==="
$a = Get-Cards $sA.id; $b = Get-Cards $sB.id
Assert ($a.Count -eq 4) "Stack A: 4 cards"
Assert ($b.Count -eq 2) "Stack B: 2 cards"
for ($i = 0; $i -lt 4; $i++) { Assert ($a[$i].position -eq $i) "A position $i correct" }
for ($i = 0; $i -lt 2; $i++) { Assert ($b[$i].position -eq $i) "B position $i correct" }

# ─── Test 2: Reverse Stack A ────────────────────────────────
Write-Output "`n=== TEST 2: Reverse Stack A ==="
$origIds = $a | ForEach-Object { $_.id }
$reversed = @($origIds[3], $origIds[2], $origIds[1], $origIds[0])
Set-Order $sA.id $reversed
$a2 = Get-Cards $sA.id
Assert ($a2[0].id -eq $origIds[3]) "Reversed: pos 0 = old card 3"
Assert ($a2[1].id -eq $origIds[2]) "Reversed: pos 1 = old card 2"
Assert ($a2[2].id -eq $origIds[1]) "Reversed: pos 2 = old card 1"
Assert ($a2[3].id -eq $origIds[0]) "Reversed: pos 3 = old card 0"

# ─── Test 3: Restore ────────────────────────────────────────
Write-Output "`n=== TEST 3: Restore order ==="
Set-Order $sA.id $origIds
$a3 = Get-Cards $sA.id
for ($i = 0; $i -lt 4; $i++) { Assert ($a3[$i].id -eq $origIds[$i]) "Restored pos $i" }

# ─── Test 4: Cross-stack A→B ───────────────────────────────
Write-Output "`n=== TEST 4: Cross-stack A→B ==="
$cardToMove = $origIds[3]
Move-Card $cardToMove $sB.id 0
# Reindex B after insert
$bCards4 = Get-Cards $sB.id
Set-Order $sB.id ($bCards4 | ForEach-Object { $_.id })
$a4 = Get-Cards $sA.id; $b4 = Get-Cards $sB.id
Assert ($a4.Count -eq 3) "A has 3 cards"
Assert ($b4.Count -eq 3) "B has 3 cards"
Assert ($b4[0].id -eq $cardToMove) "Card at B pos 0"

# ─── Test 5: Move back B→A ─────────────────────────────────
Write-Output "`n=== TEST 5: Move back B→A ==="
Move-Card $cardToMove $sA.id 3
$a5 = Get-Cards $sA.id; $b5 = Get-Cards $sB.id
Assert ($a5.Count -eq 4) "A back to 4"
Assert ($b5.Count -eq 2) "B back to 2"

# ─── Test 6: Rapid sequential reorders ──────────────────────
Write-Output "`n=== TEST 6: Rapid sequential (20 iterations) ==="
$current = $a5 | ForEach-Object { $_.id }
for ($iter = 0; $iter -lt 20; $iter++) {
    $first = $current[0]
    $current = $current[1..3] + @($first)
    Set-Order $sA.id $current
}
$a6 = Get-Cards $sA.id
Assert ($a6.Count -eq 4) "Still 4 cards after 20 rapid reorders"
for ($i = 0; $i -lt 4; $i++) {
    Assert ($a6[$i].position -eq $i) "Position $i correct after rapid"
}
# Verify all unique
$pos = $a6 | ForEach-Object { $_.position }
Assert (($pos | Select-Object -Unique).Count -eq 4) "All positions unique"

# ─── Test 7: Swap adjacent ──────────────────────────────────
Write-Output "`n=== TEST 7: Swap adjacent cards ==="
$ids7 = $a6 | ForEach-Object { $_.id }
$temp = $ids7[0]; $ids7[0] = $ids7[1]; $ids7[1] = $temp
Set-Order $sA.id $ids7
$a7 = Get-Cards $sA.id
Assert ($a7[0].id -eq $ids7[0]) "Swapped pos 0"
Assert ($a7[1].id -eq $ids7[1]) "Swapped pos 1"
# Swap back
$temp2 = $ids7[0]; $ids7[0] = $ids7[1]; $ids7[1] = $temp2
Set-Order $sA.id $ids7

# ─── Test 8: Move all to empty stack ────────────────────────
Write-Output "`n=== TEST 8: Move all to empty stack ==="
$allA = Get-Cards $sA.id
$allIdsA = $allA | ForEach-Object { $_.id }
for ($i = 0; $i -lt $allIdsA.Count; $i++) {
    Move-Card $allIdsA[$i] $sB.id $i
}
$a8 = Get-Cards $sA.id; $b8 = Get-Cards $sB.id
Assert ($a8.Count -eq 0) "A is now empty"
Assert ($b8.Count -eq 6) "B has all 6 cards"
for ($i = 0; $i -lt 6; $i++) { Assert ($b8[$i].position -eq $i) "B position $i" }
# Move first 4 back to A
$bAll = Get-Cards $sB.id
for ($i = 0; $i -lt 4; $i++) {
    Move-Card $bAll[$i].id $sA.id $i
}

# ─── Test 9: Position integrity under stress ────────────────
Write-Output "`n=== TEST 9: Stress test (50 random operations) ==="
$rand = [System.Random]::new()
for ($op = 0; $op -lt 50; $op++) {
    $srcStack = if ($rand.Next(2) -eq 0) { $sA.id } else { $sB.id }
    $dstStack = if ($srcStack -eq $sA.id) { $sB.id } else { $sA.id }
    $srcCards = Get-Cards $srcStack
    if ($srcCards.Count -eq 0) { continue }
    $card = $srcCards[$rand.Next($srcCards.Count)]
    $dstCards = Get-Cards $dstStack
    $insertPos = if ($dstCards.Count -eq 0) { 0 } else { $rand.Next($dstCards.Count + 1) }
    Move-Card $card.id $dstStack $insertPos
}
# Verify all positions are contiguous 0-based
foreach ($sid in @($sA.id, $sB.id)) {
    $cards = Get-Cards $sid
    for ($i = 0; $i -lt $cards.Count; $i++) {
        Assert ($cards[$i].position -eq $i) "Stress: $sid pos $i correct"
    }
}
$allCount = (Get-Cards $sA.id).Count + (Get-Cards $sB.id).Count
Assert ($allCount -eq 6) "Total cards still 6 after stress"

# ─── Test 10: Page load ─────────────────────────────────────
Write-Output "`n=== TEST 10: Page loads ==="
try {
    $resp = Invoke-WebRequest -Uri "https://simple-orm.vercel.app/stacks" -UseBasicParsing
    Assert ($resp.StatusCode -eq 200) "Stacks page loads"
} catch {
    Assert $false "Stacks page failed: $($_.Exception.Message)"
}

# ─── Cleanup ─────────────────────────────────────────────────
Write-Output "`n=== CLEANUP ==="
foreach ($cid in $cids) { Invoke-RestMethod -Uri "$API/stack_cards?id=eq.$cid" -Method DELETE -Headers $H | Out-Null }
Invoke-RestMethod -Uri "$API/stacks?id=eq.$($sA.id)" -Method DELETE -Headers $H | Out-Null
Invoke-RestMethod -Uri "$API/stacks?id=eq.$($sB.id)" -Method DELETE -Headers $H | Out-Null
foreach ($rid in $rids) { Invoke-RestMethod -Uri "$API/records?id=eq.$rid" -Method DELETE -Headers $H | Out-Null }
Invoke-RestMethod -Uri "$API/record_types?id=eq.$rtId" -Method DELETE -Headers $H | Out-Null

Write-Output "`n=== SUMMARY ==="
Write-Output "Total: $total | Passed: $pass | Failed: $fail"
if ($fail -gt 0) { Write-Output "SOME TESTS FAILED"; exit 1 }
else { Write-Output "ALL TESTS PASSED" }

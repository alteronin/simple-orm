# Seed gaming tasks into simple-orm
# Usage: .\tests\seed-gaming-tasks.ps1

$ErrorActionPreference = "Stop"

$API = "https://vhgcmdgmmvarkqjfcytj.supabase.co/rest/v1"
$KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZoZ2NtZGdtbXZhcmtxamZjeXRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg5ODE3MzcsImV4cCI6MjEwNDU1NzczN30.1S8WuGio75wlZb3BIPbiIMz2f--AZHR7de8_QmAMEwY"
$HEADERS = @{
    apikey = $KEY
    Authorization = "Bearer $KEY"
    "Content-Type" = "application/json"
    Prefer = "return=representation"
}

$today = [DateTime]::UtcNow.Date

function Get-NextDayOfWeek([DayOfWeek]$day) {
    $daysAhead = ([int]$day - [int]$today.DayOfWeek + 7) % 7
    if ($daysAhead -eq 0) { $daysAhead = 7 }
    return $today.AddDays($daysAhead)
}

function New-Task($title, $recurrence, $dueDate) {
    $data = @{
        title = $title
        status = "todo"
        done = $false
        stack = "leisure"
    }
    if ($recurrence) { $data.recurrence = $recurrence }
    if ($dueDate) { $data.due_date = $dueDate.ToString("yyyy-MM-dd") }

    $body = @{ record_type_id = "task"; data = $data } | ConvertTo-Json -Depth 5
    $resp = Invoke-RestMethod -Uri "$API/records" -Method POST -Headers $HEADERS -Body $body
    return $resp
}

Write-Output "=== Seeding Gaming Tasks ==="
Write-Output "Today: $today"
Write-Output ""

$count = 0

# --- hi3 ---
Write-Output "--- hi3 (Honkai Impact 3rd) ---"

$wed = Get-NextDayOfWeek "Wednesday"
$fri = Get-NextDayOfWeek "Friday"

New-Task "hi3: Superstring (Wed)" "weekly" $wed | Out-Null
Write-Output "  Created: hi3: Superstring (Wed) [weekly, due $($wed.ToString('yyyy-MM-dd'))]"
$count++

New-Task "hi3: Superstring (Fri)" "weekly" $fri | Out-Null
Write-Output "  Created: hi3: Superstring (Fri) [weekly, due $($fri.ToString('yyyy-MM-dd'))]"
$count++

New-Task "hi3: Memorial Arena" "weekly" $null | Out-Null
Write-Output "  Created: hi3: Memorial Arena [weekly]"
$count++

New-Task "hi3: Elysian Realm" "weekly" $null | Out-Null
Write-Output "  Created: hi3: Elysian Realm [weekly]"
$count++

# --- fgo ---
Write-Output ""
Write-Output "--- fgo (Fate/Grand Order) ---"

@(
    "fgo: Finish Olga 3",
    "fgo: Advance Quests",
    "fgo: Rank Ups",
    "fgo: Interludes",
    "fgo: Old Quests",
    "fgo: Free Quests"
) | ForEach-Object {
    New-Task $_ $null $null | Out-Null
    Write-Output "  Created: $_ [one-time]"
    $count++
}

# --- gi ---
Write-Output ""
Write-Output "--- gi (Genshin Impact) ---"

New-Task "gi: Event" $null $today.AddDays(2) | Out-Null
Write-Output "  Created: gi: Event [one-time, due $($today.AddDays(2).ToString('yyyy-MM-dd'))]"
$count++

New-Task "gi: Theatre" "monthly" $null | Out-Null
Write-Output "  Created: gi: Theatre [monthly]"
$count++

New-Task "gi: Abyss" "monthly" $today.AddDays(1) | Out-Null
Write-Output "  Created: gi: Abyss [monthly, due $($today.AddDays(1).ToString('yyyy-MM-dd'))]"
$count++

New-Task "gi: Stygian" $null $null | Out-Null
Write-Output "  Created: gi: Stygian [one-time]"
$count++

# --- hsr ---
Write-Output ""
Write-Output "--- hsr (Honkai: Star Rail) ---"

New-Task "hsr: DU/CW" "weekly" $null | Out-Null
Write-Output "  Created: hsr: DU/CW [weekly]"
$count++

@(
    "hsr: Event",
    "hsr: PF",
    "hsr: MoC",
    "hsr: Apoc",
    "hsr: Anomaly"
) | ForEach-Object {
    New-Task $_ $null $null | Out-Null
    Write-Output "  Created: $_ [one-time]"
    $count++
}

# --- zzz ---
Write-Output ""
Write-Output "--- zzz (Zenless Zone Zero) ---"

New-Task "zzz: Event" $null $today.AddDays(34) | Out-Null
Write-Output "  Created: zzz: Event [one-time, due $($today.AddDays(34).ToString('yyyy-MM-dd'))]"
$count++

New-Task "zzz: Shiyu" $null $today.AddDays(3) | Out-Null
Write-Output "  Created: zzz: Shiyu [one-time, due $($today.AddDays(3).ToString('yyyy-MM-dd'))]"
$count++

New-Task "zzz: Deadly" $null $today.AddDays(10) | Out-Null
Write-Output "  Created: zzz: Deadly [one-time, due $($today.AddDays(10).ToString('yyyy-MM-dd'))]"
$count++

New-Task "zzz: Weekly" "weekly" $null | Out-Null
Write-Output "  Created: zzz: Weekly [weekly]"
$count++

# --- ww ---
Write-Output ""
Write-Output "--- ww (Wuthering Waves) ---"

New-Task "ww: Event" $null $today.AddDays(14) | Out-Null
Write-Output "  Created: ww: Event [one-time, due $($today.AddDays(14).ToString('yyyy-MM-dd'))]"
$count++

New-Task "ww: Matrix" $null $today.AddDays(15) | Out-Null
Write-Output "  Created: ww: Matrix [one-time, due $($today.AddDays(15).ToString('yyyy-MM-dd'))]"
$count++

New-Task "ww: TOA" $null $today.AddDays(27) | Out-Null
Write-Output "  Created: ww: TOA [one-time, due $($today.AddDays(27).ToString('yyyy-MM-dd'))]"
$count++

New-Task "ww: Whiwa" $null $null | Out-Null
Write-Output "  Created: ww: Whiwa [one-time]"
$count++

New-Task "ww: Weekly" "weekly" $null | Out-Null
Write-Output "  Created: ww: Weekly [weekly]"
$count++

# --- svwb ---
Write-Output ""
Write-Output "--- svwb ---"

@(
    "svwb: Diawl Read",
    "svwb: Esperanza Story",
    "svwb: Set Read",
    "svwb: Puzzles"
) | ForEach-Object {
    New-Task $_ $null $null | Out-Null
    Write-Output "  Created: $_ [one-time]"
    $count++
}

Write-Output ""
Write-Output "=== SUMMARY ==="
Write-Output "Total tasks created: $count"

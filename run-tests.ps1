# run-tests.ps1 — Live test runner with visible output and logs
# Usage: .\run-tests.ps1              (runs all tests)
#        .\run-tests.ps1 api          (runs only API tests)
#        .\run-tests.ps1 crud         (runs only CRUD lifecycle tests)
#        .\run-tests.ps1 e2e          (runs only E2E browser tests)
#        .\run-tests.ps1 live         (runs only live production tests)
#        .\run-tests.ps1 -Filter "delete"  (runs tests matching "delete")

param(
    [string]$Project = "",
    [string]$Filter = ""
)

$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$logFile = "tests\logs\test-run-$timestamp.log"
$jsonFile = "tests\results.json"
$htmlReport = "tests\report\index.html"

# Ensure logs directory exists
New-Item -ItemType Directory -Force -Path "tests\logs" | Out-Null

function Write-Log {
    param([string]$Message, [string]$Color = "White")
    $timestamped = "[$( Get-Date -Format 'HH:mm:ss' )] $Message"
    Write-Host $timestamped -ForegroundColor $Color
    Add-Content -Path $logFile -Value $timestamped
}

# Header
Write-Log "============================================" "Cyan"
Write-Log "  simple-orm Test Runner" "Cyan"
Write-Log "  $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" "Cyan"
Write-Log "============================================" "Cyan"
Write-Log "" "White"

# Build first
Write-Log "Building project..." "Yellow"
$buildOutput = npm run build 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Log "BUILD FAILED!" "Red"
    $buildOutput | ForEach-Object { Write-Log "  $_" "Red" }
    Add-Content -Path $logFile -Value "`nBUILD FAILED:`n$($buildOutput -join "`n")"
    exit 1
}
Write-Log "Build successful" "Green"
Write-Log "" "White"

# Determine which project(s) to run
$projects = @()
switch ($Project.ToLower()) {
    "api"    { $projects = @("api") }
    "crud"   { $projects = @("crud") }
    "e2e"    { $projects = @("e2e") }
    "live"   { $projects = @("live") }
    "perf"   { $projects = @("lighthouse") }
    ""       { $projects = @("api", "crud", "e2e", "lighthouse") }
    default  { $projects = @($Project) }
}

$totalPassed = 0
$totalFailed = 0
$totalFlaky = 0
$testResults = @()

foreach ($proj in $projects) {
    Write-Log "--------------------------------------------" "DarkGray"
    Write-Log "Running: $proj tests" "Yellow"
    Write-Log "--------------------------------------------" "DarkGray"

    $args = @("test", "--project=$proj", "--reporter=list", "--retries=1")
    if ($Filter) {
        $args += "-g"
        $args += $Filter
    }

    $output = npx playwright test @args 2>&1 | Out-String
    $exitCode = $LASTEXITCODE

    # Parse results
    $passed = 0
    $failed = 0
    $flaky = 0

    if ($output -match '(\d+) passed') { $passed = [int]$Matches[1] }
    if ($output -match '(\d+) failed') { $failed = [int]$Matches[1] }
    if ($output -match '(\d+) flaky') { $flaky = [int]$Matches[1] }

    $totalPassed += $passed
    $totalFailed += $failed
    $totalFlaky += $flaky

    $status = if ($failed -eq 0) { "PASS" } else { "FAIL" }
    $statusColor = if ($failed -eq 0) { "Green" } else { "Red" }

    Write-Log "  $proj : $passed passed, $failed failed, $flaky flaky" $statusColor

    # Extract individual test results
    $lines = $output -split "`n"
    foreach ($line in $lines) {
        if ($line -match '^\s*(ok|✗|✘)\s+\d+\s+\[.*?\]\s+›\s+(.+)') {
            $testStatus = $Matches[1]
            $testName = $Matches[2].Trim()
            $testResults += [PSCustomObject]@{
                Project = $proj
                Test    = $testName
                Status  = if ($testStatus -eq "ok") { "PASS" } else { "FAIL" }
            }
        }
    }

    # Log full output
    Add-Content -Path $logFile -Value "`n=== $proj tests ===`n$output"

    Write-Log "" "White"
}

# Summary
Write-Log "============================================" "Cyan"
Write-Log "  SUMMARY" "Cyan"
Write-Log "============================================" "Cyan"
Write-Log "  Total passed:  $totalPassed" $(if ($totalFailed -eq 0) { "Green" } else { "Yellow" })
Write-Log "  Total failed:  $totalFailed" $(if ($totalFailed -eq 0) { "Green" } else { "Red" })
Write-Log "  Total flaky:   $totalFlaky" "Yellow"
Write-Log "" "White"

# Save JSON results
$json = @{
    timestamp = (Get-Date -Format "o")
    summary   = @{
        passed = $totalPassed
        failed = $totalFailed
        flaky  = $totalFlaky
    }
    tests     = $testResults
} | ConvertTo-Json -Depth 5
Set-Content -Path $jsonFile -Value $json
Write-Log "Results saved to: $jsonFile" "DarkGray"

# Save HTML report
$html = @"
<!DOCTYPE html>
<html><head><title>Test Report - $(Get-Date -Format 'yyyy-MM-dd HH:mm')</title>
<style>
body { font-family: monospace; background: #1a1a2e; color: #e0e0e0; padding: 20px; }
h1 { color: #00d4ff; }
.pass { color: #4ade80; } .fail { color: #f87171; } .flaky { color: #fbbf24; }
table { border-collapse: collapse; width: 100%; margin-top: 16px; }
th, td { border: 1px solid #333; padding: 8px 12px; text-align: left; font-size: 13px; }
th { background: #16213e; color: #00d4ff; }
tr:nth-child(even) { background: #16213e; }
.summary { font-size: 18px; margin: 16px 0; }
</style></head><body>
<h1>Test Report</h1>
<p class="summary">
  <span class="pass">$totalPassed passed</span> &middot;
  <span class="fail">$totalFailed failed</span> &middot;
  <span class="flaky">$totalFlaky flaky</span>
</p>
<p>Run: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')</p>
<table><tr><th>Project</th><th>Test</th><th>Status</th></tr>
$($testResults | ForEach-Object {
    $cls = if ($_.Status -eq "PASS") { "pass" } else { "fail" }
    "<tr><td>$($_.Project)</td><td>$($_.Test)</td><td class=`"$cls`">$($_.Status)</td></tr>"
})
</table></body></html>
"@
Set-Content -Path $htmlReport -Value $html
Write-Log "HTML report: $htmlReport" "DarkGray"
Write-Log "Full log: $logFile" "DarkGray"

if ($totalFailed -gt 0) { exit 1 }

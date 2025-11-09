# Helper Script: Add User to Leaderboard (PowerShell version)
#
# Usage:
#   .\scripts\add-to-leaderboard.ps1 -Name "John Doe" -Time 180 -Mode casual -Difficulty easy
#   .\scripts\add-to-leaderboard.ps1 -Name "Jane Smith" -Time 300 -Mode daily -Difficulty medium
#
# Parameters:
#   -Name        Display name for leaderboard (required)
#   -Time        Completion time in seconds (required)
#   -Mode        Game mode: casual, daily, challenge (default: casual)
#   -Difficulty  Difficulty: easy, medium, hard, expert, extreme (default: easy)
#   -ApiUrl      API base URL (default: http://localhost:3011)

param(
    [Parameter(Mandatory=$true)]
    [string]$Name,
    
    [Parameter(Mandatory=$true)]
    [int]$Time,
    
    [string]$Mode = "casual",
    
    [string]$Difficulty = "easy",
    
    [string]$ApiUrl = "http://localhost:3011"
)

function Format-Time {
    param([int]$Milliseconds)
    $totalSeconds = [math]::Floor($Milliseconds / 1000)
    $minutes = [math]::Floor($totalSeconds / 60)
    $seconds = $totalSeconds % 60
    return "{0}:{1:D2}" -f $minutes, $seconds
}

# Convert time to milliseconds
$TimeMs = $Time * 1000
$FormattedTime = Format-Time -Milliseconds $TimeMs

Write-Host ""
Write-Host "🏆 Adding to Leaderboard..." -ForegroundColor Blue
Write-Host ""
Write-Host "Name: $Name"
Write-Host "Mode: $Mode"
Write-Host "Difficulty: $Difficulty"
Write-Host "Time: $FormattedTime ($TimeMs ms)"
Write-Host "API: $ApiUrl"
Write-Host ""

try {
    # Step 1: Get or create a puzzle
    Write-Host "📦 Step 1: Getting puzzle..." -ForegroundColor Blue
    $puzzleUrl = "$ApiUrl/api/puzzles?mode=$Mode&difficulty=$Difficulty"
    $puzzleResponse = Invoke-RestMethod -Uri $puzzleUrl -Method Get
    $puzzleId = $puzzleResponse.id
    Write-Host "✅ Got puzzle: $puzzleId" -ForegroundColor Green

    # Step 2: Create device ID
    Write-Host ""
    Write-Host "📱 Step 2: Creating device..." -ForegroundColor Blue
    $deviceId = "test-device-" + [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()
    Write-Host "✅ Using device ID: $deviceId" -ForegroundColor Green

    # Step 3: Create completed attempt
    Write-Host ""
    Write-Host "⏱️  Step 3: Creating completed attempt..." -ForegroundColor Blue
    $attemptData = @{
        puzzleId = $puzzleId
        deviceId = $deviceId
        mode = $Mode
        difficulty = $Difficulty
        timeMs = $TimeMs
        result = "completed"
        mistakes = 0
        hintsUsed = 0
    }
    
    $attemptUrl = "$ApiUrl/api/attempts"
    $attemptResponse = Invoke-RestMethod -Uri $attemptUrl -Method Post -Body ($attemptData | ConvertTo-Json) -ContentType "application/json"
    $attemptId = $attemptResponse.id
    Write-Host "✅ Created attempt: $attemptId" -ForegroundColor Green

    # Step 4: Update device with display name
    Write-Host ""
    Write-Host "👤 Step 4: Setting display name..." -ForegroundColor Blue
    $deviceData = @{
        displayName = $Name
    }
    
    $deviceUrl = "$ApiUrl/api/device/$deviceId"
    try {
        $deviceResponse = Invoke-RestMethod -Uri $deviceUrl -Method Patch -Body ($deviceData | ConvertTo-Json) -ContentType "application/json"
        Write-Host "✅ Set display name: $Name" -ForegroundColor Green
    } catch {
        Write-Host "⚠️  Could not set display name (device may not exist yet)" -ForegroundColor Yellow
    }

    # Step 5: Verify leaderboard entry
    Write-Host ""
    Write-Host "🏆 Step 5: Verifying leaderboard..." -ForegroundColor Blue
    $leaderboardUrl = "$ApiUrl/api/leaderboard/global?mode=$Mode&difficulty=$Difficulty&limit=10"
    $leaderboardResponse = Invoke-RestMethod -Uri $leaderboardUrl -Method Get
    
    $userEntry = $leaderboardResponse | Where-Object { $_.displayName -eq $Name -or $_.deviceId -eq $deviceId } | Select-Object -First 1
    
    if ($userEntry) {
        $rank = [array]::IndexOf($leaderboardResponse, $userEntry) + 1
        Write-Host "✅ Found on leaderboard!" -ForegroundColor Green
        Write-Host "   Rank: #$rank"
        Write-Host "   Time: $(Format-Time -Milliseconds $userEntry.timeMs)"
    } else {
        Write-Host "⚠️  Entry created but not in top 10" -ForegroundColor Yellow
    }

    Write-Host ""
    Write-Host "✅ Success! User added to leaderboard." -ForegroundColor Green
    Write-Host ""
    $viewUrl = $ApiUrl -replace ':\d+$', ''
    Write-Host "View at: $viewUrl/leaderboard"
    Write-Host ""

} catch {
    Write-Host ""
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    exit 1
}


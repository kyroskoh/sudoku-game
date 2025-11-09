# Restart Backend and Clear Daily Puzzle Cache
# Run this after applying the bug fix

Write-Host "🔧 Restarting Backend with Bug Fix" -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan
Write-Host ""

# Stop any running backend
Write-Host "⏹️  Stopping backend..." -ForegroundColor Yellow
Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object {$_.Path -like "*sudoku-game*"} | Stop-Process -Force
Start-Sleep -Seconds 2

# Clear today's buggy daily puzzle
Write-Host "🗑️  Clearing today's cached daily puzzle..." -ForegroundColor Yellow
Set-Location backend
node ../clear-daily-puzzle.js
Set-Location ..

Write-Host ""
Write-Host "🚀 Starting backend..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; npm run dev"

Write-Host ""
Write-Host "⏳ Waiting for backend to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

Write-Host ""
Write-Host "✅ Backend restarted with bug fix!" -ForegroundColor Green
Write-Host ""
Write-Host "🧪 Test the fix:" -ForegroundColor Cyan
Write-Host "   1. Visit: http://localhost:3010/daily?showans=true&difficulty=easy" -ForegroundColor White
Write-Host "   2. Check that red numbers (answers) create a valid solution" -ForegroundColor White
Write-Host "   3. Try solving - it should be solvable now!" -ForegroundColor White
Write-Host ""
Write-Host "🔍 What was fixed:" -ForegroundColor Cyan
Write-Host "   ❌ Before: Math.random was corrupted by seeding" -ForegroundColor Red
Write-Host "   ✅ After:  Instance-level RNG used correctly" -ForegroundColor Green
Write-Host ""


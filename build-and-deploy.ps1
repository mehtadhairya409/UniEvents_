# build-and-deploy.ps1
# Run this from d:\UniEvents to prepare the full-stack bundle

Write-Host "`n🔨 Step 1: Building React frontend..." -ForegroundColor Cyan
Set-Location client
npm run build
if ($LASTEXITCODE -ne 0) { Write-Host "Build failed!" -ForegroundColor Red; exit 1 }

Write-Host "`n📦 Step 2: Copying build into server/public..." -ForegroundColor Cyan
Set-Location ..
if (Test-Path "server\public") { Remove-Item "server\public" -Recurse -Force }
Copy-Item "client\build" "server\public" -Recurse

Write-Host "`n✅ Done! Your full-stack app is in the 'server' folder." -ForegroundColor Green
Write-Host "   Upload the 'server' folder to Railway/Render." -ForegroundColor Yellow
Write-Host "   Start command: node server.js" -ForegroundColor Yellow

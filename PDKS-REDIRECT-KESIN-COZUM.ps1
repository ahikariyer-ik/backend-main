# PDKS QR Okut Redirect Sorunu - Kesin Çözüm Script
# Bu script'i PowerShell'de çalıştırın

Write-Host "=== PDKS QR Okut Redirect Sorunu Çözümü ===" -ForegroundColor Cyan
Write-Host ""

# 1. Tüm Node process'lerini durdur
Write-Host "1. Node.js process'leri durduruluyor..." -ForegroundColor Yellow
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 2
Write-Host "   ✓ Tamamlandı" -ForegroundColor Green
Write-Host ""

# 2. Port 3001'i temizle
Write-Host "2. Port 3001 temizleniyor..." -ForegroundColor Yellow
$process = Get-NetTCPConnection -LocalPort 3001 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess
if ($process) {
    Stop-Process -Id $process -Force -ErrorAction SilentlyContinue
    Write-Host "   ✓ Port temizlendi" -ForegroundColor Green
} else {
    Write-Host "   ✓ Port zaten boş" -ForegroundColor Green
}
Write-Host ""

# 3. .next klasörünü sil
Write-Host "3. Next.js cache temizleniyor..." -ForegroundColor Yellow
$nextPath = "C:\Users\M3001-4\Desktop\ahikariyer\Ahi-Kariyer\ahikariyer-ik-backend-main\.next"
if (Test-Path $nextPath) {
    Remove-Item -Recurse -Force $nextPath
    Write-Host "   ✓ .next klasörü silindi" -ForegroundColor Green
} else {
    Write-Host "   ✓ .next klasörü zaten yok" -ForegroundColor Green
}
Write-Host ""

# 4. Server'ı başlat
Write-Host "4. Server başlatılıyor..." -ForegroundColor Yellow
Write-Host ""
Write-Host "=== ŞIMDI YAPIN ===" -ForegroundColor Red
Write-Host "1. Bu terminal'i açık bırakın" -ForegroundColor White
Write-Host "2. Yeni bir terminal açın" -ForegroundColor White
Write-Host "3. Şu komutu çalıştırın:" -ForegroundColor White
Write-Host ""
Write-Host "   cd C:\Users\M3001-4\Desktop\ahikariyer\Ahi-Kariyer\ahikariyer-ik-backend-main" -ForegroundColor Cyan
Write-Host "   npm run dev" -ForegroundColor Cyan
Write-Host ""
Write-Host "4. Server başladıktan sonra (Ready - started server on...) görünce:" -ForegroundColor White
Write-Host "   - Browser'da Ctrl+Shift+Delete → Cache temizle" -ForegroundColor Yellow
Write-Host "   - Logout yapın" -ForegroundColor Yellow
Write-Host "   - Worker hesabı ile login yapın" -ForegroundColor Yellow
Write-Host "   - PDKS QR Okut'a tıklayın" -ForegroundColor Yellow
Write-Host ""
Write-Host "=== BİTTİ ===" -ForegroundColor Green







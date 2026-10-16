@ECHO off
REM Start muse-ai-local-bridge untuk project ini. Biarkan window ini terbuka.
cd /d "%~dp0"

where node >nul 2>nul
IF ERRORLEVEL 1 (
  echo [bridge] Node.js 18+ tidak ditemukan. Install dulu dari https://nodejs.org
  pause
  exit /b 1
)

where mbridge >nul 2>nul
IF ERRORLEVEL 1 (
  echo [bridge] mbridge tidak ditemukan. Jalankan: npm install -g muse-ai-local-bridge
  pause
  exit /b 1
)

REM Kalau 8787 sudah melayani bridge, pakai saja (hindari EADDRINUSE).
curl.exe -s http://127.0.0.1:8787/ 2>nul | findstr "muse-ai-local-bridge" >nul
IF NOT ERRORLEVEL 1 (
  echo [bridge] Sudah jalan di http://127.0.0.1:8787 - pakai saja, tidak perlu start lagi.
  echo [bridge] Token ada di: %USERPROFILE%\.muse-ai-local-bridge\token
  pause
  exit /b 0
)

echo [bridge] Starting di D:\lrvProject\PerangkatAjar ...
echo [bridge] Token akan tampil sekali di bawah - JANGAN paste ke chat, masukkan via connection card.
mbridge --allow "npm test" --allow "npm run lint" --allow "npm run build"
pause

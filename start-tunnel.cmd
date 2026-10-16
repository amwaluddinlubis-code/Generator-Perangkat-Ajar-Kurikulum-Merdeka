@ECHO off
REM Start Cloudflare tunnel ke bridge localhost:8787. Biarkan window ini terbuka.
cd /d "%~dp0"

where cloudflared >nul 2>nul
IF ERRORLEVEL 1 (
  echo [tunnel] cloudflared belum terinstal.
  echo [tunnel] Install dengan: winget install --id Cloudflare.cloudflared
  echo [tunnel] Lalu jalankan lagi file ini.
  pause
  exit /b 1
)

echo [tunnel] Menghubungkan http://localhost:8787 ...
echo [tunnel] Catat URL https://xxx.trycloudflare.com yang muncul, lalu paste di chat Muse:
echo [tunnel]   connect to my local bridge at https://xxx.trycloudflare.com
cloudflared tunnel --url http://localhost:8787
pause

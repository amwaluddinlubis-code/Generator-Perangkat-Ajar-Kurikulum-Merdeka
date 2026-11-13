@ECHO off
REM Start ngrok tunnel ke bridge localhost:8787. Biarkan window ini terbuka.
cd /d "%~dp0"

where ngrok >nul 2>nul
IF ERRORLEVEL 1 (
  echo [ngrok] ngrok belum terinstal.
  echo [ngrok] Install dengan: winget install --id Ngrok.ngrok
  pause
  exit /b 1
)

ngrok config check >nul 2>&1
IF ERRORLEVEL 1 (
  echo [ngrok] Authtoken belum dipasang.
  echo [ngrok] Daftar gratis di https://dashboard.ngrok.com lalu jalankan sekali:
  echo [ngrok]   ngrok config add-authtoken TOKEN_KAMU
  pause
  exit /b 1
)

echo [ngrok] Menghubungkan http://127.0.0.1:8787 ...
echo [ngrok] Catat URL https://xxx.ngrok.io yang muncul, lalu paste di chat Muse:
echo [ngrok]   connect to my local bridge at https://xxx.ngrok.io
ngrok http 127.0.0.1:8787
pause

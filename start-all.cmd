@ECHO off
REM Sekali klik: buka bridge + tunnel di window terpisah.
cd /d "%~dp0"
start "muse-bridge" "%~dp0start-bridge.cmd"
timeout /t 3 /nobreak >nul
start "muse-tunnel" "%~dp0start-tunnel.cmd"
echo Kedua window (muse-bridge dan muse-tunnel) sudah dibuka. Biarkan keduanya terbuka.

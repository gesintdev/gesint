@echo off
REM Rode como Administrador
set HOSTS=%SystemRoot%\System32\drivers\etc\hosts
findstr /C:"teste.gommo.local" "%HOSTS%" >nul
if errorlevel 1 (
  echo.>> "%HOSTS%"
  echo LAB_LAN_HOST   teste.gommo.local>> "%HOSTS%"
  echo ADDED teste.gommo.local
) else (
  echo ALREADY_PRESENT teste.gommo.local
)
ipconfig /flushdns >nul
echo.
echo Pronto. Abra https://teste.gommo.local/login
pause

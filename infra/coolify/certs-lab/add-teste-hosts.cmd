@echo off
REM Rode como Administrador
set HOSTS=%SystemRoot%\System32\drivers\etc\hosts
findstr /C:"teste.gesint.local" "%HOSTS%" >nul
if errorlevel 1 (
  echo.>> "%HOSTS%"
  REM Substitua LAB_LAN_HOST pelo IP do host Coolify na sua LAN
  echo LAB_LAN_HOST   teste.gesint.local>> "%HOSTS%"
  echo ADDED teste.gesint.local
) else (
  echo ALREADY_PRESENT teste.gesint.local
)
ipconfig /flushdns >nul
echo.
echo Pronto. Abra https://teste.gesint.local/login
pause

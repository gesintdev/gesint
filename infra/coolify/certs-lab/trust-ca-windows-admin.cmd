@echo off
REM Execute como Administrador
certutil -addstore -f Root "%~dp0gommo-lab-ca.cer"
echo CA adicionada. Feche TODAS as janelas do Chrome e abra de novo.
pause

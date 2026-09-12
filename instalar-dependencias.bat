@echo off
setlocal
cd /d "%~dp0BACKEND"
where npm >nul 2>nul
if errorlevel 1 (
  echo Node.js y npm no estan instalados.
  echo Instala Node.js LTS desde https://nodejs.org/
  pause
  exit /b 1
)
npm install
if errorlevel 1 (
  echo No se pudieron instalar las dependencias.
  pause
  exit /b 1
)
echo Dependencias instaladas correctamente.
pause

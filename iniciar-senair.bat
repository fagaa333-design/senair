@echo off
setlocal
cd /d "%~dp0BACKEND"
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js no esta instalado.
  echo Instala Node.js LTS desde https://nodejs.org/
  pause
  exit /b 1
)
if not exist "node_modules\express" (
  echo Faltan dependencias. Ejecuta instalar-dependencias.bat primero.
  pause
  exit /b 1
)
echo SENAIR se iniciara en http://localhost:3000/html/index.html
start "SENAIR" http://localhost:3000/html/index.html
npm start

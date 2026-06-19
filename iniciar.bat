@echo off
title Bolão de Jogos
echo ================================
echo   BOLÃO DE JOGOS
echo ================================
echo.
echo Iniciando servidor...
echo.
start http://localhost:3000/admin.html
node server.js
pause

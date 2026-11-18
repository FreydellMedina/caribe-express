@echo off
title Caribe Express - Servidor MongoDB Local
echo ========================================================
echo       Iniciando Servidor MongoDB (Caribe Express)
echo ========================================================
echo Puerto: 27017
echo Base de Datos: caribe_express
echo Directorio de Datos: %~dp0data\mongodb
echo.

if not exist "%~dp0data\mongodb" (
    mkdir "%~dp0data\mongodb"
)

"C:\Program Files\MongoDB\Server\8.2\bin\mongod.exe" --dbpath "%~dp0data\mongodb" --bind_ip 127.0.0.1 --port 27017
pause


@echo off
echo ========================================
echo  COMPLETE REINSTALL - REMOVING AGORA
echo ========================================
echo.

cd frontend

echo [1/6] Killing all Node processes...
taskkill /F /IM node.exe 2>nul
timeout /t 3 >nul

echo [2/6] Deleting node_modules (this may take a minute)...
if exist node_modules rmdir /s /q node_modules

echo [3/6] Deleting package-lock.json...
if exist package-lock.json del /f /q package-lock.json

echo [4/6] Deleting all cache folders...
if exist .expo rmdir /s /q .expo
if exist node_modules\.cache rmdir /s /q node_modules\.cache

echo [5/6] Reinstalling all packages fresh...
npm install

echo [6/6] Starting Expo with clean slate...
echo.
echo ========================================
echo  REINSTALL COMPLETE
echo ========================================
echo.
echo IMPORTANT:
echo 1. Close Expo Go on BOTH phones
echo 2. Wait for QR code
echo 3. Scan QR code on BOTH phones
echo.

npx expo start --clear

pause

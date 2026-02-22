@echo off
echo ========================================
echo  CLEARING ALL CACHES - COMPLETE RESET
echo ========================================
echo.

cd frontend

echo [1/5] Stopping Metro bundler...
taskkill /F /IM node.exe 2>nul
timeout /t 2 >nul

echo [2/5] Clearing Metro cache...
if exist node_modules\.cache rmdir /s /q node_modules\.cache
if exist .expo rmdir /s /q .expo

echo [3/5] Clearing temp directories...
if exist %TEMP%\metro-* rmdir /s /q %TEMP%\metro-*
if exist %TEMP%\haste-* rmdir /s /q %TEMP%\haste-*
if exist %TEMP%\react-* rmdir /s /q %TEMP%\react-*

echo [4/5] Clearing watchman (if installed)...
watchman watch-del-all 2>nul

echo [5/5] Starting fresh Metro bundler...
echo.
echo ========================================
echo  CACHE CLEARED - STARTING FRESH
echo ========================================
echo.
echo IMPORTANT: On BOTH phones:
echo 1. Close Expo Go completely (swipe away)
echo 2. Wait for QR code below
echo 3. Open Expo Go and scan QR code
echo.

npx expo start --clear --reset-cache

pause

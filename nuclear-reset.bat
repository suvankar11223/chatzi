@echo off
echo ========================================
echo  NUCLEAR RESET - CLEARING EVERYTHING
echo ========================================
echo.

cd frontend

echo [1/8] Killing all Node processes...
taskkill /F /IM node.exe 2>nul
timeout /t 2 >nul

echo [2/8] Deleting .expo folder...
if exist .expo rmdir /s /q .expo

echo [3/8] Deleting node_modules\.cache...
if exist node_modules\.cache rmdir /s /q node_modules\.cache

echo [4/8] Deleting Metro cache...
if exist %LOCALAPPDATA%\Temp\metro-* (
    for /d %%i in (%LOCALAPPDATA%\Temp\metro-*) do rmdir /s /q "%%i"
)
if exist %LOCALAPPDATA%\Temp\haste-* (
    for /d %%i in (%LOCALAPPDATA%\Temp\haste-*) do rmdir /s /q "%%i"
)
if exist %LOCALAPPDATA%\Temp\react-* (
    for /d %%i in (%LOCALAPPDATA%\Temp\react-*) do rmdir /s /q "%%i"
)

echo [5/8] Clearing npm cache...
npm cache clean --force

echo [6/8] Clearing watchman...
watchman watch-del-all 2>nul

echo [7/8] Reinstalling dependencies...
npm install

echo [8/8] Starting with complete cache reset...
echo.
echo ========================================
echo  COMPLETE RESET DONE
echo ========================================
echo.
echo CRITICAL STEPS:
echo 1. CLOSE Expo Go on BOTH phones completely
echo 2. Wait for QR code below
echo 3. Open Expo Go and scan QR code on BOTH phones
echo 4. Test the call feature
echo.

npx expo start --clear --reset-cache

pause

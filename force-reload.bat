@echo off
echo ========================================
echo  FORCE RELOAD - EXPO GO CACHE CLEAR
echo ========================================
echo.

cd frontend

echo Stopping Metro...
taskkill /F /IM node.exe 2>nul
timeout /t 2 >nul

echo.
echo Starting with maximum cache clearing...
echo.

npx expo start --clear --reset-cache --no-dev --minify

echo.
echo ========================================
echo  CRITICAL INSTRUCTIONS
echo ========================================
echo.
echo On BOTH phones, do this EXACTLY:
echo.
echo 1. Open Expo Go
echo 2. Shake the phone
echo 3. Tap "Reload"
echo 4. Wait 5 seconds
echo 5. Shake again
echo 6. Tap "Reload" again
echo 7. Now test the call
echo.
echo This forces Expo Go to clear its route cache.
echo.

pause

@echo off
echo ========================================
echo Restarting with Render Backend
echo ========================================
echo.
echo This will:
echo 1. Clear Metro cache
echo 2. Connect to Render: https://chatzi-1m0m.onrender.com
echo 3. No local backend needed!
echo.
pause

cd frontend

echo Clearing cache and starting...
npx expo start --dev-client --clear

pause

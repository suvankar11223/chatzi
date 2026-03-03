@echo off
echo ========================================
echo Rebuilding Development Build
echo ========================================
echo.
echo This will:
echo 1. Clean the project
echo 2. Prebuild native code
echo 3. Build a new development client
echo.
echo This may take 5-10 minutes...
echo.
pause

cd frontend

echo.
echo [1/3] Cleaning project...
call npx expo prebuild --clean

echo.
echo [2/3] Building development client for Android...
echo (This will take several minutes)
call npx expo run:android

echo.
echo ========================================
echo Build Complete!
echo ========================================
echo.
echo Now you can start the dev server with:
echo   cd frontend
echo   npx expo start --dev-client
echo.
pause

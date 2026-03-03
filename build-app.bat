@echo off
echo ========================================
echo Building Development Client
echo ========================================
echo.
echo This will:
echo 1. Navigate to frontend directory
echo 2. Configure EAS Build
echo 3. Build development client for Android
echo.
echo Press Ctrl+C to cancel, or
pause

cd frontend

echo.
echo ========================================
echo Step 1: Configuring EAS Build
echo ========================================
echo.
call eas build:configure

echo.
echo ========================================
echo Step 2: Building Development Client
echo ========================================
echo.
echo This will take 10-15 minutes...
echo.
call eas build --profile development --platform android

echo.
echo ========================================
echo Build Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Download the APK from the link above
echo 2. Install on your Android device
echo 3. Run: start-backend.bat
echo 4. Run: start-frontend.bat
echo.
pause

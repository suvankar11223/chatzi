@echo off
echo ========================================
echo Starting Development Server for Custom Build
echo ========================================
echo.
echo Make sure:
echo 1. Your development build APK is installed on device
echo 2. Device and computer are on same network
echo 3. Backend is running (npm run dev in backend folder)
echo.
pause

cd frontend

echo Starting Metro bundler for development client...
echo.
echo After this starts:
echo 1. Open the Chatzi (dev) app on your device
echo 2. It should connect automatically
echo 3. If not, scan the QR code or enter the URL manually
echo.

npx expo start --dev-client --clear

pause

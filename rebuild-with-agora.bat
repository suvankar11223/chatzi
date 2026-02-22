@echo off
echo ========================================
echo Rebuilding App with Agora
echo ========================================
echo.
echo This will create a new development build with Agora support.
echo.
echo IMPORTANT: This takes 15-20 minutes!
echo.
pause

cd frontend

echo.
echo Starting EAS build...
echo.
call eas build --platform android --profile development

echo.
echo ========================================
echo Build Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Download the APK from the link shown above
echo 2. Install it on your phone
echo 3. Run: npx expo start --dev-client
echo 4. Scan the QR code with the installed app
echo.
pause

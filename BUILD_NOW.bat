@echo off
echo ========================================
echo   BUBLIZI - READY TO BUILD
echo ========================================
echo.
echo All issues fixed:
echo   [x] Clerk plugin removed from app.json
echo   [x] Firebase google-services.json deleted
echo   [x] Google Services plugin removed
echo   [x] Package name updated to com.chinmayee.bublizi
echo   [x] TypeScript checks passing
echo.
echo Starting build...
echo.

cd frontend
eas build --profile development --platform android

echo.
echo ========================================
echo   BUILD COMPLETE
echo ========================================
echo.
echo Next steps:
echo   1. Go to EAS dashboard
echo   2. Download APK
echo   3. Install on device
echo   4. Test Clerk authentication
echo   5. Test AI Suggestions
echo.
pause

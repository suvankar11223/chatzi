@echo off
echo ============================================================
echo Quick Local Backend Setup
echo ============================================================
echo.

REM Get local IP
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4 Address"') do (
    set IP=%%a
    goto :found
)

:found
REM Trim spaces
set IP=%IP: =%

echo Your local IP: %IP%
echo.
echo INSTRUCTIONS:
echo.
echo 1. Update frontend/utils/network.ts:
echo    Change PRODUCTION_URL to: "http://%IP%:3000"
echo.
echo 2. Start backend in a new terminal:
echo    cd backend
echo    npm run dev
echo.
echo 3. Restart Expo with cache clear:
echo    cd frontend
echo    npx expo start -c
echo.
echo 4. Login with: tini@test.com / password123
echo.
echo ============================================================
pause

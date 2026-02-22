@echo off
echo ============================================================
echo Starting Local Backend + Expo
echo ============================================================
echo.
echo Your local IP: 172.25.255.16
echo Backend URL: http://172.25.255.16:3000
echo.
echo IMPORTANT: Keep this window open!
echo.
echo ============================================================
echo.

REM Start backend in a new window
start "Backend Server" cmd /k "cd backend && npm run dev"

echo Waiting 5 seconds for backend to start...
timeout /t 5 /nobreak > nul

REM Start Expo in a new window
start "Expo Dev Server" cmd /k "cd frontend && npx expo start -c"

echo.
echo ============================================================
echo Both servers starting in separate windows!
echo ============================================================
echo.
echo Backend: http://172.25.255.16:3000
echo Expo: Check the "Expo Dev Server" window
echo.
echo Login with: tini@test.com / password123
echo.
echo Press any key to close this window (servers will keep running)
pause > nul

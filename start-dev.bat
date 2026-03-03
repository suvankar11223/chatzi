@echo off
echo ========================================
echo   BUBLIZI - Development Environment
echo ========================================
echo.
echo Starting backend and frontend servers...
echo.

REM Start backend in new window
start "Bublizi Backend" cmd /k "cd backend && echo === BACKEND SERVER === && echo Starting on http://localhost:3000 && echo. && npm start"

REM Wait 3 seconds for backend to initialize
timeout /t 3 /nobreak >nul

REM Start frontend in new window (auto-accept port change)
start "Bublizi Frontend" cmd /k "cd frontend && echo === FRONTEND DEV CLIENT === && echo. && echo Instructions: && echo 1. Scan QR code with your device && echo 2. Make sure device has dev build installed && echo 3. Device and computer must be on same WiFi && echo. && echo y | npx expo start --dev-client"

echo.
echo ========================================
echo   SERVERS STARTING
echo ========================================
echo.
echo Backend:  http://localhost:3000
echo Frontend: Scan QR code with device
echo.
echo Two new windows opened:
echo   1. Backend Server (Node.js)
echo   2. Frontend Dev Client (Expo)
echo.
echo If port 8081 is in use, it will use 8082 automatically.
echo.
echo Press any key to close this window...
pause >nul

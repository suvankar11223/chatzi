@echo off
echo ============================================================
echo Starting Backend with ngrok Tunnel
echo ============================================================
echo.

REM Check if ngrok is installed
where ngrok >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: ngrok is not installed or not in PATH
    echo.
    echo Please install ngrok:
    echo 1. Download from: https://ngrok.com/download
    echo 2. Extract to a folder
    echo 3. Add to PATH or run from that folder
    echo.
    pause
    exit /b 1
)

echo Step 1: Starting backend server...
echo.
start "Backend Server" cmd /k "cd backend && npm run dev"

echo Waiting for backend to start...
timeout /t 5 /nobreak >nul

echo.
echo Step 2: Starting ngrok tunnel...
echo.
echo IMPORTANT: Copy the HTTPS URL from ngrok output
echo Example: https://abc123.ngrok-free.app
echo.
echo Then update frontend/utils/network.ts with this URL
echo.
pause

start "ngrok Tunnel" cmd /k "ngrok http 3000"

echo.
echo ============================================================
echo Setup Complete!
echo ============================================================
echo.
echo Next steps:
echo 1. Copy the ngrok HTTPS URL from the ngrok window
echo 2. Update frontend/utils/network.ts (line 5)
echo 3. Restart your Expo app
echo.
echo Press any key to exit...
pause >nul

@echo off
echo ========================================
echo Starting Frontend App
echo ========================================
echo.
echo Make sure you have:
echo 1. Built and installed the development client
echo 2. Backend server is running
echo.
cd frontend
npx expo start --dev-client

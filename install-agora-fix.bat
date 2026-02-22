@echo off
echo ========================================
echo Installing Agora SDK (with legacy peer deps)
echo ========================================
echo.

cd frontend

echo Installing react-native-agora...
call npm install --save react-native-agora --legacy-peer-deps

echo.
echo ========================================
echo Installation Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Restart your Expo dev server with: npx expo start -c
echo 2. Test voice/video calls!
echo.
pause

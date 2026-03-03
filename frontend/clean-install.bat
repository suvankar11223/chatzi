@echo off
echo Cleaning node_modules and package-lock.json...
echo.

REM Kill any node processes that might be locking files
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul

REM Remove node_modules
if exist node_modules (
    echo Removing node_modules...
    rmdir /s /q node_modules
    if exist node_modules (
        echo Warning: Some files in node_modules could not be deleted
        echo Trying alternative method...
        del /f /s /q node_modules\* 2>nul
        rmdir /s /q node_modules 2>nul
    )
)

REM Remove package-lock.json
if exist package-lock.json (
    echo Removing package-lock.json...
    del /f /q package-lock.json
)

echo.
echo Installing packages...
call npm install

echo.
echo Done! Ready to build.
pause

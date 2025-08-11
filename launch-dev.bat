@echo off
echo Starting DevGear Extension Development...
echo.
echo 1. Compiling TypeScript...
call npm run compile
if %errorlevel% neq 0 (
    echo ERROR: Compilation failed!
    pause
    exit /b 1
)

echo 2. TypeScript compilation successful!
echo.
echo 3. Starting VS Code Extension Development Host...
echo    Press F5 in VS Code or use Debug -> Start Debugging
echo    Make sure you have the DevGear folder open in VS Code
echo.

pause

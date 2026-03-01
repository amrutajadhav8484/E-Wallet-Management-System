@echo off
echo ========================================
echo Starting React Frontend
echo ========================================
echo.
echo Frontend will start on http://localhost:3000
echo.
echo Make sure backend is running first!
echo.
cd frontend
if not exist node_modules (
    echo Installing dependencies (first time only)...
    npm install
)
echo.
echo Starting frontend...
npm start

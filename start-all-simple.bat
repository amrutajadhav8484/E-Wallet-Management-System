@echo off
echo ========================================
echo Starting Complete E-Wallet Project
echo ========================================
echo.
echo This will start:
echo 1. Spring Boot Backend (port 8080)
echo 2. React Frontend (port 3000)
echo.
echo NOTE: Make sure MySQL is running first!
echo.
pause

echo.
echo Starting Spring Boot Backend...
start "Spring Boot Backend" cmd /k "mvn spring-boot:run"

echo Waiting 15 seconds for backend to start...
timeout /t 15 /nobreak >nul

echo.
echo Starting React Frontend...
start "React Frontend" cmd /k "cd frontend && npm start"

echo.
echo ========================================
echo Both services are starting!
echo ========================================
echo.
echo - Spring Boot API: http://localhost:8080/swagger-ui.html
echo - React Frontend: http://localhost:3000
echo - Logs: LoggingService/logs/application.txt
echo.
echo Check the two new windows for service status.
echo.
pause

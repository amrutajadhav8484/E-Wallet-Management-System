@echo off
echo ========================================
echo Starting Complete E-Wallet Project
echo ========================================
echo.
echo Starting services in order:
echo 1. .NET Logging Service (port 5000)
echo 2. Spring Boot Backend (port 8080)
echo 3. React Frontend (port 3000)
echo.
echo Press any key to continue...
pause

echo.
echo Starting .NET Logging Service...
start "Logging Service" cmd /k "cd LoggingService && dotnet run"

echo Waiting 10 seconds for logging service to start...
timeout /t 10 /nobreak >nul

echo.
echo Starting Spring Boot Backend...
start "Spring Boot" cmd /k "mvn spring-boot:run"

echo Waiting 15 seconds for backend to start...
timeout /t 15 /nobreak >nul

echo.
echo Starting React Frontend...
start "React Frontend" cmd /k "cd frontend && npm start"

echo.
echo ========================================
echo All services are starting!
echo ========================================
echo.
echo - Logging Service: http://localhost:5000/swagger
echo - Spring Boot API: http://localhost:8080/swagger-ui.html
echo - React Frontend: http://localhost:3000
echo.
echo Check the three new windows for service status.
echo.
echo NOTE: Make sure MySQL is running before starting!
echo.
pause

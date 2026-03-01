@echo off
echo ========================================
echo Starting Both Services
echo ========================================
echo.
echo This will start:
echo 1. .NET Logging Service (port 5000)
echo 2. Spring Boot Application (port 8080)
echo.
echo Press any key to continue...
pause

echo.
echo Starting .NET Logging Service...
start "Logging Service" cmd /k "cd LoggingService && dotnet run"

echo Waiting 5 seconds for logging service to start...
timeout /t 5 /nobreak >nul

echo.
echo Starting Spring Boot Application...
start "Spring Boot" cmd /k "mvn spring-boot:run"

echo.
echo ========================================
echo Both services are starting!
echo ========================================
echo.
echo - Logging Service: http://localhost:5000/swagger
echo - Spring Boot API: http://localhost:8080/swagger-ui.html
echo.
echo Check the two new windows for service status.
echo.
pause

@echo off
echo ========================================
echo Starting Spring Boot Backend
echo ========================================
echo.
echo Backend will start on http://localhost:8080
echo Logs will be written to LoggingService/logs/application.txt
echo.
echo Make sure MySQL is running first!
echo.
pause
mvn spring-boot:run

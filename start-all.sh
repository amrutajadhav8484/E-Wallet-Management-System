#!/bin/bash

echo "========================================"
echo "Starting Both Services"
echo "========================================"
echo ""
echo "This will start:"
echo "1. .NET Logging Service (port 5000)"
echo "2. Spring Boot Application (port 8080)"
echo ""

# Start .NET Logging Service in background
echo "Starting .NET Logging Service..."
cd LoggingService
dotnet run &
LOGGER_PID=$!
cd ..

# Wait for logging service to start
echo "Waiting 5 seconds for logging service to start..."
sleep 5

# Start Spring Boot Application
echo ""
echo "Starting Spring Boot Application..."
mvn spring-boot:run &
SPRING_PID=$!

echo ""
echo "========================================"
echo "Both services are starting!"
echo "========================================"
echo ""
echo "- Logging Service: http://localhost:5000/swagger"
echo "- Spring Boot API: http://localhost:8080/swagger-ui.html"
echo ""
echo "Press Ctrl+C to stop both services"
echo ""

# Wait for user interrupt
trap "kill $LOGGER_PID $SPRING_PID; exit" INT TERM
wait

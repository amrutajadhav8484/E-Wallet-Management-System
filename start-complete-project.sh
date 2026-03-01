#!/bin/bash

echo "========================================"
echo "Starting Complete E-Wallet Project"
echo "========================================"
echo ""
echo "Starting services in order:"
echo "1. .NET Logging Service (port 5000)"
echo "2. Spring Boot Backend (port 8080)"
echo "3. React Frontend (port 3000)"
echo ""

# Start .NET Logging Service
echo "Starting .NET Logging Service..."
cd LoggingService
dotnet run &
LOGGER_PID=$!
cd ..

# Wait for logging service
echo "Waiting 10 seconds for logging service to start..."
sleep 10

# Start Spring Boot Backend
echo ""
echo "Starting Spring Boot Backend..."
mvn spring-boot:run &
SPRING_PID=$!

# Wait for backend
echo "Waiting 15 seconds for backend to start..."
sleep 15

# Start React Frontend
echo ""
echo "Starting React Frontend..."
cd frontend
npm start &
FRONTEND_PID=$!
cd ..

echo ""
echo "========================================"
echo "All services are starting!"
echo "========================================"
echo ""
echo "- Logging Service: http://localhost:5000/swagger"
echo "- Spring Boot API: http://localhost:8080/swagger-ui.html"
echo "- React Frontend: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop all services"
echo ""

# Wait for user interrupt
trap "kill $LOGGER_PID $SPRING_PID $FRONTEND_PID; exit" INT TERM
wait

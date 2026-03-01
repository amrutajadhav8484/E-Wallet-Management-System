#!/bin/bash

echo "========================================"
echo "Starting Spring Boot Application"
echo "========================================"
echo ""
echo "Make sure .NET Logging Service is running first!"
echo "(Run ./start-logger.sh in another terminal)"
echo ""
echo "Running: mvn spring-boot:run"
echo "Application will start on http://localhost:8080"
echo ""
mvn spring-boot:run

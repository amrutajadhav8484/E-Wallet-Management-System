#!/bin/bash

echo "========================================"
echo "Starting .NET Logging Service"
echo "========================================"
cd LoggingService
echo ""
echo "Running: dotnet run"
echo "Service will start on http://localhost:5000"
echo ""
dotnet run

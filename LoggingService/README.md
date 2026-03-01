# Simple .NET File Logger

A simple .NET console application that writes logs to text files.

## Features

- ✅ Writes logs to text files
- ✅ Separate error log file
- ✅ Daily log rotation
- ✅ Simple console application (no web API)

## Log Files

- **All Logs**: `logs/application.txt`
- **Errors Only**: `logs/error.txt`

## How to Run

```bash
cd LoggingService
dotnet restore
dotnet build
dotnet run
```

The application will:
- Create `logs/` directory if it doesn't exist
- Write logs to `logs/application.txt` and `logs/error.txt`
- Keep running until you press Ctrl+C

## Log Format

```
[2026-01-28 14:30:45] [INFO] [Context: UserController] [UserId: 123] User logged in successfully
[2026-01-28 14:30:46] [ERROR] [Context: GlobalExceptionHandler] Error occurred: Connection timeout
```

## Notes

- This is a simple file logger - no web API endpoints
- Logs are written directly to text files
- Spring Boot writes logs to the same file location
- Keep this running while using the application

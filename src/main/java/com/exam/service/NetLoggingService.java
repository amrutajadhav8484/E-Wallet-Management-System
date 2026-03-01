package com.exam.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.FileWriter;
import java.io.IOException;
import java.io.PrintWriter;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

/**
 * Simple file-based logging service
 * Writes logs directly to text files
 */
@Service
public class NetLoggingService {
    
    @Value("${logging.service.enabled:true}")
    private boolean loggingEnabled;
    
    @Value("${logging.file.path:LoggingService/logs}")
    private String logFilePath;
    
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
    
    /**
     * Log an information message
     */
    public void logInfo(String message, String context, String userId) {
        if (!loggingEnabled) return;
        writeLog("INFO", message, context, userId, null);
    }
    
    /**
     * Log a warning message
     */
    public void logWarning(String message, String context, String userId) {
        if (!loggingEnabled) return;
        writeLog("WARN", message, context, userId, null);
    }
    
    /**
     * Log an error message
     */
    public void logError(String message, String context, String userId, Exception exception) {
        if (!loggingEnabled) return;
        String exceptionMsg = exception != null ? exception.getMessage() : null;
        writeLog("ERROR", message, context, userId, exceptionMsg);
    }
    
    /**
     * Log a debug message
     */
    public void logDebug(String message, String context, String userId) {
        if (!loggingEnabled) return;
        writeLog("DEBUG", message, context, userId, null);
    }
    
    /**
     * Write log entry to text file
     */
    private void writeLog(String level, String message, String context, String userId, String exception) {
        try {
            // Create logs directory if it doesn't exist
            Path logDir = Paths.get(logFilePath);
            if (!Files.exists(logDir)) {
                Files.createDirectories(logDir);
            }
            
            // Determine log file (error.txt for errors, application.txt for others)
            String fileName = "ERROR".equals(level) ? "error.txt" : "application.txt";
            Path logFile = logDir.resolve(fileName);
            
            // Format log entry
            String timestamp = LocalDateTime.now().format(DATE_FORMATTER);
            StringBuilder logEntry = new StringBuilder();
            logEntry.append("[").append(timestamp).append("] ");
            logEntry.append("[").append(level).append("] ");
            if (context != null) {
                logEntry.append("[Context: ").append(context).append("] ");
            }
            if (userId != null) {
                logEntry.append("[UserId: ").append(userId).append("] ");
            }
            logEntry.append(message);
            if (exception != null) {
                logEntry.append(" | Exception: ").append(exception);
            }
            logEntry.append(System.lineSeparator());
            
            // Write to file (append mode)
            try (PrintWriter writer = new PrintWriter(new FileWriter(logFile.toFile(), true))) {
                writer.print(logEntry.toString());
                writer.flush();
            }
            
        } catch (IOException e) {
            // Silently fail - don't break application if logging fails
            System.err.println("Failed to write log: " + e.getMessage());
        }
    }
}

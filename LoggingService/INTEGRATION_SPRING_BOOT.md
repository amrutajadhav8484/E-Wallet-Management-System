# Integrating .NET Logging Service with Spring Boot

This guide shows how to integrate the .NET C# Logging Service with your Spring Boot application.

## 📋 Prerequisites

1. .NET Logging Service running on `http://localhost:5000`
2. Spring Boot application with RestTemplate or WebClient

## 🔧 Step 1: Add Dependencies to Spring Boot

Add to `pom.xml`:

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-webflux</artifactId>
</dependency>
```

Or use RestTemplate (already included in spring-boot-starter-web).

## 📝 Step 2: Create Logging Service Client

Create `src/main/java/com/exam/service/NetLoggingService.java`:

```java
package com.exam.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Service
public class NetLoggingService {
    
    private final RestTemplate restTemplate;
    
    @Value("${logging.service.url:http://localhost:5000}")
    private String loggingServiceUrl;
    
    public NetLoggingService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }
    
    /**
     * Log an information message
     */
    public void logInfo(String message, String context, String userId) {
        try {
            Map<String, Object> request = new HashMap<>();
            request.put("message", message);
            request.put("context", context);
            request.put("userId", userId);
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(request, headers);
            
            restTemplate.postForObject(
                loggingServiceUrl + "/api/log/info", 
                entity, 
                Map.class
            );
        } catch (Exception e) {
            // Fallback to console if logging service is unavailable
            System.err.println("Failed to log to .NET service: " + e.getMessage());
        }
    }
    
    /**
     * Log a warning message
     */
    public void logWarning(String message, String context, String userId) {
        try {
            Map<String, Object> request = new HashMap<>();
            request.put("message", message);
            request.put("context", context);
            request.put("userId", userId);
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(request, headers);
            
            restTemplate.postForObject(
                loggingServiceUrl + "/api/log/warn", 
                entity, 
                Map.class
            );
        } catch (Exception e) {
            System.err.println("Failed to log warning: " + e.getMessage());
        }
    }
    
    /**
     * Log an error message
     */
    public void logError(String message, String context, String userId, Exception exception) {
        try {
            Map<String, Object> request = new HashMap<>();
            request.put("message", message);
            request.put("context", context);
            request.put("userId", userId);
            request.put("exception", exception != null ? exception.getMessage() : "Unknown error");
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(request, headers);
            
            restTemplate.postForObject(
                loggingServiceUrl + "/api/log/error", 
                entity, 
                Map.class
            );
        } catch (Exception e) {
            System.err.println("Failed to log error: " + e.getMessage());
        }
    }
    
    /**
     * Log a debug message
     */
    public void logDebug(String message, String context, String userId) {
        try {
            Map<String, Object> request = new HashMap<>();
            request.put("message", message);
            request.put("context", context);
            request.put("userId", userId);
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(request, headers);
            
            restTemplate.postForObject(
                loggingServiceUrl + "/api/log/debug", 
                entity, 
                Map.class
            );
        } catch (Exception e) {
            System.err.println("Failed to log debug: " + e.getMessage());
        }
    }
}
```

## ⚙️ Step 3: Configure RestTemplate Bean

Create `src/main/java/com/exam/config/RestTemplateConfig.java`:

```java
package com.exam.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

@Configuration
public class RestTemplateConfig {
    
    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
}
```

## 📝 Step 4: Add Configuration

Add to `application.properties`:

```properties
# .NET Logging Service URL
logging.service.url=http://localhost:5000
```

## 💻 Step 5: Use in Your Services

### Example: UserServiceImpl

```java
@Service
@RequiredArgsConstructor
public class UserServiceImpl implements IUserService {
    
    private final UserRepository userRepository;
    private final NetLoggingService netLoggingService; // Add this
    
    @Override
    public LoginResponse loginUser(LoginRequest request) {
        netLoggingService.logInfo(
            "Login attempt for mobile: " + request.getMobile(),
            "UserService",
            null
        );
        
        try {
            User user = userRepository.findByMobile(request.getMobile())
                .orElseThrow(() -> new ResourceNotFoundException("User", "mobile", request.getMobile()));
            
            if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
                netLoggingService.logWarning(
                    "Invalid password attempt for mobile: " + request.getMobile(),
                    "UserService",
                    null
                );
                throw new InvalidCredentialsException("Invalid credentials");
            }
            
            // Generate token and return response
            String token = jwtUtil.generateToken(user.getMobile(), user.getUserId(), roles);
            
            netLoggingService.logInfo(
                "Login successful for userId: " + user.getUserId(),
                "UserService",
                user.getUserId().toString()
            );
            
            return response;
        } catch (Exception e) {
            netLoggingService.logError(
                "Login failed for mobile: " + request.getMobile(),
                "UserService",
                null,
                e
            );
            throw e;
        }
    }
}
```

### Example: Controller

```java
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class UserController {
    
    private final IUserService userService;
    private final NetLoggingService netLoggingService; // Add this
    
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        netLoggingService.logInfo(
            "Login API called for mobile: " + request.getMobile(),
            "UserController",
            null
        );
        
        return ResponseEntity.ok(userService.loginUser(request));
    }
}
```

## 🔄 Step 6: Optional - Create a Hybrid Logger

You can create a service that uses both Java logging and .NET logging:

```java
@Service
@RequiredArgsConstructor
public class HybridLoggingService {
    
    private final NetLoggingService netLoggingService;
    private static final Logger logger = LoggerFactory.getLogger(HybridLoggingService.class);
    
    public void logInfo(String message, String context, String userId) {
        // Log to Java logger
        logger.info("{} | Context: {} | UserId: {}", message, context, userId);
        
        // Also log to .NET service
        netLoggingService.logInfo(message, context, userId);
    }
    
    public void logError(String message, String context, String userId, Exception exception) {
        // Log to Java logger
        logger.error("{} | Context: {} | UserId: {}", message, context, userId, exception);
        
        // Also log to .NET service
        netLoggingService.logError(message, context, userId, exception);
    }
}
```

## 🧪 Testing

1. **Start .NET Logging Service:**
   ```bash
   cd LoggingService
   dotnet run
   ```

2. **Start Spring Boot Application:**
   ```bash
   mvn spring-boot:run
   ```

3. **Make API calls** and check:
   - Spring Boot console logs
   - .NET service console logs
   - `LoggingService/logs/application-*.log` files

## 📊 Benefits

1. **Centralized Logging**: All logs in one .NET service
2. **Structured Logs**: Consistent format across services
3. **Better Analysis**: Use .NET tools for log analysis
4. **Separation of Concerns**: Logging as a separate microservice

## ⚠️ Important Notes

1. **Fallback Handling**: The service includes try-catch to prevent failures if .NET service is down
2. **Async Logging**: Consider making logging calls async to avoid blocking
3. **Performance**: HTTP calls add latency - use async or queue-based approach for production
4. **Error Handling**: Always have fallback logging (Java logger) in case .NET service fails

## 🚀 Production Considerations

For production, consider:

1. **Message Queue**: Use RabbitMQ/Kafka instead of direct HTTP calls
2. **Async Processing**: Make logging non-blocking
3. **Retry Logic**: Implement retry mechanism for failed log requests
4. **Circuit Breaker**: Use resilience patterns (Hystrix, Resilience4j)
5. **Load Balancing**: Multiple instances of logging service

---

**Note**: This integration allows you to use .NET logging capabilities while keeping your Spring Boot application. The .NET service acts as a centralized logging microservice.

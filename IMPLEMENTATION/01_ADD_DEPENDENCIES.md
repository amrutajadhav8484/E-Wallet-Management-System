# Step 1: Add Required Dependencies

## 📋 Overview
Add all necessary dependencies to `pom.xml` for security, JWT, validation, and other features.

## 📝 Instructions

### 1. Open `pom.xml`

### 2. Add these dependencies inside `<dependencies>` tag (after existing dependencies):

```xml
<!-- Spring Security -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-security</artifactId>
</dependency>

<!-- JWT Dependencies -->
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-api</artifactId>
    <version>0.12.3</version>
</dependency>
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-impl</artifactId>
    <version>0.12.3</version>
    <scope>runtime</scope>
</dependency>
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-jackson</artifactId>
    <version>0.12.3</version>
    <scope>runtime</scope>
</dependency>

<!-- Email Support (Optional - for notifications) -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-mail</artifactId>
</dependency>

<!-- H2 Database for Testing -->
<dependency>
    <groupId>com.h2database</groupId>
    <artifactId>h2</artifactId>
    <scope>test</scope>
</dependency>
```

### 3. Save the file

### 4. Update Maven dependencies
Run in terminal:
```bash
mvn clean install
```

Or refresh Maven in your IDE.

## ✅ Verification
- No compilation errors
- All dependencies downloaded successfully
- Ready for next step (JWT Utility)

## 📌 Notes
- JWT version 0.12.3 is compatible with Spring Boot 3.x
- Spring Security will be configured in next steps
- H2 is only for testing, won't affect production

# Step 10: Add JWT Configuration to application.properties

## 📋 Overview
Add JWT secret and expiration configuration to application.properties.

## 📝 Instructions

### 1. Open file: `src/main/resources/application.properties`

### 2. Add these lines at the end of the file:

```properties
# JWT Configuration
jwt.secret=MySecretKeyForJWTTokenGenerationMustBeAtLeast256BitsLongForSecurityPurposes
jwt.expiration=86400000
```

### 3. Optional: Add transaction limits configuration

```properties
# Transaction Limits Configuration
wallet.daily.limit=50000
wallet.monthly.limit=200000
wallet.transaction.limit=10000
wallet.min.balance=0.0
```

### 4. Save the file

## ✅ Verification
- Properties file is updated
- JWT configuration is available
- Application can read JWT settings

## 📌 Notes
- **IMPORTANT**: Change `jwt.secret` to a strong, random secret in production
- Secret should be at least 256 bits (32 characters) for security
- Expiration is in milliseconds (86400000 = 24 hours)
- You can generate a secure secret using: `openssl rand -base64 32`

## 🔒 Security Note
For production:
1. Use environment variables instead of hardcoding secrets
2. Use a strong, randomly generated secret
3. Store secrets in secure vault (AWS Secrets Manager, HashiCorp Vault, etc.)

## 🧪 Testing
After this step, test the complete authentication flow:
1. Register a new user
2. Login with credentials
3. Copy the JWT token from response
4. Use token in Authorization header: `Authorization: Bearer <token>`
5. Access protected endpoints

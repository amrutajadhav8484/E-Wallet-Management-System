# PIN Setting Debug Guide

## Current Issue
PIN setting shows "unsuccessful response" error even though backend might be working.

## Step-by-Step Debugging

### Step 1: Check Browser Console (F12)

1. **Open Browser Console:**
   - Press `F12` or `Ctrl+Shift+I`
   - Go to **Console** tab

2. **Try Setting PIN Again:**
   - Go to Wallet page
   - Enter Wallet ID: `3` (or your wallet ID)
   - Click "Set PIN"
   - Enter PIN: `1234`
   - Click "Set PIN"

3. **Look for Console Logs:**
   You should see logs like:
   ```
   Setting PIN for walletId: 3 PIN: 1234
   Set PIN response: {...}
   Response type: object
   Response keys: ["message", "success", "timestamp"]
   Response.success: true/false/undefined
   Response.message: "..."
   ```

4. **Copy the Full Response:**
   - Look for the log that says `Set PIN response:`
   - Copy the entire response object
   - Share it for debugging

### Step 2: Check Network Tab

1. **Open Network Tab:**
   - Press `F12` → **Network** tab
   - Clear existing requests (trash icon)

2. **Try Setting PIN Again**

3. **Find the Request:**
   - Look for: `POST /api/v1/wallets/3/set-pin`
   - Click on it

4. **Check Response:**
   - Go to **Response** tab
   - You should see something like:
     ```json
     {
       "message": "PIN set successfully",
       "success": true,
       "timestamp": "2026-01-24T..."
     }
     ```

5. **Check Status Code:**
   - Should be `200 OK` for success
   - If `400`, `404`, or `500`, check the error message

### Step 3: Check Backend Console (STS4)

1. **Look at Backend Console:**
   - Check STS4 console where backend is running
   - Look for any errors or exceptions

2. **Common Errors:**
   - `ResourceNotFoundException` - Wallet not found
   - `ValidationException` - PIN already set or validation failed
   - `SQLException` - Database connection issue

### Step 4: Test Direct API Call

1. **Open Swagger UI:**
   - Go to: `http://localhost:8080/swagger-ui.html`

2. **Find the Endpoint:**
   - Look for: `POST /api/v1/wallets/{walletId}/set-pin`
   - Click on it

3. **Try It:**
   - Click "Try it out"
   - Enter:
     - `walletId`: `3`
     - Request body:
       ```json
       {
         "pin": "1234"
       }
       ```
   - Click "Execute"

4. **Check Response:**
   - Look at the response body
   - Check status code (should be 200)

### Step 5: Check Database Directly

1. **Open MySQL Workbench or Command Line**

2. **Connect to Database:**
   ```sql
   USE ewallet_1;
   ```

3. **Check Wallet:**
   ```sql
   SELECT wallet_id, 
          CASE WHEN pin IS NULL THEN 'NULL' ELSE 'SET' END as pin_status,
          balance 
   FROM wallet 
   WHERE wallet_id = 3;
   ```

4. **If PIN is NULL:**
   - PIN wasn't saved
   - Check backend logs for errors

5. **If PIN is SET:**
   - PIN exists in database
   - Frontend might not be reading response correctly
   - Try using "Change PIN" instead

## Common Issues and Solutions

### Issue 1: Response has `success: false`
**Cause:** Backend returned error but didn't throw exception  
**Solution:** Check backend logs for the actual error

### Issue 2: Response doesn't have `success` field
**Cause:** Response structure is different  
**Solution:** Check if `message` contains "success" - code should handle this now

### Issue 3: Response is empty `{}`
**Cause:** Backend returned empty response  
**Solution:** Check backend controller - should return `ApiResponse`

### Issue 4: Network Error
**Cause:** Backend not running or CORS issue  
**Solution:** 
- Verify backend is running on `http://localhost:8080`
- Check `.env` file has correct URL
- Check browser console for CORS errors

### Issue 5: PIN Already Set
**Cause:** Wallet already has a PIN  
**Solution:** Use "Change PIN" instead of "Set PIN"

## Quick Test

After setting PIN, immediately try:

1. **Get Balance:**
   - Enter Wallet ID: `3`
   - Enter PIN: `1234` (the PIN you just set)
   - Click "Get Balance"
   - If it works → PIN was saved ✅
   - If it fails with "PIN not set" → PIN wasn't saved ❌

## What to Share for Help

If still having issues, share:

1. **Browser Console Logs:**
   - All logs starting with "Setting PIN for walletId"
   - The full "Set PIN response:" log

2. **Network Tab Response:**
   - Status code
   - Response body

3. **Backend Console:**
   - Any errors or exceptions

4. **Database Check:**
   - Result of `SELECT wallet_id, pin FROM wallet WHERE wallet_id = 3;`

## Expected Response

When PIN is set successfully, you should see:

**Browser Console:**
```
Setting PIN for walletId: 3 PIN: 1234
Set PIN response: {message: "PIN set successfully", success: true, timestamp: "2026-01-24T..."}
Response.success: true
```

**Network Tab:**
- Status: `200 OK`
- Response:
  ```json
  {
    "message": "PIN set successfully",
    "success": true,
    "timestamp": "2026-01-24T10:30:00"
  }
  ```

**Database:**
- `pin` column should NOT be NULL (contains hashed PIN)

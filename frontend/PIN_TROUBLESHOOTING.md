# PIN Setting Troubleshooting Guide

## Issue: PIN shows success but not saved in database

### Step 1: Verify Your Wallet ID

1. **Go to Dashboard** (`/dashboard`)
2. **Check your Wallet ID** in the Profile Information section
3. **Copy the exact Wallet ID** (it's a number like 1, 2, 3, etc.)

### Step 2: Use Correct Wallet ID

1. **Go to Wallet page** (`/wallet`)
2. **Enter the Wallet ID** from your Dashboard
3. **Click "Set PIN"**
4. **Enter a 4-digit PIN** (e.g., 1234)
5. **Click "Set PIN"**

### Step 3: Check for Errors

**In Browser Console (F12):**
- Look for any red error messages
- Check the console logs for:
  - `Setting PIN for walletId: X`
  - `Set PIN response: {...}`
  - Any error messages

**In Backend Console (STS4):**
- Look for any exceptions or errors
- Check if the request is reaching the backend
- Look for SQL errors or validation errors

### Step 4: Common Issues and Solutions

#### Issue 1: "Wallet not found" Error
**Solution:**
- Verify walletId exists in database
- Check Dashboard to confirm your walletId
- Make sure you're logged in with the correct user

#### Issue 2: "PIN already set" Error
**Solution:**
- Use "Change PIN" instead of "Set PIN"
- Or check database to see if PIN exists

#### Issue 3: Success message but PIN not saved
**Possible causes:**
1. **Wrong walletId** - Using a walletId that doesn't belong to you
2. **Database transaction issue** - Check backend logs
3. **Wallet doesn't exist** - Verify walletId in database

**Solution:**
1. Check browser console for actual error (might be hidden)
2. Check backend console in STS4 for exceptions
3. Verify walletId in database:
   ```sql
   SELECT wallet_id, pin FROM wallet WHERE wallet_id = YOUR_WALLET_ID;
   ```
4. If PIN is NULL, try setting it again
5. If PIN exists, use "Change PIN" instead

### Step 5: Verify PIN Was Set

After setting PIN:
1. **Try to get balance** with the PIN you just set
2. If it works, PIN was saved successfully
3. If it fails with "PIN not set", the PIN wasn't saved

### Step 6: Manual Database Check

If PIN still doesn't work:

1. **Open MySQL Workbench**
2. **Connect to database:** `ewallet_1`
3. **Run query:**
   ```sql
   SELECT wallet_id, 
          CASE WHEN pin IS NULL THEN 'NULL' ELSE 'SET' END as pin_status,
          balance 
   FROM wallet 
   WHERE wallet_id = YOUR_WALLET_ID;
   ```

4. **If PIN is NULL:**
   - The PIN wasn't saved
   - Check backend logs for errors
   - Try setting PIN again

5. **If PIN is SET:**
   - PIN exists in database
   - Try using "Change PIN" if you forgot it
   - Or verify you're using the correct PIN

### Step 7: Backend Verification

Check backend logs for:
- `setWalletPin` method execution
- Any exceptions during PIN setting
- Database save operation
- Transaction commit/rollback

### Quick Test

1. **Set PIN:** Use walletId from Dashboard, PIN: 1234
2. **Verify PIN:** Try to get balance with PIN 1234
3. **If balance works:** PIN is saved correctly ✅
4. **If balance fails:** PIN wasn't saved ❌

### Still Not Working?

1. **Check browser console (F12)** - Look for detailed error messages
2. **Check backend console (STS4)** - Look for exceptions
3. **Verify walletId** - Make sure it matches your user's wallet
4. **Check database** - Manually verify PIN in wallet table
5. **Try different walletId** - Test with a known working walletId

### Important Notes

- **Wallet ID must be an integer** (1, 2, 3, etc.)
- **PIN must be exactly 4 digits** (1234, 5678, etc.)
- **Each user has ONE wallet** - Check Dashboard for your walletId
- **PIN is hashed** - You won't see the actual PIN in database, only the hash
- **One PIN per wallet** - If PIN exists, use "Change PIN"

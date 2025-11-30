# Troubleshooting Guide

## Login Issues

### Issue: "Server Error" when logging in

**Possible Causes & Solutions:**

1. **Password Field Not Selected**
   - ✅ **FIXED**: Login route now uses `.select('+password')` to include password field
   - The password field has `select: false` in the schema, so it must be explicitly selected

2. **MongoDB Connection**
   - Check if MongoDB is running
   - Verify MONGODB_URI in `.env` file
   - Test connection: `mongosh` or check MongoDB service

3. **JWT Secret Missing**
   - Ensure JWT_SECRET is set in `.env` file
   - Default: `your_super_secret_jwt_key_change_this_in_production`

4. **User Doesn't Exist**
   - Run seed script: `cd backend && npm run seed`
   - Creates manager and employee accounts

5. **CORS Issues**
   - Check browser console for CORS errors
   - Verify backend CORS is enabled
   - Check API URL in frontend

### Testing Login

**Test Backend Directly:**
```bash
# Test manager login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"manager@company.com","password":"manager123"}'
```

**Check Backend Logs:**
- Look for error messages in backend console
- Check for MongoDB connection errors
- Verify request is reaching the server

### Common Fixes

1. **Restart Backend:**
   ```bash
   cd backend
   npm run dev
   ```

2. **Clear Browser Storage:**
   - Open DevTools > Application > Local Storage
   - Clear all items
   - Refresh page

3. **Check Network Tab:**
   - Open DevTools > Network
   - Try login
   - Check request/response details
   - Look for error status codes

4. **Verify Environment Variables:**
   ```bash
   # Backend .env should have:
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/attendance_system
   JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
   NODE_ENV=development
   ```

5. **Re-seed Database:**
   ```bash
   cd backend
   npm run seed
   ```

## Error Messages

### "Invalid credentials"
- Email or password is incorrect
- User doesn't exist in database
- Run seed script to create users

### "Server error"
- Check backend console for detailed error
- Verify MongoDB is running
- Check .env file configuration
- Restart backend server

### "Network error"
- Backend server is not running
- Check if port 5000 is available
- Verify API URL in frontend

### "Not authorized, no token"
- Token missing from request
- Clear localStorage and login again
- Check if token is being stored

## Verification Steps

1. ✅ Backend is running on port 5000
2. ✅ MongoDB is connected
3. ✅ .env file exists with correct values
4. ✅ Seed data has been run
5. ✅ Frontend can reach backend (check Network tab)
6. ✅ No CORS errors in browser console
7. ✅ Password field is selected in login query

## Quick Test

```bash
# 1. Check backend health
curl http://localhost:5000/api/health

# 2. Test login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"manager@company.com","password":"manager123"}'

# 3. Should return user data with token
```

## Still Having Issues?

1. Check backend console for error messages
2. Check browser console for frontend errors
3. Check Network tab for request/response details
4. Verify all environment variables are set
5. Ensure MongoDB is running and accessible


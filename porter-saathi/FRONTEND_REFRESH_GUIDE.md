# 🔄 Frontend Refresh Guide - Fix CORS & Caching Issues

## 🔍 **Current Issue Analysis**

The error shows:
```
GET http://localhost:8080/api/v1/earnings net::ERR_FAILED
Access to fetch at 'http://localhost:8080/api/v1/earnings' from origin 'http://localhost:3000' has been blocked by CORS policy
```

**But the backend is working correctly!** ✅
- CORS headers are properly configured
- Backend responds with `Access-Control-Allow-Origin: http://localhost:3000`
- The API endpoint `/earnings/` works correctly

**The issue is frontend caching/hot-reload problems** ❌

---

## 🚀 **Step-by-Step Fix**

### **Step 1: Force Frontend Refresh**

1. **Stop the React App**:
   - In your terminal where `npm start` is running
   - Press `Ctrl+C` to stop it

2. **Clear Browser Cache**:
   - Open DevTools (F12)
   - Right-click the refresh button
   - Select "Empty Cache and Hard Reload"
   - Or use `Cmd+Shift+R` (Mac) / `Ctrl+Shift+R` (Windows)

3. **Clear Browser Storage**:
   - DevTools → Application tab → Storage
   - Click "Clear storage" → "Clear site data"

4. **Restart React App**:
   ```bash
   cd /Users/kanu/Desktop/porter-saathi
   npm start
   ```

### **Step 2: Verify Backend is Running**

```bash
# Test backend health
curl http://localhost:8080/api/v1/tutorials

# Test CORS headers
curl -v -H "Origin: http://localhost:3000" http://localhost:8080/api/v1/tutorials
```

Should show: `Access-Control-Allow-Origin: http://localhost:3000`

### **Step 3: Test in Incognito/Private Window**

1. **Open Incognito Window**: `Cmd+Shift+N` (Chrome) / `Cmd+Shift+P` (Firefox)
2. **Navigate to**: http://localhost:3000
3. **Test the app**: This bypasses all caching issues

---

## 🔧 **Alternative Solutions**

### **Option 1: Force React Refresh**
```bash
# Stop React app (Ctrl+C)
# Clear node_modules cache
rm -rf node_modules/.cache
npm start
```

### **Option 2: Use Different Port**
If port 3000 has caching issues:
```bash
PORT=3001 npm start
```
Then access: http://localhost:3001

### **Option 3: Disable Browser Cache**
1. **DevTools** → **Network** tab
2. **Check** "Disable cache" checkbox
3. **Keep DevTools open** while testing

---

## 🧪 **Verification Steps**

### **1. Check Network Tab**
- Open DevTools → Network tab
- Refresh the page
- Look for API calls to `/earnings/`
- Should show `200 OK` status (not `net::ERR_FAILED`)

### **2. Check Console Logs**
Should see:
```
🌐 API Request: {url: "http://localhost:8080/api/v1/earnings/", method: "GET"}
📡 API Response: {status: 200, data: {today: {...}, lastWeek: {...}}}
```

Instead of:
```
❌ API request failed: TypeError: Failed to fetch
```

### **3. Test Profile Page**
1. **Login** to the app
2. **Click profile avatar** (orange button)
3. **Switch to Earnings tab**
4. **Should load without errors**

---

## 🚨 **If Still Not Working**

### **Check These Common Issues:**

1. **Backend Not Running**:
   ```bash
   curl http://localhost:8080/api/v1/tutorials
   ```
   Should return JSON data, not connection error.

2. **Wrong Backend URL**:
   - Check `src/utils/apiService.js`
   - Should have: `API_BASE_URL = 'http://localhost:8080/api/v1'`

3. **Authentication Issues**:
   - Clear localStorage: DevTools → Application → Local Storage → Clear
   - Login again to get fresh token

4. **Port Conflicts**:
   - Make sure backend is on port 8080
   - Make sure frontend is on port 3000
   - No other services using these ports

---

## 🎯 **Expected Working State**

When everything works correctly:

### **Browser Console (No Errors)**:
```
✅ Profile data loaded: {user object}
✅ Earnings data loaded: {today: {...}, lastWeek: {...}}
```

### **Network Tab (All 200 OK)**:
```
✅ GET /api/v1/user/profile → 200 OK
✅ GET /api/v1/earnings/ → 200 OK
```

### **Profile Page**:
- ✅ Loads without authentication errors
- ✅ Shows real user data
- ✅ Earnings tab displays backend data
- ✅ No CORS errors in console

---

## 🔄 **Quick Reset Commands**

If you want to completely reset and start fresh:

```bash
# 1. Stop all services
# Ctrl+C in both terminal windows

# 2. Restart backend
cd /Users/kanu/Desktop/porter-saathi/backend
CORS_ORIGIN=http://localhost:3000 go run main.go

# 3. Restart frontend (new terminal)
cd /Users/kanu/Desktop/porter-saathi
rm -rf node_modules/.cache
npm start

# 4. Open fresh incognito window
# Navigate to http://localhost:3000
```

This should resolve all caching and CORS issues! 🚀 
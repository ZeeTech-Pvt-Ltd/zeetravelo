# Quick Fix for CORS and 503 Errors

## Issues Found:
1. **Wrong Render URL**: Frontend is calling `zeetravelo-2.onrender.com` but your server is at `zeetravelo-3.onrender.com`
2. **CORS Errors**: Fixed in server code (improved CORS handling)
3. **503 Errors**: Because the old service (zeetravelo-2) is down or wrong URL

## ✅ Fixes Applied:

### 1. Updated CORS Configuration
- Added regex pattern to allow all Vercel preview deployments
- Added explicit OPTIONS method handling for preflight requests
- Better error logging for CORS issues

### 2. Next Steps Required:

#### **Update Vercel Environment Variable:**
1. Go to your Vercel project: https://vercel.com/dashboard
2. Navigate to: **Settings** → **Environment Variables**
3. Find `REACT_APP_API_URL`
4. Update the value from:
   ```
   https://zeetravelo-2.onrender.com
   ```
   To:
   ```
   https://zeetravelo-3.onrender.com
   ```
5. **Important**: Make sure it's applied to:
   - ✅ Production
   - ✅ Preview  
   - ✅ Development
6. **Redeploy** your Vercel project (or wait for auto-deploy)

#### **Redeploy Server on Render:**
1. The server code has been updated with better CORS handling
2. Push the changes to GitHub
3. Render will automatically redeploy
4. Or manually trigger a redeploy in Render dashboard

## 🧪 Testing After Fix:

1. **Test Backend Directly:**
   ```
   https://zeetravelo-3.onrender.com/api/flights?origin=DEL&destination=BOM&date=2025-11-10&adults=1
   ```

2. **Test Frontend:**
   - Visit: https://zeetravelo.vercel.app
   - Open DevTools → Network tab
   - Try searching for flights
   - Check that API calls go to `zeetravelo-3.onrender.com` (not zeetravelo-2)

3. **Check CORS:**
   - In Network tab, check the response headers
   - Should see: `Access-Control-Allow-Origin: https://zeetravelo.vercel.app`

## 📝 Notes:

- The old service `zeetravelo-2.onrender.com` is likely down or deleted
- Always use the Render URL from your latest deployment (currently `zeetravelo-3.onrender.com`)
- The CORS configuration now supports all Vercel preview deployments automatically


# Railway Deployment Troubleshooting

## Fixed Issues

### ✅ CORS Errors
- Updated CORS configuration to properly handle preflight (OPTIONS) requests
- Added explicit `app.options('*', cors(corsOptions))` handler
- Configured allowed methods and headers

### ✅ 502 Bad Gateway Errors
- Changed server to listen on `0.0.0.0` instead of `localhost` (required for Railway)
- Added better error handling and logging
- Added health check endpoint at `/health`

## Changes Made

1. **CORS Configuration** (`server.js`):
   - Added explicit OPTIONS handling
   - Configured allowed methods: GET, POST, PUT, DELETE, OPTIONS
   - Added proper headers configuration
   - Set `optionsSuccessStatus: 200` for legacy browser support

2. **Server Binding** (`server.js`):
   - Changed from `app.listen(PORT, ...)` to `app.listen(PORT, '0.0.0.0', ...)`
   - This allows Railway to connect to your server

3. **Error Handling**:
   - Added error handling middleware
   - Added uncaught exception handlers
   - Better database error handling

4. **Health Check**:
   - Added `/health` endpoint for monitoring

## Next Steps

### 1. Redeploy on Railway

After pushing these changes:

1. **Commit and push your changes:**
   ```bash
   git add .
   git commit -m "Fix CORS and 502 errors for Railway deployment"
   git push
   ```

2. **Railway will auto-deploy**, or manually trigger a redeploy:
   - Go to Railway dashboard
   - Click on your service
   - Go to "Deployments" tab
   - Click "Redeploy" on the latest deployment

### 2. Verify Deployment

1. **Check health endpoint:**
   ```bash
   curl https://klaviyo-metric-dashboard-production.up.railway.app/health
   ```
   Should return: `{"status":"ok","timestamp":"..."}`

2. **Test API endpoint:**
   ```bash
   curl https://klaviyo-metric-dashboard-production.up.railway.app/api/admin/clients
   ```
   Should return: `[]` (empty array)

3. **Check Railway logs:**
   - Go to Railway dashboard → Your service → "Deployments"
   - Click on the latest deployment
   - Check "Logs" tab for any errors

### 3. Verify Environment Variables

In Railway dashboard, ensure these are set:
- `JWT_SECRET` - A strong random string
- `NODE_ENV` - Set to `production`
- `PORT` - Railway sets this automatically (don't override)

### 4. Test Frontend Connection

After backend is working:
1. Verify `REACT_APP_API_URL` in Vercel is set to your Railway URL
2. Test the frontend - CORS errors should be gone
3. Check browser console for any remaining errors

## Common Issues

### Issue: Still getting 502 errors

**Solutions:**
1. Check Railway logs for startup errors
2. Verify all dependencies are in `package.json`
3. Ensure `JWT_SECRET` is set
4. Check if database file has write permissions (if using SQLite)

### Issue: CORS still blocking requests

**Solutions:**
1. Verify the server restarted after code changes
2. Check Railway logs to confirm CORS middleware is loaded
3. Clear browser cache and try again
4. Check if `REACT_APP_API_URL` in Vercel matches Railway URL exactly

### Issue: Database errors

**Solutions:**
1. Railway's filesystem is ephemeral - SQLite data may be lost on redeploy
2. Consider using Railway's PostgreSQL addon for persistent storage
3. Or use Railway volumes for SQLite (less reliable)

## Testing Locally

To test the fixes locally:

1. **Set environment variables:**
   ```bash
   export NODE_ENV=production
   export JWT_SECRET=test-secret-key
   export PORT=3001
   ```

2. **Start server:**
   ```bash
   npm start
   ```

3. **Test health endpoint:**
   ```bash
   curl http://localhost:3001/health
   ```

4. **Test CORS from frontend:**
   - Set `REACT_APP_API_URL=http://localhost:3001` in frontend
   - Start frontend: `cd client && npm start`
   - Test API calls from browser

## Railway-Specific Notes

1. **Port Binding**: Railway requires binding to `0.0.0.0`, not `localhost`
2. **Environment Variables**: Set in Railway dashboard, not `.env` file
3. **Logs**: Check Railway dashboard for real-time logs
4. **Database**: SQLite works but data is ephemeral - use PostgreSQL for production
5. **Auto-Deploy**: Railway auto-deploys on push to main branch

## Still Having Issues?

1. Check Railway deployment logs
2. Verify all environment variables are set
3. Test backend endpoints directly with curl/Postman
4. Check browser Network tab for request/response details
5. Verify Railway service is running (not paused)

---

**After deploying these fixes, your CORS and 502 errors should be resolved!** ✅


# Backend API Health Check

## Quick Test

Test your backend API health and CORS configuration:

```bash
# Test local server
npm run test-health

# Test production server
node test-health.js https://klaviyo-metric-dashboard-production.up.railway.app
```

## Manual Testing

### 1. Health Check Endpoint

```bash
curl https://your-railway-url.up.railway.app/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "environment": "production",
  "port": 3001,
  "api": {
    "admin": {
      "getClients": "GET /api/admin/clients",
      "addClient": "POST /api/admin/clients"
    },
    "auth": {
      "login": "POST /api/auth/login"
    },
    "dashboard": {
      "metrics": "GET /api/dashboard/metrics",
      "profile": "GET /api/dashboard/profile"
    }
  }
}
```

### 2. Test CORS Preflight

```bash
curl -X OPTIONS https://your-railway-url.up.railway.app/api/admin/clients \
  -H "Origin: https://klaviyo-metric-dashboard.vercel.app" \
  -H "Access-Control-Request-Method: GET" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -v
```

Expected: Status 200 with CORS headers

### 3. Test API Endpoint

```bash
curl https://your-railway-url.up.railway.app/api/admin/clients \
  -H "Origin: https://klaviyo-metric-dashboard.vercel.app"
```

Expected: Status 200 with JSON array of clients

## Troubleshooting

### 404 Errors

If you get 404 errors:
1. Check that Railway is using `backend/` as the root directory
2. Verify the route exists in `server.js`
3. Check Railway logs for route registration

### CORS Errors

If you get CORS errors:
1. Verify CORS middleware is applied before routes
2. Check that OPTIONS requests are handled
3. Ensure `optionsSuccessStatus: 200` is set
4. Check Railway logs for CORS-related errors

### Connection Errors

If you can't connect:
1. Verify Railway service is running
2. Check Railway networking settings
3. Ensure the URL is correct (no trailing slash)
4. Check Railway logs for startup errors

## Available Endpoints

- `GET /` - API information
- `GET /health` - Health check with API info
- `GET /api/test` - Simple test endpoint
- `GET /api/admin/clients` - Get all clients
- `POST /api/admin/clients` - Add new client
- `POST /api/auth/login` - Client login
- `GET /api/dashboard/metrics` - Get dashboard metrics (requires auth)
- `GET /api/dashboard/profile` - Get client profile (requires auth)


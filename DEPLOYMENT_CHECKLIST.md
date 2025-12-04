# Deployment Checklist

Use this checklist to ensure your deployment is complete and working correctly.

## Pre-Deployment

### Code Preparation
- [ ] All code is committed to Git
- [ ] Code is pushed to GitHub repository
- [ ] `.env` files are NOT committed (they're in `.gitignore`)
- [ ] All dependencies are listed in `package.json` files
- [ ] Build scripts are tested locally

### Backend (Railway) Preparation
- [ ] Railway account created
- [ ] GitHub repository is accessible
- [ ] JWT_SECRET generated (use: `openssl rand -hex 32`)
- [ ] Backend code tested locally

### Frontend (Vercel) Preparation
- [ ] Vercel account created
- [ ] GitHub repository is accessible
- [ ] Frontend builds successfully locally (`cd client && npm run build`)
- [ ] Railway backend URL is ready

---

## Backend Deployment (Railway)

### Step 1: Create Project
- [ ] Logged into Railway
- [ ] Created new project
- [ ] Connected GitHub repository
- [ ] Railway detected Node.js project

### Step 2: Configure Environment Variables
- [ ] Added `JWT_SECRET` (strong random string)
- [ ] Added `NODE_ENV=production`
- [ ] Verified `PORT` is auto-set by Railway

### Step 3: Deploy
- [ ] Initial deployment triggered
- [ ] Build completed successfully
- [ ] Service is running
- [ ] No errors in Railway logs

### Step 4: Get Backend URL
- [ ] Copied Railway public URL
- [ ] Tested backend endpoint: `curl https://your-app.up.railway.app/api/admin/clients`
- [ ] Received response (empty array `[]` is expected)

---

## Frontend Deployment (Vercel)

### Step 1: Create Project
- [ ] Logged into Vercel
- [ ] Imported GitHub repository
- [ ] Selected correct repository

### Step 2: Configure Build Settings
- [ ] Framework preset: Create React App
- [ ] Root directory: (empty or `client` if needed)
- [ ] Build command: `cd client && npm run build`
- [ ] Output directory: `client/build`
- [ ] Install command: `cd client && npm install`

### Step 3: Set Environment Variables
- [ ] Added `REACT_APP_API_URL` = Railway backend URL
- [ ] Selected all environments (Production, Preview, Development)

### Step 4: Deploy
- [ ] Deployment triggered
- [ ] Build completed successfully
- [ ] No build errors
- [ ] Vercel URL is accessible

---

## Post-Deployment Testing

### Backend Tests
- [ ] Health check: `curl https://your-app.up.railway.app/api/admin/clients`
- [ ] Returns empty array or client list
- [ ] No CORS errors in logs
- [ ] Database is accessible (if using SQLite, check Railway volumes)

### Frontend Tests
- [ ] Frontend loads at Vercel URL
- [ ] No console errors in browser
- [ ] Login page displays correctly
- [ ] Can access admin panel
- [ ] API calls work (check Network tab in browser DevTools)

### Integration Tests
- [ ] Can add client via admin panel
- [ ] Can login with client credentials
- [ ] Dashboard loads and displays metrics
- [ ] Metrics refresh correctly
- [ ] Logout works

---

## Troubleshooting Checklist

### If Backend Fails
- [ ] Check Railway deployment logs
- [ ] Verify environment variables are set
- [ ] Check `package.json` has correct start script
- [ ] Verify Node.js version compatibility
- [ ] Check database connection (if using external DB)

### If Frontend Fails
- [ ] Check Vercel build logs
- [ ] Verify `REACT_APP_API_URL` is set correctly
- [ ] Check build command is correct
- [ ] Verify all dependencies are in `package.json`
- [ ] Check for TypeScript/ESLint errors

### If API Calls Fail
- [ ] Verify `REACT_APP_API_URL` matches Railway URL exactly
- [ ] Check CORS configuration in backend
- [ ] Verify Railway backend is running
- [ ] Check browser console for errors
- [ ] Test backend URL directly with curl/Postman

### If Authentication Fails
- [ ] Verify JWT_SECRET is set in Railway
- [ ] Check token is being stored in localStorage
- [ ] Verify Authorization header is sent
- [ ] Check backend logs for authentication errors

---

## Production Optimization

### Security
- [ ] JWT_SECRET is strong and unique
- [ ] CORS is properly configured
- [ ] Environment variables are not exposed
- [ ] Database credentials are secure (if using external DB)

### Performance
- [ ] Frontend build is optimized
- [ ] Images are optimized
- [ ] API responses are cached where appropriate
- [ ] Database queries are optimized

### Monitoring
- [ ] Railway logs are accessible
- [ ] Vercel analytics is set up (optional)
- [ ] Error tracking is configured (optional)

---

## Final Verification

- [ ] Application is fully functional
- [ ] All features work as expected
- [ ] No console errors
- [ ] Performance is acceptable
- [ ] Ready for production use

---

## Rollback Plan

If something goes wrong:
1. **Railway**: Go to Deployments → Select previous working deployment → Redeploy
2. **Vercel**: Go to Deployments → Select previous working deployment → Promote to Production

---

## Support Resources

- Railway Docs: https://docs.railway.app
- Vercel Docs: https://vercel.com/docs
- Project README: See `README.md`
- Full Deployment Guide: See `DEPLOYMENT.md`


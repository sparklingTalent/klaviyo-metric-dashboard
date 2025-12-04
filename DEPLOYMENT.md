# Deployment Guide: Vercel (Frontend) + Railway (Backend)

This guide will walk you through deploying the Klaviyo Dashboard application with the frontend on Vercel and backend on Railway.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Backend Deployment (Railway)](#backend-deployment-railway)
3. [Frontend Deployment (Vercel)](#frontend-deployment-vercel)
4. [Post-Deployment Configuration](#post-deployment-configuration)
5. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before starting, ensure you have:
- ✅ A GitHub account
- ✅ A Railway account (sign up at [railway.app](https://railway.app))
- ✅ A Vercel account (sign up at [vercel.com](https://vercel.com))
- ✅ Your code pushed to a GitHub repository
- ✅ Node.js installed locally (for testing)

---

## Backend Deployment (Railway)

### Step 1: Prepare Your Repository

1. **Create a `.railwayignore` file** (optional, similar to `.gitignore`):
   ```
   node_modules/
   .env
   .git/
   client/
   *.log
   ```

2. **Ensure your `package.json` has a start script**:
   ```json
   {
     "scripts": {
       "start": "node server.js"
     }
   }
   ```

### Step 2: Deploy to Railway

1. **Login to Railway**
   - Go to [railway.app](https://railway.app)
   - Sign in with GitHub

2. **Create a New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository
   - Railway will automatically detect it's a Node.js project

3. **Configure the Service**
   - Railway will auto-detect your `package.json`
   - It will run `npm install` automatically
   - Set the start command to: `npm start` (or leave default)

4. **Set Environment Variables**
   - Click on your service
   - Go to the "Variables" tab
   - Add the following environment variables:
   
   ```
   JWT_SECRET=your-super-secret-jwt-key-change-this-to-random-string
   PORT=3001
   NODE_ENV=production
   ```
   
   **Important:** Generate a strong JWT_SECRET:
   ```bash
   # On Mac/Linux
   openssl rand -hex 32
   
   # Or use an online generator
   ```

5. **Configure the Port**
   - Railway automatically assigns a `PORT` environment variable
   - Update your `server.js` to use: `process.env.PORT || 3001`
   - Your code already does this, so you're good!

6. **Deploy**
   - Railway will automatically deploy when you push to your main branch
   - Or click "Deploy" to trigger a manual deployment
   - Wait for the build to complete (check the "Deployments" tab)

7. **Get Your Backend URL**
   - Once deployed, Railway will provide a URL like: `https://your-app-name.up.railway.app`
   - Go to "Settings" → "Networking" to see your public domain
   - **Copy this URL** - you'll need it for the frontend configuration

### Step 3: Database Setup on Railway

Railway will automatically create a volume for your SQLite database, but for production, consider:

**Option A: Use Railway's PostgreSQL (Recommended for Production)**
1. In your Railway project, click "New" → "Database" → "Add PostgreSQL"
2. Railway will provide connection details
3. Update your `database.js` to use PostgreSQL instead of SQLite (see below)

**Option B: Keep SQLite (Simple, but not ideal for production)**
- SQLite will work, but Railway's ephemeral filesystem means data might be lost on redeploy
- For production, PostgreSQL is recommended

**If using PostgreSQL, update `database.js`:**
```javascript
// Install pg: npm install pg
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Update your queries to use pool.query() instead of db.run/get/all
```

---

## Frontend Deployment (Vercel)

### Step 1: Prepare Frontend for Production

1. **Update API Base URL**
   - Create a `.env.production` file in the `client` directory:
   ```
   REACT_APP_API_URL=https://your-railway-app.up.railway.app
   ```

2. **Update API Calls** (if needed)
   - Check `client/src/context/AuthContext.js` and `client/src/components/Dashboard.js`
   - They use relative URLs which will work with Vercel's proxy
   - But for production, you might want to use the full Railway URL

3. **Update `client/package.json` build script** (should already be correct):
   ```json
   {
     "scripts": {
       "build": "react-scripts build"
     }
   }
   ```

### Step 2: Deploy to Vercel

#### Option A: Deploy via Vercel Dashboard

1. **Login to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Sign in with GitHub

2. **Import Your Project**
   - Click "Add New" → "Project"
   - Import your GitHub repository
   - Vercel will auto-detect it's a React app

3. **Configure Build Settings**
   - **Framework Preset:** Create React App
   - **Root Directory:** Leave empty (or set to `client` if your repo root is the client folder)
   - **Build Command:** `cd client && npm run build` (if repo root) OR `npm run build` (if already in client)
   - **Output Directory:** `client/build` (if repo root) OR `build` (if already in client)
   - **Install Command:** `cd client && npm install` (if repo root) OR `npm install` (if already in client)

4. **Set Environment Variables**
   - Go to "Environment Variables"
   - Add:
   ```
   REACT_APP_API_URL=https://your-railway-app.up.railway.app
   ```
   - Make sure to select "Production", "Preview", and "Development"

5. **Deploy**
   - Click "Deploy"
   - Wait for the build to complete
   - Vercel will provide you with a URL like: `https://your-app.vercel.app`

#### Option B: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login**
   ```bash
   vercel login
   ```

3. **Navigate to client directory**
   ```bash
   cd client
   ```

4. **Deploy**
   ```bash
   vercel
   ```
   - Follow the prompts
   - For production: `vercel --prod`

### Step 3: Configure Vercel for Your Project Structure

Since your project has both frontend and backend in one repo:

**If deploying from repo root:**
1. Set **Root Directory** to: `client`
2. Or create a `vercel.json` in the root:
   ```json
   {
     "buildCommand": "cd client && npm install && npm run build",
     "outputDirectory": "client/build",
     "installCommand": "cd client && npm install"
   }
   ```

**Recommended: Create `vercel.json` in project root:**
```json
{
  "version": 2,
  "builds": [
    {
      "src": "client/package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "client/build"
      }
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "client/build/$1"
    }
  ]
}
```

---

## Post-Deployment Configuration

### Step 1: Update CORS Settings

1. **Update `server.js` CORS configuration:**
   ```javascript
   const cors = require('cors');
   
   const corsOptions = {
     origin: [
       'http://localhost:3000',
       'https://your-app.vercel.app',
       'https://*.vercel.app' // Allow all Vercel preview deployments
     ],
     credentials: true
   };
   
   app.use(cors(corsOptions));
   ```

2. **Or for production, allow all origins (less secure but simpler):**
   ```javascript
   app.use(cors({
     origin: process.env.NODE_ENV === 'production' ? true : 'http://localhost:3000',
     credentials: true
   }));
   ```

### Step 2: Update Frontend API URLs

1. **Update `client/src/context/AuthContext.js`:**
   ```javascript
   const API_URL = process.env.REACT_APP_API_URL || '';
   
   const login = async (email, password) => {
     try {
       const response = await axios.post(`${API_URL}/api/auth/login`, { email, password });
       // ... rest of code
     }
   };
   ```

2. **Update all axios calls to use `API_URL` prefix**

   Or create `client/src/config.js`:
   ```javascript
   export const API_URL = process.env.REACT_APP_API_URL || '';
   ```

   Then import in your components:
   ```javascript
   import { API_URL } from '../config';
   axios.get(`${API_URL}/api/dashboard/metrics`)
   ```

### Step 3: Test the Deployment

1. **Test Backend:**
   ```bash
   curl https://your-railway-app.up.railway.app/api/admin/clients
   ```
   Should return: `[]`

2. **Test Frontend:**
   - Visit your Vercel URL
   - Try logging in
   - Check browser console for errors

### Step 4: Set Up Custom Domains (Optional)

**Railway:**
1. Go to Railway project → Settings → Networking
2. Click "Generate Domain" or add custom domain
3. Update DNS records as instructed

**Vercel:**
1. Go to Vercel project → Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed

---

## Environment Variables Summary

### Railway (Backend)
```
JWT_SECRET=your-secret-key-here
PORT=3001 (auto-set by Railway)
NODE_ENV=production
DATABASE_URL=postgresql://... (if using PostgreSQL)
```

### Vercel (Frontend)
```
REACT_APP_API_URL=https://your-railway-app.up.railway.app
```

---

## Troubleshooting

### Backend Issues

**Problem: Build fails on Railway**
- Check Railway logs in the "Deployments" tab
- Ensure `package.json` has correct scripts
- Verify all dependencies are listed in `package.json`

**Problem: Database not persisting**
- Railway's filesystem is ephemeral
- Consider using PostgreSQL (Railway provides it)
- Or use Railway volumes for SQLite

**Problem: CORS errors**
- Update CORS settings in `server.js` to include your Vercel URL
- Check Railway logs for CORS-related errors

**Problem: Port errors**
- Railway sets `PORT` automatically
- Your code should use `process.env.PORT || 3001`

### Frontend Issues

**Problem: API calls failing**
- Check `REACT_APP_API_URL` is set correctly in Vercel
- Verify the Railway backend URL is accessible
- Check browser console for CORS errors

**Problem: Build fails on Vercel**
- Check build logs in Vercel dashboard
- Ensure `package.json` has correct build script
- Verify all dependencies are listed

**Problem: 404 errors on refresh**
- Add `vercel.json` with proper routing (see above)
- Or configure Vercel to serve `index.html` for all routes

### General Issues

**Problem: Environment variables not working**
- Restart the service after adding env vars
- For Vercel: Redeploy after adding env vars
- Check variable names match exactly (case-sensitive)

**Problem: Slow API responses**
- Check Railway service logs
- Consider upgrading Railway plan if needed
- Optimize database queries

---

## Quick Deployment Checklist

### Backend (Railway)
- [ ] Code pushed to GitHub
- [ ] Railway project created
- [ ] Environment variables set (JWT_SECRET, NODE_ENV)
- [ ] Service deployed successfully
- [ ] Backend URL copied
- [ ] CORS configured for Vercel URL

### Frontend (Vercel)
- [ ] Vercel project created
- [ ] Build settings configured
- [ ] Environment variables set (REACT_APP_API_URL)
- [ ] Frontend deployed successfully
- [ ] Tested login functionality
- [ ] Tested dashboard metrics

---

## Additional Resources

- [Railway Documentation](https://docs.railway.app)
- [Vercel Documentation](https://vercel.com/docs)
- [React Build Configuration](https://create-react-app.dev/docs/deployment)

---

## Support

If you encounter issues:
1. Check the logs in Railway/Vercel dashboards
2. Verify all environment variables are set
3. Test API endpoints directly with curl/Postman
4. Check browser console for frontend errors

Good luck with your deployment! 🚀


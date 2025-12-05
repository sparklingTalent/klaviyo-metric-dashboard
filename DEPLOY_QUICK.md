# Quick Deployment Reference

## 🚀 Railway (Backend) - 5 Steps

1. **Login & Create Project**
   - Go to [railway.app](https://railway.app) → Login with GitHub
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your repository

2. **Set Environment Variables**
   - Go to "Variables" tab
   - Add:
     ```
     JWT_SECRET=<generate-with-openssl-rand-hex-32>
     NODE_ENV=production
     ```

3. **Deploy**
   - Railway auto-deploys on push to main
   - Or click "Deploy" manually

4. **Get Backend URL**
   - Settings → Networking → Copy your Railway URL
   - Example: `https://your-app.up.railway.app`

5. **Done!** ✅

---

## 🎨 Vercel (Frontend) - 5 Steps

1. **Login & Import**
   - Go to [vercel.com](https://vercel.com) → Login with GitHub
   - Click "Add New" → "Project" → Import repo

2. **Configure Build**
   - Framework: Create React App
   - Root Directory: `frontend` (or leave empty if using vercel.json)
   - Build Command: `cd frontend && npm run build` (or auto-detected)
   - Output Directory: `frontend/build` (or auto-detected)

3. **Set Environment Variable**
   - Go to "Environment Variables"
   - Add:
     ```
     REACT_APP_API_URL=<your-railway-url>
     ```
   - Select: Production, Preview, Development

4. **Deploy**
   - Click "Deploy"
   - Wait for build

5. **Done!** ✅

---

## 📝 Environment Variables Checklist

### Railway
- [ ] `JWT_SECRET` (required)
- [ ] `NODE_ENV=production` (optional but recommended)

### Vercel
- [ ] `REACT_APP_API_URL` (required - your Railway URL)

---

## 🔧 Post-Deployment

1. **Test Backend:**
   ```bash
   curl https://your-app.up.railway.app/api/admin/clients
   ```

2. **Test Frontend:**
   - Visit your Vercel URL
   - Try logging in

3. **Update CORS** (if needed):
   - Already configured in `server.js` to allow Vercel domains

---

## ⚠️ Common Issues

**CORS Errors?**
- Check `REACT_APP_API_URL` is set correctly
- Verify Railway URL is accessible

**Build Fails?**
- Check build logs
- Verify `package.json` scripts are correct

**API Not Working?**
- Check Railway logs
- Verify environment variables are set
- Test backend URL directly with curl

---

## 📚 Full Guide

See `DEPLOYMENT.md` for detailed instructions.


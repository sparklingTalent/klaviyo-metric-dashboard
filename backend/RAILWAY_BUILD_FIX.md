# Railway Build Fix

## Issue
Railway build was failing with:
```
error: undefined variable 'npm'
```

## Solution
The `nixpacks.toml` file was trying to install `npm` separately, but `npm` comes bundled with `nodejs` in Nix. I've removed `npm` from the `nixPkgs` array.

## Railway Configuration

### Important: Set Root Directory
1. Go to Railway project → Settings → Source
2. Set **Root Directory** to: `backend`
3. This ensures Railway builds from the correct directory

### Alternative: Remove nixpacks.toml
If you continue to have issues, you can delete `nixpacks.toml` and let Railway auto-detect:
- Railway will automatically detect Node.js projects
- It will use `package.json` to determine build steps
- The `Procfile` or `package.json` start script will be used

### Manual Build Configuration
If auto-detection doesn't work, in Railway:
1. Go to Settings → Build
2. Set:
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Root Directory**: `backend`

## Verification
After deploying, check:
1. Railway logs show successful build
2. Health endpoint works: `https://your-app.up.railway.app/health`
3. API endpoints are accessible


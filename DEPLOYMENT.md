# 🚀 Deployment Guide

## Backend (Render) ✅ DEPLOYED
- **URL:** https://sattawala.onrender.com
- **Status:** ✅ Live and running

## Frontend Deployment Options

### Option 1: Vercel (Recommended)
1. **Connect Repository:**
   - Go to [vercel.com](https://vercel.com)
   - Connect your GitHub repository
   - Set root directory to `frontend`

2. **Build Settings:**
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`

3. **Environment Variables:**
   - `VITE_API_URL` = `https://sattawala.onrender.com`

### Option 2: Netlify
1. **Connect Repository:**
   - Go to [netlify.com](https://netlify.com)
   - Connect your GitHub repository
   - Set publish directory to `frontend/dist`

2. **Build Settings:**
   - **Build command:** `cd frontend && npm install && npm run build`
   - **Publish directory:** `frontend/dist`

3. **Environment Variables:**
   - `VITE_API_URL` = `https://sattawala.onrender.com`

### Option 3: GitHub Pages
1. **Update package.json:**
   ```json
   {
     "homepage": "https://yourusername.github.io/yourrepo",
     "scripts": {
       "predeploy": "npm run build",
       "deploy": "gh-pages -d dist"
     }
   }
   ```

2. **Deploy:**
   ```bash
   cd frontend
   npm run deploy
   ```

## Environment Variables

### Backend (Render)
- `MONGODB_URI` - Your MongoDB connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `NODE_ENV` - Set to "production"

### Frontend
- `VITE_API_URL` - Backend URL (https://sattawala.onrender.com)

## Testing Production

1. **Backend Test:**
   ```bash
   curl https://sattawala.onrender.com/api/bet/next-result-time
   ```

2. **Frontend Test:**
   - Deploy frontend
   - Test all features (login, betting, admin panel)
   - Verify API calls work

## Troubleshooting

### CORS Issues
- Backend is configured to allow all origins in production
- If issues persist, check environment variables

### API Connection Issues
- Verify `VITE_API_URL` is set correctly
- Check backend logs in Render dashboard
- Test backend endpoints directly

### Build Issues
- Ensure all dependencies are in `package.json`
- Check Node.js version compatibility
- Verify build commands are correct 
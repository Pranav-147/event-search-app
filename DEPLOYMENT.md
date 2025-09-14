# 🚀 Deployment Guide: Vercel + Render

This guide will help you deploy your Event Search Application with:
- **Frontend**: Vercel (React app)
- **Backend**: Render (Django API)
- **Database**: SQLite (hosted on Render)

## 📋 Prerequisites

1. **GitHub Repository**: Your code must be on GitHub
2. **Vercel Account**: Sign up at https://vercel.com
3. **Render Account**: Sign up at https://render.com

---

## 🔧 **PART 1: Deploy Backend to Render**

### Step 1: Prepare Your Repository
Make sure your latest code is pushed to GitHub:

```bash
git add .
git commit -m "Prepare for deployment: Add production settings"
git push origin main
```

### Step 2: Deploy on Render

1. **Go to Render Dashboard**: https://dashboard.render.com

2. **Create New Web Service**:
   - Click **"New +"** → **"Web Service"**
   - Connect your GitHub repository
   - Select `event-search-app` repository

3. **Configure Build Settings**:
   ```
   Name: event-search-backend
   Root Directory: backend
   Environment: Python 3
   Build Command: ./build.sh
   Start Command: gunicorn event_search_backend.wsgi:application
   ```

4. **Set Environment Variables**:
   - `DEBUG`: `False`
   - `DJANGO_SETTINGS_MODULE`: `event_search_backend.settings`
   - `PYTHONPATH`: `/opt/render/project/src`

5. **Deploy**:
   - Click **"Create Web Service"**
   - Wait for deployment (5-10 minutes)
   - Note your backend URL: `https://your-app-name.onrender.com`

### Step 3: Test Backend
Visit: `https://your-app-name.onrender.com/api/health/`
Should return: `{"status": "healthy"}`

---

## 🌐 **PART 2: Deploy Frontend to Vercel**

### Step 1: Deploy on Vercel

1. **Go to Vercel Dashboard**: https://vercel.com/dashboard

2. **Import Project**:
   - Click **"Add New..."** → **"Project"**
   - Import from GitHub
   - Select `event-search-app` repository

3. **Configure Build Settings**:
   ```
   Framework Preset: Create React App
   Root Directory: frontend/event-search-frontend
   Build Command: npm run build
   Output Directory: build
   Install Command: npm install
   ```

4. **Set Environment Variables**:
   - `REACT_APP_API_BASE_URL`: `https://your-render-app.onrender.com/api`
   - Replace `your-render-app` with your actual Render app name

5. **Deploy**:
   - Click **"Deploy"**
   - Wait for deployment (2-5 minutes)
   - Note your frontend URL: `https://your-app.vercel.app`

---

## 🔗 **PART 3: Connect Frontend and Backend**

### Step 1: Update Backend CORS Settings

1. **Update your Django settings** (already done in code):
   ```python
   CORS_ALLOWED_ORIGINS = [
       "http://localhost:3000",
       "http://127.0.0.1:3000", 
       "https://your-vercel-app.vercel.app",  # Add your Vercel URL
   ]
   ```

2. **Push changes to GitHub**:
   ```bash
   git add backend/event_search_backend/settings.py
   git commit -m "Update CORS for production deployment"
   git push origin main
   ```

3. **Render will auto-deploy** the backend changes.

### Step 2: Update Frontend Environment

1. **In Vercel Dashboard**:
   - Go to your project → **Settings** → **Environment Variables**
   - Update `REACT_APP_API_BASE_URL` with your actual Render URL
   - Redeploy: **Deployments** → **"..."** → **"Redeploy"**

---

## ✅ **PART 4: Final Testing**

### Test Your Deployed Application

1. **Visit your Vercel URL**: `https://your-app.vercel.app`

2. **Test Features**:
   - ✅ Health check shows "Backend Online"
   - ✅ File upload works
   - ✅ Search functionality works
   - ✅ Results display correctly

3. **Check Network Tab**:
   - API calls should go to your Render backend
   - No CORS errors in console

---

## 🛠️ **Deployment URLs**

After successful deployment, you'll have:

```
Frontend (Vercel): https://your-app.vercel.app
Backend (Render):  https://your-app.onrender.com
API Endpoint:      https://your-app.onrender.com/api
```

---

## 🐛 **Troubleshooting**

### Common Issues:

1. **CORS Errors**:
   - Make sure Vercel URL is in Django `CORS_ALLOWED_ORIGINS`
   - Check environment variables are set correctly

2. **Backend 500 Errors**:
   - Check Render logs: Dashboard → Service → Logs
   - Ensure `DEBUG=False` and static files are collected

3. **Frontend Can't Connect to Backend**:
   - Verify `REACT_APP_API_BASE_URL` in Vercel environment variables
   - Check API endpoint: `https://your-render-app.onrender.com/api/health/`

4. **Database Issues**:
   - SQLite will reset on Render restarts (expected for free tier)
   - Upload sample files after each deployment

### Render Free Tier Limitations:
- Apps sleep after 15 minutes of inactivity
- First request after sleep takes ~30 seconds
- Database resets on restarts

---

## 🔄 **Making Updates**

### Update Backend:
```bash
git add backend/
git commit -m "Update backend features"
git push origin main
# Render auto-deploys from GitHub
```

### Update Frontend:
```bash
git add frontend/
git commit -m "Update frontend features" 
git push origin main
# Vercel auto-deploys from GitHub
```

---

## 🎉 **Share Your App**

Once deployed, share these links:

- **Application**: `https://your-app.vercel.app`
- **API Documentation**: Link to your GitHub README
- **Source Code**: Your GitHub repository URL

Your Event Search Application is now live and accessible worldwide! 🌍

---

## 💡 **Production Tips**

1. **Custom Domain** (Optional):
   - Add custom domain in Vercel dashboard
   - Update CORS settings accordingly

2. **Monitoring**:
   - Monitor usage in Vercel analytics
   - Check Render service health regularly

3. **Scaling** (If needed later):
   - Upgrade to Render paid plans for persistent database
   - Consider PostgreSQL for production database

4. **Security**:
   - All environment variables are properly configured
   - HTTPS is enabled by default on both platforms
   - CORS is restricted to your frontend domain

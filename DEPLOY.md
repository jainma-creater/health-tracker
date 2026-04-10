# 🚀 Health Tracker - Deployment Guide

## Quick Deploy Options (Choose 1)

### **FASTEST: Replit (5 minutes, no credit card)**

Perfect for quick demos to show startup investors.

**Steps:**
1. Go to [replit.com](https://replit.com) → Click **Sign up**
2. Click **+ Create** → **Import from GitHub**
3. Paste this URL:
   ```
   https://github.com/YOUR_USERNAME/health-tracker
   ```
4. Click **Import from GitHub**
5. Click **Run** - your app is **live!** 🎉
6. Share the URL with your startup team

**Your public URL:** `https://health-tracker-yourname.replit.dev`

---

### **PROFESSIONAL: Railway (10 minutes, better performance)**

Recommended for production-quality demos.

**Steps:**
1. Go to [railway.app](https://railway.app) → Sign up free
2. Create new project → **Deploy from GitHub**
3. Connect your GitHub account
4. Select `health-tracker` repository
5. Railway auto-detects Node.js → Click **Deploy**
6. Wait 2-3 minutes
7. Click **View** to see your live app!

**Your public URL:** `https://health-tracker-yourname.railway.app`

**Environment Variables (add manually if needed):**
```
EMAIL_USER=jainma004@gmail.com
EMAIL_PASS=dfih bvkp ojbn fkoh
NODE_ENV=production
```

---

### **PROFESSIONAL: Azure (15 minutes, enterprise-grade)**

For serious startup demos with Microsoft.

**Steps:**
1. Go to [portal.azure.com](https://portal.azure.com)
2. Create **App Service** (Node.js 18)
3. Choose **Free tier** (F1) or **Standard B1** ($15/month)
4. Deployment method: **GitHub**
5. Connect your GitHub repo
6. Azure auto-deploys from main branch
7. Add Environment Variables in **Configuration**:
   ```
   EMAIL_USER=jainma004@gmail.com
   EMAIL_PASS=dfih bvkp ojbn fkoh
   ```

**Your public URL:** `https://myhealth-tracker.azurewebsites.net`

---

## Prerequisites: GitHub Setup (5 minutes)

Before deploying, push your code to GitHub:

### **Step 1: Create GitHub Repo**
1. Go to [github.com/new](https://github.com/new)
2. Repository name: `health-tracker`
3. Description: `Personalized health tracking with AI alerts for doctor visits`
4. Make it **Public** (so others can see)
5. Click **Create Repository**

### **Step 2: Push Your Code**

In PowerShell:
```powershell
cd C:\Users\Mayank Jain\Desktop\health-tracker

# Initialize git
git init

# Add files
git add .

# Commit
git commit -m "Initial commit: Health Tracker MVP"

# Add GitHub remote (REPLACE with YOUR repo URL)
git remote add origin https://github.com/YOUR_USERNAME/health-tracker.git

# Push to GitHub
git branch -M main
git push -u origin main
```

Done! Your code is on GitHub. ✅

---

## Step-by-Step Deployment Walkthrough

### **For Replit (RECOMMENDED - FASTEST)**

```
1. Sign up at replit.com (free)
2. Click "+ Create"
3. Select "Import from GitHub"
4. Paste: https://github.com/YOUR_USERNAME/health-tracker
5. Click "Import"
6. Click "Run"
7. Wait 30 seconds
8. Get public URL from top right
9. Share with startup team! 🎉
```

**Share this link to investors:** `https://health-tracker-yourname.replit.dev`

---

### **For Railway (RECOMMENDED - PROFESSIONAL)**

```
1. Sign up at railway.app (free $5 credit/month)
2. New Project > Deploy from GitHub
3. Select repository: health-tracker
4. Wait for auto-deployment (2-3 mins)
5. Click "View" button
6. Share live URL with team
```

**Live URL:** Shows in Railway dashboard

---

## Testing Your Deployment

Once deployed, test it:

1. **Open your live URL** (e.g., `https://health-tracker-yourname.replit.dev`)
2. You should see the Health Tracker UI
3. Try the 5-step process:
   - Create a user
   - Set health thresholds
   - Log a reading
   - View alerts
   - See trends chart

**If something breaks:**
- Check browser console: Press **F12** → **Console**
- Look for error messages
- Reply with the error and I'll fix it

---

## Update API URL (IMPORTANT!)

After deployment, the frontend needs to know the backend URL.

**Find this line in frontend/index.html (around line 460):**
```javascript
const API = "http://localhost:3000";
```

**For Replit deployment, change to:**
```javascript
const API = "https://health-tracker-yourname.replit.dev";
```

**For Railway deployment, change to:**
```javascript
const API = "https://health-tracker-yourname.railway.app";
```

**OR** - Automatic detection (add this instead):
```javascript
const API = window.location.hostname === "localhost" 
  ? "http://localhost:3000" 
  : window.location.origin;
```

This auto-switches between local dev and production!

---

## Monitoring & Logs

### **Replit Logs**
- Click your project
- Right side shows live console output
- All errors visible in real-time

### **Railway Logs**
- Project dashboard → **View Logs**
- See all backend output

### **Azure Logs**
- App Service → **Log Stream**
- Real-time logs on the right

---

## Troubleshooting Deployment

| Problem | Solution |
|---------|----------|
| "Port in use" error | Deployment uses `PORT` env var automatically |
| "Cannot find module" | Check `backend/package.json` - all deps listed? |
| Frontend can't reach backend | Update API URL in `frontend/index.html` |
| Email alerts not working | Add env vars: `EMAIL_USER`, `EMAIL_PASS` |
| Database empty after restart | Normal - SQLite rebuilds on startup |

---

## Next Steps for Production

**After proving concept to investors:**

1. ✅ Switch to **PostgreSQL** (Railway has free tier)
2. ✅ Add user **authentication** (login/signup)
3. ✅ Add **mobile app** (React Native)
4. ✅ Get custom domain (`myhealth.com`)
5. ✅ Set up **monitoring** (application insights)
6. ✅ Add **HIPAA compliance** (health data privacy)

---

## Deployment Comparison

| Platform | Time | Cost | Performance | Best For |
|----------|------|------|-------------|----------|
| **Replit** | ⚡⚡⚡ 5 min | 💰 Free | 🐢 Slow | Quick demos |
| **Railway** | ⚡⚡ 10 min | 💰 $5/mo | 🚀 Fast | Production |
| **Azure** | ⚡ 15 min | 💰 Free/tier | 🚀 Fast | Enterprise |

---

## Questions?

If deployment fails:
1. Check the platform's logs
2. Verify `package.json` exists in root
3. Make sure environment variables are set
4. Test backend locally first: `npm start`

Let me know the error and I'll help! 🚀

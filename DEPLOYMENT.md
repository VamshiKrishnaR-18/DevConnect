# DevConnect Deployment Guide

## How Vercel Knows to Use Production Environment

### 🔄 **Automatic Environment Detection**

Your app now automatically detects the environment using multiple methods:

1. **Vite's Built-in Detection**: `import.meta.env.PROD`
2. **Custom Environment Variable**: `VITE_NODE_ENV`
3. **Hostname Detection**: Checks if running on localhost or production domain

```javascript
// In FRONTEND/src/config/environment.js
const isProduction = import.meta.env.PROD || 
                    import.meta.env.VITE_NODE_ENV === 'production' ||
                    window.location.hostname !== 'localhost';
```

### 📋 **Vercel Deployment Methods**

#### **Method 1: Automatic Detection (Recommended)**
- No configuration needed
- App automatically detects production environment
- Uses production URLs when not on localhost

#### **Method 2: Vercel Environment Variables**
Set these in your Vercel dashboard:

```
VITE_API_BASE_URL=https://devconnect-f4au.onrender.com
VITE_SOCKET_URL=https://devconnect-f4au.onrender.com
VITE_NODE_ENV=production
```

#### **Method 3: vercel.json Configuration**
Already created in `FRONTEND/vercel.json` with production settings.

## 🚀 **Deployment Steps**

### **Deploy to Vercel**

1. **Connect Repository**
   ```bash
   # Push your code to GitHub
   git add .
   git commit -m "Add production environment configuration"
   git push origin main
   ```

2. **Import to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Import Project"
   - Select your GitHub repository
   - Choose the `FRONTEND` folder as root directory

3. **Configure Build Settings**
   - **Framework Preset**: Vite
   - **Root Directory**: `FRONTEND`
   - **Build Command**: `npm run build` (default works perfectly)
   - **Output Directory**: `dist`

4. **Set Environment Variables (Optional)**
   In Vercel dashboard → Settings → Environment Variables:
   ```
   VITE_API_BASE_URL = https://devconnect-f4au.onrender.com
   VITE_SOCKET_URL = https://devconnect-f4au.onrender.com
   VITE_NODE_ENV = production
   ```

5. **Deploy**
   - Click "Deploy"
   - Vercel will automatically build and deploy your app

### **Deploy Backend to Render**

Your backend is already configured for Render deployment.

## 🔧 **Environment Configuration Summary**

### **Local Development**
```bash
npm run dev:local
# Uses: http://localhost:3000
```

### **Production Testing Locally**
```bash
npm run dev:prod
# Uses: https://devconnect-f4au.onrender.com
```

### **Production Build**
```bash
npm run build:prod
# Uses production mode explicitly

# OR (works the same on Vercel)
npm run build
# Automatically detects production environment
```

### **Vercel Deployment**
- Automatically detects production environment
- Uses production URLs
- No CORS issues
- Socket connections work properly

## 🛠️ **Troubleshooting**

### **If Environment Detection Fails**
1. Check browser console for environment logs
2. Manually set environment variables in Vercel dashboard
3. Verify `vercel.json` configuration

### **CORS Issues**
- Backend CORS is configured for your Vercel domain
- Check that backend allows your frontend domain

### **Socket Connection Issues**
- Verify backend Socket.IO CORS settings
- Check that both HTTP and WebSocket connections are allowed

## 📁 **File Structure**
```
FRONTEND/
├── .env                 # Default (development)
├── .env.local          # Local development
├── .env.production     # Production settings
├── vercel.json         # Vercel configuration
├── src/
│   └── config/
│       └── environment.js  # Smart environment detection
└── package.json        # Build scripts
```

## ✅ **Verification**

After deployment, verify:
- [ ] Frontend loads without errors
- [ ] API calls work (check Network tab)
- [ ] Socket connections establish
- [ ] No CORS errors in console
- [ ] Environment shows as "production"

Your app is now fully configured for seamless deployment! 🎉

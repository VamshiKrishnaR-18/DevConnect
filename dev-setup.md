# DevConnect Development Setup

This guide will help you set up DevConnect for local development without CORS, socket, or axios errors.

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- MongoDB (local or cloud)

## Quick Start

### 1. Clone and Install Dependencies

```bash
# Install backend dependencies
cd BACKEND
npm install

# Install frontend dependencies
cd ../FRONTEND
npm install
```

### 2. Environment Configuration

The project is now configured to automatically handle different environments:

#### Backend (.env file is already configured)
- `NODE_ENV=development`
- `FRONTEND_URL=http://localhost:5173`
- Database and other credentials are already set

#### Frontend (Environment files are automatically created)
- `.env.local` - for local development (uses localhost:3000)
- `.env.production` - for production builds (uses render.com)
- `.env` - default fallback

### 3. Start Development Servers

#### Option 1: Manual Start (Recommended for debugging)

```bash
# Terminal 1: Start Backend
cd BACKEND
npm run dev

# Terminal 2: Start Frontend
cd FRONTEND
npm run dev:local
```

#### Option 2: Concurrent Start (if you have concurrently installed)

```bash
# From project root
npm run dev
```

### 4. Access the Application

- Frontend: http://localhost:5173
- Backend API: http://localhost:3000
- Backend Health Check: http://localhost:3000

## Environment Modes

### Local Development Mode
```bash
cd FRONTEND
npm run dev:local
```
- Uses `http://localhost:3000` for API and Socket connections
- No CORS issues
- Hot reload enabled

### Production Testing Mode
```bash
cd FRONTEND
npm run dev:prod
```
- Uses production URLs (render.com)
- Tests production configuration locally

### Production Build
```bash
cd FRONTEND
npm run build:prod
```
- Creates optimized production build
- Uses production environment variables

## Troubleshooting

### CORS Errors
- Ensure backend is running on port 3000
- Check that `FRONTEND_URL` in backend `.env` matches your frontend URL
- Verify frontend is using `npm run dev:local` for local development

### Socket Connection Issues
- Backend and frontend must both be running
- Check browser console for socket connection logs
- Verify socket URL in environment configuration

### API Request Failures
- Check if backend server is running
- Verify API endpoints in browser network tab
- Ensure authentication tokens are being sent

### Port Conflicts
- Backend default: 3000
- Frontend default: 5173
- Change ports in respective configuration files if needed

## Project Structure

```
DevConnect/
├── BACKEND/
│   ├── .env                 # Backend environment variables
│   ├── server.js           # Main server file with CORS config
│   └── package.json        # Backend dependencies and scripts
├── FRONTEND/
│   ├── .env                # Default environment variables
│   ├── .env.local          # Local development config
│   ├── .env.production     # Production config
│   ├── src/
│   │   ├── config/
│   │   │   └── environment.js  # Environment configuration
│   │   └── utils/
│   │       └── api.js      # Centralized API configuration
│   └── package.json        # Frontend dependencies and scripts
└── dev-setup.md           # This file
```

## Key Features

1. **Environment-based Configuration**: Automatically switches between local and production URLs
2. **Centralized API Management**: All API calls go through configured utilities
3. **CORS-free Development**: Proper CORS configuration for all environments
4. **Socket.IO Integration**: Environment-aware socket connections
5. **Hot Reload**: Fast development with instant updates

## Available Scripts

### Frontend
- `npm run dev:local` - Local development with localhost backend
- `npm run dev:prod` - Development with production backend
- `npm run build:prod` - Production build
- `npm run clean` - Clean build cache

### Backend
- `npm run dev` - Development with nodemon
- `npm run dev:watch` - Development with file watching
- `npm run start` - Production start
- `npm run clean` - Clean uploads and cache

## 🚀 Deployment

### **Vercel Deployment (Frontend)**
Your app automatically detects production environment when deployed to Vercel:

1. Push code to GitHub
2. Import project to Vercel (select `FRONTEND` folder)
3. Deploy - no additional configuration needed!

See `DEPLOYMENT.md` for detailed deployment instructions.

### **Environment Detection**
The app automatically switches to production mode when:
- Deployed to Vercel (`import.meta.env.PROD` is true)
- Hostname is not localhost
- `VITE_NODE_ENV=production` is set

## Need Help?

If you encounter any issues:
1. Check that both servers are running
2. Verify environment variables are correct
3. Clear browser cache and restart servers
4. Check browser console for detailed error messages
5. See `DEPLOYMENT.md` for deployment-specific issues

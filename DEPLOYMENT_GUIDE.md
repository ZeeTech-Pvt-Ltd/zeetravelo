# Deployment Guide for ZeeTravelo

This guide will help you deploy the frontend on Vercel and backend on Render.

## ✅ Changes Made

### 1. Server Configuration (`server/server.js`)
- ✅ Updated port to use `process.env.PORT || 3001` (Render requirement)
- ✅ Updated CORS to allow specific origins:
  - `https://zeetravelo.vercel.app` (your Vercel frontend)
  - `http://localhost:3000` (local development)

### 2. Server Package.json (`server/package.json`)
- ✅ Created with `start` script: `node server.js`

### 3. Frontend API Configuration
- ✅ All API calls now use `process.env.REACT_APP_API_URL || 'http://localhost:3001'`
- ✅ Updated all components to use environment variable

## 📋 Deployment Steps

### Backend Deployment (Render)

1. **Create a new Web Service on Render**
   - Service Type: Web Service
   - Root Directory: `/server`
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Node Version: 22.16.0 (or latest)

2. **Set Environment Variables in Render**
   - `AMADEUS_API_KEY`: Your Amadeus API key
   - `AMADEUS_API_SECRET`: Your Amadeus API secret
   - `PORT`: Will be automatically set by Render (don't set manually)

3. **Deploy**
   - Connect your GitHub repository
   - Select the branch to deploy
   - Render will automatically deploy

4. **Get Your Render URL**
   - After deployment, your server will be available at: `https://zeetravelo-2.onrender.com` (or similar)
   - Test it: `https://zeetravelo-2.onrender.com/api/flights?origin=DEL&destination=BOM&date=2025-11-10&adults=1`

### Frontend Deployment (Vercel)

1. **Create Environment Variable**
   - In your Vercel project settings, go to Environment Variables
   - Add: `REACT_APP_API_URL`
   - Value: `https://zeetravelo-2.onrender.com` (your Render URL)
   - Apply to: Production, Preview, and Development

2. **Deploy**
   - Connect your GitHub repository
   - Vercel will automatically detect React and deploy
   - After deployment, update the CORS in `server/server.js` if your Vercel URL is different

3. **Update CORS in Server** (if needed)
   - If your Vercel URL is different, update `server/server.js`:
   ```javascript
   app.use(cors({
     origin: [
       "https://your-actual-vercel-url.vercel.app", // Update this
       "http://localhost:3000"
     ],
     methods: ["GET", "POST", "PUT", "DELETE"],
     credentials: true
   }));
   ```
   - Redeploy on Render after updating

## 🧪 Testing

1. **Test Backend**: 
   ```
   https://zeetravelo-2.onrender.com/api/flights?origin=DEL&destination=BOM&date=2025-11-10&adults=1
   ```

2. **Test Frontend**:
   - Visit your Vercel URL
   - Open browser DevTools → Network tab
   - Try searching for flights
   - Verify API calls are going to your Render URL

## 📝 Local Development

For local development, create a `.env` file in the root directory:

```env
REACT_APP_API_URL=http://localhost:3001
```

The server will run on `http://localhost:3001` and the frontend on `http://localhost:3000`.

## 🔄 After Deployment

1. ✅ Backend is live on Render
2. ✅ Frontend is live on Vercel
3. ✅ Frontend communicates with Render backend
4. ✅ CORS is properly configured
5. ✅ All API calls use environment variables

## 🐛 Troubleshooting

- **CORS Errors**: Make sure your Vercel URL is in the CORS origins list in `server/server.js`
- **API Not Working**: Check that `REACT_APP_API_URL` is set in Vercel environment variables
- **Port Issues**: Render automatically sets PORT, don't override it
- **Build Failures**: Make sure all dependencies are in `server/package.json`


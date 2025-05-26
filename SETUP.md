# CORS Setup Guide

## Issues Fixed

1. **Package.json script reference**: Fixed to point to `index.js` instead of `server.js`
2. **CORS origins**: Removed trailing slashes and incorrect paths
3. **Vercel routing**: Fixed backend routing configuration
4. **Environment variables**: Added fallback for API URL

## Required Environment Variables

### Frontend (.env file in frontend directory)

Create a `.env` file in the `frontend` directory with:

```
REACT_APP_API_URL=http://localhost:5000/api
```

For production deployment, use your deployed backend URL:

```
REACT_APP_API_URL=https://your-backend-domain.vercel.app/api
```

### Backend (.env file in backend directory)

Create a `.env` file in the `backend` directory with:

```
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
FRONTEND_URL=http://localhost:3000
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

For production:

```
FRONTEND_URL=https://your-frontend-domain.vercel.app
```

## Steps to Fix CORS Issues

1. **Create environment files** as described above
2. **Restart both servers** after creating the environment files
3. **Check console logs** - the backend now logs CORS origins for debugging
4. **Verify URLs match** - ensure frontend and backend URLs are correctly configured

## Common CORS Issues and Solutions

### Issue: "Access to XMLHttpRequest has been blocked by CORS policy"

**Solution**:

- Ensure the frontend URL is in the backend's allowed origins
- Check that there are no trailing slashes in URLs
- Verify environment variables are loaded correctly

### Issue: "Network Error" in browser console

**Solution**:

- Check if the backend server is running
- Verify the API URL in frontend matches the backend URL
- Ensure the backend is accessible from the frontend domain

### Issue: Preflight OPTIONS requests failing

**Solution**:

- The backend now handles OPTIONS requests automatically
- Ensure all required headers are included in CORS configuration

## Testing CORS Configuration

1. Open browser developer tools
2. Check the Network tab for failed requests
3. Look for CORS-related error messages
4. Verify the backend console logs show the correct origins

## Development vs Production

### Development

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:5000`

### Production

- Update environment variables with your deployed URLs
- Ensure Vercel environment variables are set correctly
- Test CORS with your production domains

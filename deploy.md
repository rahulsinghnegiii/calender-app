# Deployment Guide

This document provides step-by-step instructions to deploy the Calendar App for free using Render and Vercel.

## Deploying the Backend on Render

1. **Sign up for Render**
   - Go to [render.com](https://render.com/) and create a free account
   - Connect your GitHub account

2. **Create a new Web Service**
   - Click "New" > "Web Service"
   - Connect to your GitHub repository
   - Select the repository

3. **Configure the Web Service**
   - Name: `calendar-app-api` (or your preferred name)
   - Region: Choose the closest to your users
   - Branch: `main`
   - Root Directory: (leave blank)
   - Runtime: `Node`
   - Build Command: `cd backend && npm install`
   - Start Command: `cd backend && npm start`
   - Plan: "Free"

4. **Add Environment Variables**
   - Click "Advanced" > "Add Environment Variable"
   - Add all variables from your `backend/.env` file:
     - `PORT`: `10000` (Render uses this port internally)
     - `MONGODB_URI`: Your MongoDB Atlas connection string
     - `NODE_ENV`: `production`

5. **Create Web Service**
   - Click "Create Web Service"
   - Wait for the deployment to complete (might take a few minutes)
   - Make note of your service URL (e.g., `https://calendar-app-api.onrender.com`)

## Deploying the Frontend on Vercel

1. **Sign up for Vercel**
   - Go to [vercel.com](https://vercel.com/) and create a free account
   - Connect your GitHub account

2. **Import your Repository**
   - Click "Add New..." > "Project"
   - Select your GitHub repository
   - Click "Import"

3. **Configure Project**
   - Framework Preset: "Vite"
   - Root Directory: (leave as default)
   - Build and Output Settings: (leave as default)
   
4. **Add Environment Variables**
   - Expand "Environment Variables"
   - Add `VITE_API_URL` with the value of your Render backend URL + `/api`
     - Example: `https://calendar-app-api.onrender.com/api`

5. **Deploy**
   - Click "Deploy"
   - Wait for the deployment to complete
   - Make note of your frontend URL (e.g., `https://calendar-app-xyz.vercel.app`)

## Troubleshooting

If you experience issues with the deployment:

1. **Check logs** in both Render and Vercel to identify any errors
2. **Verify environment variables** are set correctly
3. **Ensure CORS is properly configured** in the backend
4. **Test API endpoints** using Postman or another API client

## Additional Notes

- The free tier of Render will spin down after periods of inactivity, causing the first request to be slow
- Consider upgrading to a paid plan for production use
- Remember to secure your application before using it in production


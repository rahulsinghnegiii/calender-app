# Deploying the Calendar App to Render

This guide explains how to deploy the Calendar App (both frontend and backend) as a single service on Render.

## Prerequisites

1. A [Render](https://render.com) account
2. Your MongoDB Atlas connection string

## Deployment Steps

### 1. Fork or Clone the Repository

Make sure you have your own copy of the repository on GitHub or GitLab.

### 2. Connect to Render

1. Log in to your Render account
2. Go to the Dashboard
3. Click "New" > "Blueprint"
4. Connect your GitHub/GitLab account if you haven't already
5. Select the repository

### 3. Configure the Blueprint

Render will automatically detect the `render.yaml` file and set up the service. 
You'll need to:

1. Confirm the service settings:
   - Name: `calendar-app` (or choose your own)
   - Region: Choose the region closest to your users
   - Plan: Free

2. Set the environment variables:
   - `MONGODB_URI`: Your MongoDB Atlas connection string 
     (e.g., `mongodb+srv://username:password@cluster.mongodb.net/calendar-app?retryWrites=true&w=majority`)

3. Click "Apply" to create the service

### 4. Wait for Deployment

Render will build and deploy your application. This process takes a few minutes.

### 5. Access Your Application

Once deployment is complete, you can access your application at the URL provided by Render
(e.g., `https://calendar-app.onrender.com`).

## Troubleshooting

If you encounter issues during deployment:

1. **Build Errors**: Check the build logs in the Render dashboard
2. **Runtime Errors**: Check the service logs in the Render dashboard
3. **Database Connection Issues**: Verify that your MongoDB Atlas connection string is correct
4. **CORS Issues**: These shouldn't occur since frontend and backend are served from the same domain

## Limitations on the Free Tier

- Your service will "spin down" after 15 minutes of inactivity
- Initial requests after inactivity may be slow as the service spins up
- Limited bandwidth and compute hours per month

For production use, consider upgrading to a paid plan.

## Updating Your Deployment

To update your application:

1. Push changes to your repository
2. Render will automatically rebuild and deploy your application

## Adding Custom Domains

With a paid plan, you can add custom domains:

1. Go to your service settings
2. Click "Custom Domains"
3. Follow the instructions to add and verify your domain 
# Deployment Guide for Greeting Card Organizer

This guide covers deploying the Card Organizer application to various cloud platforms.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [MongoDB Atlas Setup](#mongodb-atlas-setup)
3. [Environment Configuration](#environment-configuration)
4. [Deployment Options](#deployment-options)
   - [Render](#deploying-to-render)
   - [Railway](#deploying-to-railway)
   - [Heroku](#deploying-to-heroku)
5. [Post-Deployment](#post-deployment)

---

## Prerequisites

- A GitHub account with your repository
- MongoDB Atlas account (free tier available)
- Account on your chosen hosting platform (Render, Railway, or Heroku)

---

## MongoDB Atlas Setup

1. **Create a MongoDB Atlas Account**
   - Go to https://www.mongodb.com/cloud/atlas
   - Sign up for a free account

2. **Create a Cluster**
   - Click "Build a Database"
   - Choose the FREE tier (M0)
   - Select a cloud provider and region close to your users
   - Click "Create Cluster"

3. **Configure Database Access**
   - Go to "Database Access" in the left sidebar
   - Click "Add New Database User"
   - Create a username and password (save these!)
   - Set permissions to "Read and write to any database"
   - Click "Add User"

4. **Configure Network Access**
   - Go to "Network Access" in the left sidebar
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (0.0.0.0/0)
   - Click "Confirm"

5. **Get Connection String**
   - Go to "Database" in the left sidebar
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password
   - Replace `<dbname>` with `cardOrganizerDB`
   - Example: `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/cardOrganizerDB?retryWrites=true&w=majority`

---

## Environment Configuration

Your application needs the following environment variables:

```
MONGODB_URI=<your-mongodb-atlas-connection-string>
JWT_SECRET=<generate-a-random-secret-key>
PORT=3000
```

**Generate a JWT Secret:**
```bash
# Use this command to generate a random secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## Deployment Options

### Deploying to Render

**Render is recommended** - it's free, easy to use, and has excellent documentation.

1. **Push your code to GitHub** (if not already done)

2. **Create a New Web Service**
   - Go to https://render.com
   - Sign in with GitHub
   - Click "New +" → "Web Service"
   - Connect your GitHub repository

3. **Configure the Service**
   - **Name:** `card-organizer`
   - **Environment:** `Node`
   - **Build Command:** `cd backend && npm install`
   - **Start Command:** `cd backend && npm start`
   - **Instance Type:** Free

4. **Add Environment Variables**
   - Click "Advanced" → "Add Environment Variable"
   - Add:
     - `MONGODB_URI`: Your MongoDB Atlas connection string
     - `JWT_SECRET`: Your generated secret key
     - `NODE_ENV`: `production`

5. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment to complete (~5 minutes)
   - Your app will be live at `https://card-organizer.onrender.com`

6. **Update Frontend API URL**
   - Edit `frontend/app.js`
   - Change `const API_URL = 'http://localhost:3000';`
   - To `const API_URL = 'https://your-app-name.onrender.com';`
   - Commit and push changes

---

### Deploying to Railway

Railway offers a simple deployment process with a generous free tier.

1. **Push your code to GitHub**

2. **Create a New Project**
   - Go to https://railway.app
   - Sign in with GitHub
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository

3. **Configure the Deployment**
   - Railway will auto-detect Node.js
   - Click on your service
   - Go to "Settings" tab
   - Set **Start Command:** `cd backend && npm start`

4. **Add Environment Variables**
   - Go to "Variables" tab
   - Add:
     - `MONGODB_URI`: Your MongoDB Atlas connection string
     - `JWT_SECRET`: Your generated secret key
     - `NODE_ENV`: `production`

5. **Generate a Domain**
   - Go to "Settings" tab
   - Click "Generate Domain" under "Domains"
   - Your app will be available at `https://your-app.up.railway.app`

6. **Update Frontend API URL**
   - Edit `frontend/app.js` with your Railway domain
   - Commit and push changes

---

### Deploying to Heroku

**Note:** Heroku no longer offers a free tier, but it's still a popular option.

1. **Install Heroku CLI**
   ```bash
   # macOS
   brew tap heroku/brew && brew install heroku

   # Ubuntu
   curl https://cli-assets.heroku.com/install.sh | sh
   ```

2. **Login to Heroku**
   ```bash
   heroku login
   ```

3. **Create a Heroku App**
   ```bash
   heroku create card-organizer
   ```

4. **Add a Procfile**
   Create a file named `Procfile` in the root directory:
   ```
   web: cd backend && npm install && npm start
   ```

5. **Set Environment Variables**
   ```bash
   heroku config:set MONGODB_URI="<your-connection-string>"
   heroku config:set JWT_SECRET="<your-secret-key>"
   heroku config:set NODE_ENV=production
   ```

6. **Deploy**
   ```bash
   git push heroku main
   ```

7. **Update Frontend API URL**
   - Edit `frontend/app.js`
   - Update `API_URL` to your Heroku app URL
   - Commit and push

---

## Post-Deployment

### Verify Deployment

1. **Test Authentication**
   - Visit your deployed URL
   - Click "Register" and create an account
   - Login with your credentials

2. **Test Card Creation**
   - Click "Add Card"
   - Upload an image and fill in details
   - Verify the card appears in your collection

3. **Test Card Operations**
   - View a card
   - Edit a card
   - Delete a card

### Troubleshooting

**Cards not loading / API errors:**
- Check that `API_URL` in `frontend/app.js` matches your deployment URL
- Verify environment variables are set correctly
- Check deployment logs for errors

**Authentication not working:**
- Verify `JWT_SECRET` is set in environment variables
- Check that `MONGODB_URI` is correct
- Ensure MongoDB Atlas allows connections from anywhere (0.0.0.0/0)

**Images not displaying:**
- Ensure the uploads directory is being created
- Check file upload limits on your hosting platform
- Verify CORS is properly configured

### Updating Your Deployment

When you make changes:

1. **Commit and push to GitHub**
   ```bash
   git add .
   git commit -m "Description of changes"
   git push origin main
   ```

2. **Automatic Deployment**
   - Render and Railway automatically redeploy on git push
   - Heroku requires: `git push heroku main`

---

## Performance Tips

1. **Enable Compression**
   - Add compression middleware to reduce response sizes

2. **Implement Caching**
   - Cache static assets
   - Implement Redis for session storage

3. **Optimize Images**
   - Compress images before upload
   - Consider using a CDN for image storage (e.g., Cloudinary, AWS S3)

4. **Database Indexing**
   - Add indexes on frequently queried fields (userId, occasion, etc.)

---

## Security Checklist

- ✅ JWT_SECRET is a strong, random value
- ✅ MongoDB connection string is not exposed in code
- ✅ HTTPS is enabled (automatic on most platforms)
- ✅ CORS is properly configured
- ✅ Passwords are hashed with bcrypt
- ✅ Input validation on all endpoints
- ✅ Rate limiting for authentication endpoints (consider adding)

---

## Support

For issues or questions:
- Check the logs on your hosting platform
- Review MongoDB Atlas logs for database issues
- Ensure all environment variables are correctly set

---

## Cost Estimates

### Free Tier Options

- **MongoDB Atlas:** 512 MB storage (adequate for thousands of cards)
- **Render:** 750 hours/month free (enough for one service 24/7)
- **Railway:** $5/month credit (usually enough for small apps)

### Paid Upgrades (if needed)

- **MongoDB Atlas M10:** ~$57/month (more storage and performance)
- **Render Starter:** $7/month per service (always-on, more resources)
- **Railway:** Pay per usage beyond free credit (~$5-20/month typical)

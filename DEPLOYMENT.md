# Fly.io Deployment Guide

This project uses a two-app deployment strategy on Fly.io:
- `drug-monitor-api`: Rails API backend
- `drug-monitor-frontend`: React frontend

## Prerequisites

1. Install the Fly CLI: `curl -L https://fly.io/install.sh | sh`
2. Login to Fly: `fly auth login`
3. Set up a Mapbox account and get an access token

## Backend Deployment (Rails API)

1. Navigate to the Rails app directory:
   ```bash
   cd rails_app
   ```

2. Launch the Rails API app:
   ```bash
   fly launch --name drug-monitor-api --region iad
   ```

3. Set any required secrets:
   ```bash
   fly secrets set RAILS_MASTER_KEY=$(cat config/master.key)
   ```

4. Deploy:
   ```bash
   fly deploy
   ```

5. Note the deployed API URL (e.g., `https://drug-monitor-api.fly.dev`)

## Frontend Deployment (React App)

1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```

2. Launch the frontend app:
   ```bash
   fly launch --name drug-monitor-frontend --region iad
   ```

3. Set build-time environment variables:
   ```bash
   fly secrets set VITE_API_URL=https://drug-monitor-api.fly.dev
   fly secrets set VITE_MAPBOX_TOKEN=your_mapbox_token_here
   ```

4. Deploy:
   ```bash
   fly deploy
   ```

## Post-Deployment

1. Update CORS in Rails if needed (`config/initializers/cors.rb`)
2. Test the frontend at `https://drug-monitor-frontend.fly.dev`
3. Verify API calls are working correctly

## Local Development

1. Start Rails API: `cd rails_app && rails s`
2. Start frontend: `cd frontend && npm run dev`
3. Frontend will be at `http://localhost:8080`
4. API will be at `http://localhost:3000`
#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

# Step 1: Push latest changes to GitHub
echo "Pushing changes to GitHub..."
git add -A
git commit -m "Update site" || echo "No changes to commit"
git push
echo "Changes pushed to GitHub successfully."

# Step 2: Build the site locally
echo "Building the site locally..."
npm run build
echo "Site built successfully."

# Step 3: Deploy to Vercel
echo "Deploying to Vercel production..."
vercel deploy --prod --prebuilt
echo "Deployment to Vercel completed!"

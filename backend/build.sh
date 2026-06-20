#!/bin/bash
set -e

# System deps
apt-get update && apt-get install -y ffmpeg nodejs npm

# Python deps
pip install -r requirements.txt

# Build React frontend
cd ../frontend
npm install
npm run build

# Copy built frontend into backend so FastAPI can serve it
cd ../backend
rm -rf frontend_dist
cp -r ../frontend/dist ./frontend_dist

mkdir -p /tmp/output

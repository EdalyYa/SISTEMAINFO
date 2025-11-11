# Backend Dockerfile for Node/Express
FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY backend/package*.json ./
RUN npm install --omit=dev

# Copy source code
COPY backend ./

# Expose backend port
EXPOSE 4001

# Start the server
CMD ["node", "index.js"]

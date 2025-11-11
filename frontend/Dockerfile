# Frontend Dockerfile (multi-stage): build Vite app, serve with Nginx

# 1) Build stage
FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

# Copy all project files (vite config expects root)
COPY . .

# Allow passing API base URL at build-time
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

RUN npm run build

# 2) Runtime stage with Nginx
FROM nginx:alpine

# Copy compiled assets
COPY --from=build /app/dist /usr/share/nginx/html

# Default Nginx serves index.html for SPA
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

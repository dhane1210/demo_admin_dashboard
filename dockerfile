# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Accept build arguments
ARG VITE_API_URL
ARG VITE_MAP_TILE_URL
ARG VITE_SUPPORT_EMAIL

# Expose them to Vite at build time
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_MAP_TILE_URL=$VITE_MAP_TILE_URL
ENV VITE_SUPPORT_EMAIL=$VITE_SUPPORT_EMAIL

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build


# Stage 2: Serve with Nginx
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
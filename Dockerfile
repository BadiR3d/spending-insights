# syntax=docker/dockerfile:1

# Build stage: install dependencies, then compile the production bundle.
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
# Vite inlines VITE_* variables at build time; override to target a real API.
ARG VITE_ENABLE_MOCKS=true
ARG VITE_API_BASE_URL=
ENV VITE_ENABLE_MOCKS=$VITE_ENABLE_MOCKS \
    VITE_API_BASE_URL=$VITE_API_BASE_URL
RUN npm run build

# Serve stage: static bundle behind nginx with a single-page-app fallback.
FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget -qO /dev/null http://127.0.0.1/ || exit 1

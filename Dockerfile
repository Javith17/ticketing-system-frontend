## Build stage
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
# Vite bakes VITE_* values into the bundle at build time, and .env files are
# excluded by .dockerignore, so they come in as build args.
ARG VITE_API_BASE_URL=/api
ARG VITE_APP_NAME="Ticketing System"
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL \
    VITE_APP_NAME=$VITE_APP_NAME
RUN npm run build

## Serve stage
FROM nginx:1.27-alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 4001
CMD ["nginx", "-g", "daemon off;"]

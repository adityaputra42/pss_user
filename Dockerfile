# syntax=docker/dockerfile:1

# ---- build stage -------------------------------------------------------
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

COPY . .

# Baked in at build time -- this is a static SPA served to the END
# USER's browser, so it must be a URL *their* machine can reach, not a
# docker-network hostname like http://api:8080 (that only resolves
# between containers). Default matches the backend's host-mapped port
# in docker-compose.yml. Override with:
#   docker build --build-arg VITE_API_URL=https://api.example.com/api/v1 .
ARG VITE_API_URL=http://localhost:8080/api/v1
ENV VITE_API_URL=${VITE_API_URL}

RUN npm run build

# ---- runtime stage -------------------------------------------------------
FROM nginx:1.27-alpine AS runtime

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=10s --timeout=3s --retries=5 \
    CMD wget -q --spider http://localhost/ || exit 1

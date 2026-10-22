# Stage 1: Build
FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install

COPY . .
RUN npm run build

# Stage 2: Artifacts
# Since this is a browser extension, the "production" environment
# just needs to serve the dist folder or just have it ready for extraction.
FROM alpine:latest
WORKDIR /output
COPY --from=builder /app/dist ./dist
CMD ["ls", "-R", "/output/dist"]

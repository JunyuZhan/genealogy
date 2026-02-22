# Stage 1: Build Frontend
FROM node:18-alpine AS frontend-builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Build Backend
FROM node:18-alpine AS backend-builder
WORKDIR /app
COPY server/package.json server/package-lock.json ./
RUN npm ci
COPY server/ .
RUN npm run build

# Stage 3: Production Runtime
FROM node:18-alpine
WORKDIR /app

# Copy built frontend assets
COPY --from=frontend-builder /app/dist ./dist

# Copy built backend code
COPY --from=backend-builder /app/dist ./server/dist
COPY --from=backend-builder /app/package.json ./server/package.json
COPY --from=backend-builder /app/node_modules ./server/node_modules

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Expose port
EXPOSE 3000

# Start server
WORKDIR /app/server
CMD ["node", "dist/index.js"]

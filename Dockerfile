# Development stage
FROM node:20-alpine AS development

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies
RUN npm ci

# Copy configuration files
COPY tsconfig.json vite.config.ts ./

# Expose port
EXPOSE 8787

# Run development server
CMD ["npm", "run", "dev"]

# Builder stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code and configuration
COPY tsconfig.json vite.config.ts drizzle.config.ts ./
COPY src ./src

# Build application
RUN npm run build

# Production stage
FROM node:20-alpine AS production

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --production

# Copy built application
COPY --from=builder /app/dist ./dist

# Expose port
EXPOSE 8787

# Run the application
CMD ["npm", "run", "start"]

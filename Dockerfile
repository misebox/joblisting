# Development stage
FROM node:20-alpine AS development

WORKDIR /work

# Copy package files
COPY package*.json ./

# Install all dependencies
RUN npm ci

# Copy configuration files
COPY . ./

# Expose port
EXPOSE 8787

# Run development server
CMD ["npm", "run", "dev"]

# Builder stage
FROM node:20-alpine AS builder

WORKDIR /work

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code and configuration
COPY . ./

# Build application
RUN npm run build

# Production stage
FROM node:20-alpine AS production

WORKDIR /work

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --production

# Copy built application
COPY --from=builder /work/dist ./dist

# Expose port
EXPOSE 8787

# Run the application
CMD ["npm", "run", "start"]

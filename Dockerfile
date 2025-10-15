# Multi-stage build for optimized Next.js application
# This app is client-side focused but Next.js will serve the initial HTML and static assets

# Security: Using node:22-alpine3.22 (0 CVEs as of 2025)
# Alternative: node:22-slim has 200+ vulnerabilities
# Never use: node:latest (unpredictable updates)

# Stage 1: Dependencies installation
FROM node:22-alpine3.22 AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on yarn.lock
COPY package.json yarn.lock ./
RUN yarn --frozen-lockfile

# Stage 2: Build the application
FROM node:22-alpine3.22 AS builder
WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set environment variables for build
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Build the Next.js application
# This will create the .next/standalone folder
RUN yarn build

# Stage 3: Production runtime
FROM node:22-alpine3.22 AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create a non-root user for security
# This limits damage if container is compromised
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy public assets
COPY --from=builder /app/public ./public

# Copy the standalone server files
# Next.js standalone mode creates a minimal server bundle
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Switch to non-root user
USER nextjs

# Expose port 3000
EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Start the Next.js server
# This serves the HTML/JS/CSS to the browser
# Client-side code (IndexedDB, localStorage) runs in the user's browser
CMD ["node", "server.js"]

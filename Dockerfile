# Stage 1: Build the Astro site
FROM node:22-alpine AS build

RUN corepack enable

WORKDIR /app

# Install dependencies first (better layer caching)
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Copy source and build
COPY . .
RUN pnpm build

# Stage 2: Run the Node server
FROM node:22-alpine AS runtime

RUN corepack enable

WORKDIR /app

# Install production dependencies
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod

# Copy the built output
COPY --from=build /app/dist ./dist

ENV HOST=0.0.0.0
ENV PORT=8080

EXPOSE 8080

CMD ["node", "dist/server/entry.mjs"]

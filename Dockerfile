# Stage 1: Build the Astro site
FROM node:22-alpine AS build

# corepack ignores the packageManager pin on Fly's builder and fetches the newest
# pnpm (12.x on 2026-09-30), which no longer reads the build allow-list from
# package.json and refuses esbuild and sharp. Pin the same pnpm the lockfile
# was made with, the way the main site does.

WORKDIR /app

# Install dependencies first (better layer caching)
COPY package.json pnpm-lock.yaml ./
RUN npx -y pnpm@10.33.3 install --frozen-lockfile

# Copy source and build
COPY . .
RUN npx -y pnpm@10.33.3 build

# Stage 2: Run the Node server
FROM node:22-alpine AS runtime


WORKDIR /app

# Install production dependencies
COPY package.json pnpm-lock.yaml ./
RUN npx -y pnpm@10.33.3 install --frozen-lockfile --prod

# Copy the built output
COPY --from=build /app/dist ./dist

ENV HOST=0.0.0.0
ENV PORT=8080

EXPOSE 8080

CMD ["node", "dist/server/entry.mjs"]

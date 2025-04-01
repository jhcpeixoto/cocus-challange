# Base stage
FROM node:latest AS base
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile
COPY . .

# Build stage
FROM base AS builder
RUN yarn build

# Production stage
FROM node:latest AS production
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY package.json yarn.lock ./
RUN yarn install --production --frozen-lockfile
EXPOSE 3000
CMD ["node", "dist/main"]

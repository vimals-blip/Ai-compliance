FROM node:22-alpine AS base

WORKDIR /usr/src/app

# Install dependencies needed for native modules & prisma
RUN apk add --no-cache openssl libc6-compat

# Copy workspace package manifests
COPY package.json package-lock.json* ./
COPY packages/types/package.json ./packages/types/
COPY packages/config/package.json ./packages/config/
COPY packages/ui/package.json ./packages/ui/
COPY apps/api/package.json ./apps/api/
COPY apps/api/prisma ./apps/api/prisma/

RUN npm install

# Copy source files
COPY packages ./packages
COPY apps/api ./apps/api

# Build types package and generate prisma client
RUN npm run --workspace=@ai-compliance/types build || true
RUN cd apps/api && npx prisma generate

# Build API
RUN cd apps/api && npm run build

EXPOSE 4000

CMD ["node", "apps/api/dist/main"]

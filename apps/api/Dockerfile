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
RUN npx prisma generate --schema=apps/api/prisma/schema.prisma

# Build API
RUN npm run build --workspace=@ai-compliance/api

EXPOSE 4000

CMD ["sh", "-c", "if [ -f apps/api/dist/src/main.js ]; then node apps/api/dist/src/main.js; else node apps/api/dist/main.js; fi"]

FROM node:22-alpine AS base

WORKDIR /usr/src/app

# Install dependencies needed for native modules & prisma
RUN apk add --no-cache openssl libc6-compat

# Copy package manifest & prisma schema
COPY package.json ./
COPY prisma ./prisma/

RUN npm install

# Copy source code
COPY . .

# Generate prisma client & build API
RUN npx prisma generate
RUN npm run build

EXPOSE 4000

ENV PORT=4000
CMD ["sh", "-c", "if [ -f dist/src/main.js ]; then node dist/src/main.js; else node dist/main.js; fi"]

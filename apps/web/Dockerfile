FROM node:22-alpine AS base

WORKDIR /usr/src/app

COPY package.json package-lock.json* ./
COPY packages/types/package.json ./packages/types/
COPY packages/config/package.json ./packages/config/
COPY packages/ui/package.json ./packages/ui/
COPY apps/web/package.json ./apps/web/

RUN npm install

COPY packages ./packages
COPY apps/web ./apps/web

RUN npm run --workspace=@ai-compliance/types build || true
RUN cd apps/web && npm run build

EXPOSE 3000

CMD ["npm", "run", "--workspace=apps/web", "start"]

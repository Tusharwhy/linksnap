# ==========================================
# STAGE 1: Build & Dependency Installation
# ==========================================

FROM node:24-alpine AS build 
WORKDIR /usr/src/app
COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

RUN npm prune  --omit=dev

# ==========================================
# STAGE 2: Final build
# ==========================================
FROM node:24-alpine AS runner


# we copy important files from builder stage
WORKDIR /usr/src/app

ENV NODE_ENV=production

COPY --from=build /usr/src/app/package*.json ./
COPY --from=build /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/dist ./dist

EXPOSE 3000

USER node

CMD ["node","dist/server.js"]
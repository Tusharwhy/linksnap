# --- Stage 1: build the app ---

FROM node:24-alpine AS build

WORKDIR /usr/src/app
COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build


# --- Stage 2: run the app ---

FROM nginx:alpine AS runner

# Update Alpine packages to patched versions
RUN apk upgrade --no-cache

COPY --from=build /usr/src/app/dist /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80




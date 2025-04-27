FROM node:22-alpine AS builder

ARG SERVER_PORT
RUN test -n "${SERVER_PORT}" || (echo "PORT not set" && false)

RUN apk --no-cache --update add dumb-init curl \
  && rm -rf /var/cache/apk/*

ADD https://github.com/ufoscout/docker-compose-wait/releases/download/2.9.0/wait /wait
RUN chmod +x /wait

WORKDIR /build

COPY package.json /build
COPY package-lock.json /build
COPY src /build/src
COPY tsconfig.json /build

RUN NODE_ENV=development npm install
RUN npm run build
RUN npm prune --omit=dev

FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

WORKDIR /app/server

COPY --from=builder /wait /wait
COPY --from=builder /build/dist /app/server/src
COPY --from=builder /build/node_modules /app/server/node_modules
COPY --from=builder /build/package.json /app/server/package.json

USER node
EXPOSE $SERVER_PORT

# Start the application
CMD ["npm", "run", "start:prod"]
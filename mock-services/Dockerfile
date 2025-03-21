FROM node:20-alpine as builder

ARG MOCKSERVER_PORT
RUN test -n "${MOCKSERVER_PORT}" || (echo "PORT not set" && false)

RUN apk --no-cache --update add dumb-init curl \
  && rm -rf /var/cache/apk/*

ADD https://github.com/ufoscout/docker-compose-wait/releases/download/2.9.0/wait /wait
RUN chmod +x /wait

# Build stage
WORKDIR /build

COPY package.json /build
COPY package-lock.json /build
COPY src /build/src
COPY tsconfig.json /build

# then build it.
RUN NODE_ENV=development npm install
RUN npx tsc
RUN npm prune --omit=dev

# Run stage
FROM node:20-alpine

ENV NODE_ENV=production

WORKDIR /app/server

COPY --from=0 /wait /wait
COPY --from=builder  /build/dist /app/server/src
COPY --from=builder  /build/node_modules /app/server/node_modules
COPY --from=builder  /build/package.json /app/server/package.json

EXPOSE ${MOCKSERVER_PORT}
CMD ["npm", "run", "start"] 
FROM node:22-alpine

ARG SERVER_PORT
RUN test -n "${SERVER_PORT}" || (echo "PORT not set" && false)

RUN apk --no-cache --update add dumb-init curl \
  && rm -rf /var/cache/apk/*

ADD https://github.com/ufoscout/docker-compose-wait/releases/download/2.9.0/wait /wait
RUN chmod +x /wait

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Expose port
EXPOSE ${SERVER_PORT}

# Start the application
CMD ["npm", "run", "start"] 
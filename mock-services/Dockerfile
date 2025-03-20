FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
COPY src ./src

RUN npm install

EXPOSE 1143

CMD ["npm", "run", "start"] 
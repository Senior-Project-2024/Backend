FROM node:18-alpine as base

RUN apk add --no-cache curl

WORKDIR /test

COPY . .


#########################
FROM node:18-alpine as final

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

EXPOSE 4000

CMD ["node", "dist/main.js"]

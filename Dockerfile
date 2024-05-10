FROM nginx:1.20-alpine as base

RUN apk add --no-cache curl

WORKDIR /test

COPY . .

#########################
FROM base as test

#layer test tools and assets on top as optional test stage
RUN apk add --no-cache apache2-utils


#########################
FROM node:18-alpine as final

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

EXPOSE 4000

CMD ["node", "dist/main.js"]

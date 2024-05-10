FROM node:18-alpine as base

RUN apk add --no-cache curl

WORKDIR /test

COPY . .


#########################

FROM base as test

#########################
FROM base as final

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

EXPOSE 4000

CMD ["node", "dist/main.js"]

FROM node:18-alpine

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .

COPY .env .env.development ./

RUN npm run build

EXPOSE 4000

CMD ["npm", "run", "start:prod"]

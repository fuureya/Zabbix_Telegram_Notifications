FROM node:20-alpine

WORKDIR /usr/src/app

COPY app/package*.json ./

RUN npm install

ENV PATH="./node_modules/.bin:$PATH"

COPY app/ .

EXPOSE 3000

CMD ["node", "index.js"]

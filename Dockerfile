FROM node:16-alpine

RUN npm install -g pnpm

WORKDIR /usr/app

COPY package.json ./
COPY pnpm-lock.yaml ./

RUN pnpm install

COPY src ./src

COPY config ./config

EXPOSE 3000

ARG NODE_ENV=development
ENV NODE_ENV ${NODE_ENV}

CMD ["node", "./src/server.js"]

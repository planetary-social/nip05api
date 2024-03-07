FROM node:18-alpine

RUN npm install -g pnpm

WORKDIR /usr/app

COPY package.json ./
COPY pnpm-lock.yaml ./

RUN pnpm install --prod

COPY src ./src
COPY config ./config

EXPOSE 3000

# Set as development by default for local testing, override with -e NODE_ENV=production
ENV NODE_ENV=development

CMD ["node", "./src/server.js"]

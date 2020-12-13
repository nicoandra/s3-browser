FROM node:15-alpine As base

FROM base As development

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install --only=production
RUN npm install --only=development
RUN apk add git

COPY . .

RUN npm run build



FROM base as production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install --only=production
COPY . .
RUN npm run build

CMD ["node", "dist/main"]
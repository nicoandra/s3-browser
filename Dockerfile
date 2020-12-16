FROM node:15-alpine As base

RUN apk add --no-cache supervisor

RUN mkdir /usr/src/app/frontend -p
RUN mkdir /usr/src/app/backend -p

WORKDIR /usr/src/app

COPY frontend/package*.json ./frontend/
COPY backend/package*.json ./backend/


COPY ./frontend ./frontend
COPY ./backend ./backend

WORKDIR /usr/src/app/frontend
RUN npm install --only=production
RUN npm run build

WORKDIR /usr/src/app/backend
RUN npm install -g @nestjs/cli
RUN npm install
RUN npm run build

COPY .extras/supervisor.conf /etc/supervisord.conf

EXPOSE 3000
EXPOSE 5000

CMD ["/usr/bin/supervisord", "-c", "/etc/supervisord.conf"]

FROM node:15-alpine As base

RUN mkdir /usr/src/app/frontend -p
RUN mkdir /usr/src/app/backend -p

RUN apk add --no-cache supervisor py-pip
RUN pip install supervisor-stdout
RUN npm install -g serve

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

COPY .extras/supervisor.conf /usr/src/app/supervisord.conf

WORKDIR /usr/src/app

ENV BACKEND_PORT=5000
ENV FRONTEND_PORT=3000

EXPOSE 3000
EXPOSE 5000

CMD ["/usr/bin/supervisord", "-c", "/usr/src/app/supervisord.conf"]

FROM node:12-alpine as builder
WORKDIR /app
COPY MindHub/package.json /app/package.json
RUN npm install --only=prod
COPY . /app
RUN cd MindHub
RUN npm run build
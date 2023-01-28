FROM node:18-alpine as BUILDER

RUN mkdir /content-downloader

WORKDIR /content-downloader

COPY bin ./
COPY src ./
COPY package.json ./
COPY package-lock.json ./

RUN npm i && npm link && ls
RUN ./hugo-content-downloader


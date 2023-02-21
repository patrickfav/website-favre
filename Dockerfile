FROM node:18-alpine as BUILDER

MAINTAINER Patrick Favre-Bulle <patrick@favre.at>

RUN apk update && \
    apk add hugo &&  \
    apk add git &&  \
    hugo version

COPY content-downloader/bin /content-downloader/bin
COPY content-downloader/src /content-downloader/src
COPY content-downloader/package.json /content-downloader/
COPY content-downloader/package-lock.json /content-downloader/

WORKDIR /content-downloader

RUN npm ci &&  \
    npm link &&  \
    bin/hugo-content-downloader

COPY .git /site/.git
COPY archetypes /site/archetypes
COPY assets /site/assets
COPY config /site/config
COPY content /site/content
COPY content /site/content
COPY layouts /site/layouts
COPY static /site/static
COPY themes /site/themes
COPY .hugo_build.lock /site
COPY config.toml /site

RUN ls
RUN ls /content
RUN ls /content/opensource
RUN ls /site/content
RUN ls /site/content/opensource
RUN cp -R /content/ /site/content/
RUN ls /site
RUN ls /site/content
RUN ls /site/content/opensource


WORKDIR /site
RUN hugo --minify

FROM nginx:1.23.3-alpine

COPY nginx.conf /etc/nginx/nginx.conf

COPY --from=BUILDER /site/public /usr/share/www/

HEALTHCHECK --interval=10s --timeout=3s --start-period=3s \
    CMD ps aux | grep '[n]ginx' || exit 1

EXPOSE 80

FROM alpine:3.17.3 as BUILDER

MAINTAINER Patrick Favre-Bulle <patrick@favre.at>

RUN apk update && \
    apk add hugo &&  \
    apk add git &&  \
    hugo version

# Copy everything needed to build site
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

WORKDIR /site

RUN hugo --minify

FROM nginx:1.23.3-alpine

COPY nginx.conf /etc/nginx/nginx.conf

COPY --from=BUILDER /site/public /usr/share/www/

HEALTHCHECK --interval=10s --timeout=3s --start-period=3s \
    CMD ps aux | grep '[n]ginx' || exit 1

EXPOSE 80

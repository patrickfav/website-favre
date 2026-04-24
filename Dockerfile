FROM nginx:1.29.8-alpine

LABEL org.opencontainers.image.authors="Patrick Favre"

COPY nginx.conf /etc/nginx/nginx.conf

COPY public /usr/share/www/

HEALTHCHECK --interval=10s --timeout=3s --start-period=3s \
    CMD ps aux | grep '[n]ginx' || exit 1

EXPOSE 80

FROM nginx:alpine

ENV PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/opt

COPY src/scripts/build-proxy.js /opt/build-proxy

RUN \
  chmod +x /opt/build-proxy && \
  apk update && \
  apk add nodejs && \
  rm -rf /var/cache/apk/*

COPY nginx/ /etc/nginx/

EXPOSE 80

STOPSIGNAL SIGTERM

CMD build-proxy && nginx -g 'daemon off;'

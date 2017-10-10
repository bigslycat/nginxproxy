FROM node:alpine

ENV PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/opt

RUN \
  apk update && apk upgrade && \
  apk add bash bash-completion git nginx && \
  rm -rf /var/cache/apk/* && \
  yarn global add npm@*

SHELL ["/bin/bash", "-c"]

COPY nginx/nginx.conf /etc/nginx/
COPY nginx/cors.conf /etc/nginx/
COPY nginx/conf.d /etc/nginx/conf.d/

COPY src/scripts/build-proxy.js /opt/build-proxy
COPY src/scripts/what-command.js /opt/what-command
COPY src/scripts/init-container.bash /opt/init-container

RUN chmod +x /opt/build-proxy
RUN chmod +x /opt/what-command
RUN chmod +x /opt/init-container

RUN mkdir /app
WORKDIR /app

EXPOSE 80

STOPSIGNAL SIGTERM

CMD ["init-container"]

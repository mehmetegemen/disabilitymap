FROM bitnami/mongodb:latest
USER root
COPY ./ /somedir
WORKDIR /somedir
RUN mkdir -p /data/db
CMD ["mongod","--bind_ip","127.0.0.1,172.97.0.1","--port","27019"]
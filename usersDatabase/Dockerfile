FROM bitnami/mongodb:latest
USER root
COPY ./ /somedir
WORKDIR /somedir
RUN mkdir -p /data/db
CMD ["mongod","--bind_ip","127.0.0.1,172.98.0.67","--port","27018"]
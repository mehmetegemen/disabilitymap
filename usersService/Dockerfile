FROM keymetrics/pm2:latest-jessie
COPY ./ ./wd
WORKDIR /wd
ENV DEBUG=*
ENV PORT=3004
ENV USERS_MONGO_URL=mongodb://172.98.0.67:27018/disabilitymap
RUN npm install
RUN npm install -g typescript
RUN tsc
CMD ["pm2-docker", "start", "ecosystem.config.js"]
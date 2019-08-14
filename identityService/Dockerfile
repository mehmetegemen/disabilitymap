FROM keymetrics/pm2:latest-jessie
COPY ./ ./wd
WORKDIR /wd
ENV DEBUG=*
ENV PORT=3003
ENV IDENTITY_MONGO_URL=mongodb://172.97.0.1:27017/disabilitymap
RUN npm install
RUN npm install -g typescript
RUN tsc
CMD ["pm2-docker", "start", "ecosystem.config.js"]
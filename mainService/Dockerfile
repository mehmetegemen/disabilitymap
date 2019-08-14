FROM keymetrics/pm2:latest-jessie
COPY ./ ./wd
WORKDIR /wd
ENV DEBUG=*
ENV PORT=3005
ENV IDENTITY_SERVICE_URL=http://identityservice:3003
ENV USERS_SERVICE_URL=http://usersservice:3004
ENV SECRET=stupid_trump
RUN npm install
RUN npm install -g typescript
RUN tsc
CMD ["pm2-docker", "start", "ecosystem.config.js"]
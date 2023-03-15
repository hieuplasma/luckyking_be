# FROM keymetrics/pm2:18-alpine As development

FROM node:18-alpine As development

USER node
RUN mkdir -p /home/node/app
WORKDIR /home/node/app

COPY --chown=node:node package*.json ./
COPY --chown=node:node prisma ./prisma/

RUN npm install glob rimraf

RUN npm install

COPY --chown=node:node . .

RUN npx prisma generate

RUN npm run build

FROM node:18-alpine
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

# RUN npx prisma migrate dev

EXPOSE 3003

#CMD ["npm","run" "start:prod:pm2"]
CMD ["npm","run" "start:prod"]
# CMD [ "node", "dist/main" ]
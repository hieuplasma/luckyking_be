FROM node:18-alpine As development

WORKDIR /usr/src/app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm install glob rimraf

RUN npm install

COPY . .

RUN npx prisma generate

RUN npm run build

FROM node:18-alpine

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

# RUN npx prisma migrate dev

EXPOSE 3003

CMD ["npm","run" "start:prod"]
# CMD [ "node", "dist/main" ]
FROM node:18 AS builder
WORKDIR /app
COPY package*.json .
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build --verbose
#RUN npm prune --production

FROM node:18
WORKDIR /app
COPY --from=builder --link /app/data data/
COPY --from=builder /app/static static/
COPY --from=builder /app/build build/
COPY --from=builder /app/node_modules node_modules/
COPY package.json .
EXPOSE 3000
ENV NODE_ENV=production
CMD [ "node", "build" ]

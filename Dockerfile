FROM node:22 AS build

WORKDIR /App

COPY package*.json ./
COPY prisma ./prisma

RUN npm ci

COPY . .

RUN npm run build


FROM node:22-slim AS runtime

WORKDIR /App

COPY package*.json ./
COPY prisma ./prisma
COPY prisma.config.ts ./

RUN apt-get update \
    && apt-get install -y openssl \
    && rm -rf /var/lib/apt/lists/*

RUN npm ci --omit=dev

COPY --from=build /App/dist ./dist
COPY --from=build /App/src/generated/prisma ./src/generated/prisma

EXPOSE 3000

CMD ["npm", "start"]
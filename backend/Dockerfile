FROM node:20-alpine

# Prisma用にopensslとopenssldevをインストール
RUN apk add --no-cache openssl openssl-dev

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm install
RUN npx prisma generate

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]

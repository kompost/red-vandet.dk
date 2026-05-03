FROM node:24-alpine AS builder

RUN npm install -g pnpm

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma

RUN pnpm install --frozen-lockfile

COPY . .

ENV NODE_ENV=production
ENV DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy"

RUN node_modules/.bin/prisma generate
RUN pnpm build


FROM node:24-alpine

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma
COPY prisma.config.ts ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src/generated ./src/generated

COPY entrypoint.sh ./
RUN chmod +x entrypoint.sh

EXPOSE 3000

ENV NODE_ENV=production

CMD ["./entrypoint.sh"]

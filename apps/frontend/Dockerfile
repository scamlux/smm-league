FROM node:18-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY . .

RUN npm run build --workspace=@smm-league/frontend

EXPOSE 3000

CMD ["npm", "run", "start", "--workspace=@smm-league/frontend"]

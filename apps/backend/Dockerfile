FROM node:18-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY . .

RUN npm run build --workspace=@smm-league/backend

EXPOSE 3001

CMD ["npm", "run", "start", "--workspace=@smm-league/backend"]

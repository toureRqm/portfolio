FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
COPY client/package*.json ./client/
COPY server/package*.json ./server/
RUN npm install && cd client && npm install && cd ../server && npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]

# Stage 1: Build Angular app
FROM node:14 AS builder

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build -- --prod

# Stage 2: Deploy Angular app using Nginx
FROM nginx:alpine

COPY --from=builder /app/dist/ /usr/share/nginx/html

EXPOSE 8081

CMD ["nginx", "-g", "daemon off;"]

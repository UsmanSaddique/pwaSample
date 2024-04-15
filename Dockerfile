# Stage 1: Build Angular app
FROM node:14 AS builder

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the remaining application code
COPY . .

# Build the Angular app for production
RUN npm run build -- --prod

# Print console message
RUN echo "Angular app built successfully"

# Stage 2: Deploy Angular app using Nginx
FROM nginx:alpine

# Copy the built Angular app from the builder stage to the Nginx server
COPY --from=builder /app/dist/ /usr/share/nginx/html

# Expose port 8081 to allow outside access to the Angular app
EXPOSE 8081

# Start Nginx when the container starts
CMD ["nginx", "-g", "daemon off;"]

# Print console message
RUN echo "Angular app deployed successfully"

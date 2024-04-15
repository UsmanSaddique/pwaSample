# Use an official Node.js runtime as the base image
FROM node:14 AS builder

# Set the working directory in the container
WORKDIR /app

# Copy the package.json and package-lock.json files to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the remaining application code to the working directory
COPY . .

# Build the Angular app for production
RUN npm run build -- --prod

# Use an official Nginx image as the base image for serving the Angular app
FROM nginx:alpine

# Copy the built Angular app from the builder stage to the Nginx server
COPY --from=builder /app/dist/ /usr/share/nginx/html

# Expose port 8081 to allow outside access to the Angular app
EXPOSE 8081

# Start Nginx when the container starts
CMD ["nginx", "-g", "daemon off;"]

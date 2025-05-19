# Base image
FROM node:24-alpine

# Working directory inside container
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy app code
COPY . .

# Expose port
EXPOSE 3000

# Start app
CMD ["node", "server.js"]
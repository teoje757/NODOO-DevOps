# Base image
FROM node:24-alpine

# Working directory inside container
WORKDIR /app

# Install dependencies first
COPY package*.json ./
RUN npm install


# Copy all source code
COPY . .

# Run tests
RUN npm test

# Expose port
EXPOSE 3000

# Start app
CMD ["node", "server.js"]
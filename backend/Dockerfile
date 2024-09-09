# Use an official Node.js runtime as the base image
FROM node:18-slim

# Install necessary dependencies for Puppeteer (Chrome)
RUN apt-get update && apt-get install -y \
    chromium \
    fonts-liberation \
    libappindicator3-1 \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libcups2 \
    libdbus-1-3 \
    libdrm2 \
    libgbm1 \
    libnspr4 \
    libnss3 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    xdg-utils \
    --no-install-recommends && \
    rm -rf /var/lib/apt/lists/*

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json (or yarn.lock) before other files
# to take advantage of Docker's cache.
COPY package*.json ./

# Install any dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Set environment variable to tell Puppeteer to use Chromium from the OS
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

# Expose the port that the app runs on
EXPOSE 3000

# Define the command to run your app
CMD ["npm", "start"]

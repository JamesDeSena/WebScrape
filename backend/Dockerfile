FROM ghcr.io/puppeteer/puppeteer:23.3.0

# No need for PUPPETEER_SKIP_CHROMIUM_DOWNLOAD or PUPPETEER_EXECUTABLE_PATH
WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci
COPY . .

# Expose the correct port
EXPOSE 8008

# Start the app
CMD [ "node", "index.js" ]

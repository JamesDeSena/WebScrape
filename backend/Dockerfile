FROM ghcr.io/puppeteer/puppeteer:23.3.0

# Add Google Chrome key to /etc/apt/trusted.gpg.d/ and configure the Chrome repository
RUN wget -q -O /etc/apt/trusted.gpg.d/google_linux_signing_key.pub https://dl-ssl.google.com/linux/linux_signing_key.pub \
    && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" > /etc/apt/sources.list.d/google.list' \
    && apt-get update \
    && apt-get install -y google-chrome-unstable fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst ttf-freefont \
        --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# Set Puppeteer environment variables
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci
COPY . .

CMD ["node", "index.js"]

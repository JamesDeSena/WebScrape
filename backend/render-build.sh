#!/usr/bin/env bash

# Update and install necessary dependencies for Puppeteer
apt-get update

# Install Chromium and other dependencies required by Puppeteer
apt-get install -y libnss3 libx11-xcb1 libxcomposite1 libxcursor1 \
                   libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 \
                   libxrender1 libxtst6 fonts-liberation libappindicator1 \
                   libatk-bridge2.0-0 libatk1.0-0 libcups2 libdbus-1-3 \
                   libdrm2 libgbm1 libgtk-3-0 libnspr4 libpango-1.0-0 \
                   libxss1 libasound2 libwayland-client0 libwayland-cursor0 \
                   libwayland-egl1 mesa-utils libgl1-mesa-glx

# Ensure that Puppeteer installs Chromium correctly
npm install puppeteer --unsafe-perm=true

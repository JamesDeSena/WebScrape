#!/usr/bin/env bash

# Install dependencies for Puppeteer
apt-get update && apt-get install -y \
libX11-xcb1 \
libXcomposite1 \
libXcursor1 \
libXdamage1 \
libXtst6 \
libnss3 \
libxrandr2 \
libasound2 \
libpangocairo-1.0-0 \
libatk1.0-0 \
libcairo2 \
libpango1.0-0 \
libatk-bridge2.0-0 \
libxshmfence1 \
libgbm-dev \
libxshmfence-dev \
libgtk-3-0

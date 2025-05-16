# Dockerfile for Markdown to PDF Converter

# Use an official Node.js runtime as a parent image
# Using Node.js 18 LTS (Long Term Support) version based on Debian Bullseye
FROM node:18-bullseye-slim

# Set the working directory in the container
WORKDIR /usr/src/app

# Install necessary dependencies for Puppeteer and font handling
# libnss3: Network Security Services library, required by Chrome
# libatk1.0-0, libatk-bridge2.0-0, libcups2, libdrm2, libgbm1, libasound2: For headless Chrome
# libpangocairo-1.0-0, libx11-xcb1, libxcomposite1, libxdamage1, libxfixes3, libxrandr2, libxtst6: More X11/graphics libs
# ca-certificates, fonts-liberation, lsb-release, wget, xdg-utils: General utilities and fonts
# --no-install-recommends is used to reduce image size by not installing optional packages
RUN apt-get update && \
    apt-get install -y \
    libnss3 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libdrm2 \
    libgbm1 \
    libasound2 \
    libpangocairo-1.0-0 \
    libx11-xcb1 \
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    libxrandr2 \
    libxtst6 \
    ca-certificates \
    fonts-liberation \
    lsb-release \
    wget \
    xdg-utils \
    --no-install-recommends && \
    rm -rf /var/lib/apt/lists/*

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install project dependencies
# This uses the local .npmrc if present, for potential private registry config
RUN npm install --production --ignore-scripts

# Copy the rest of the application code
COPY src/ ./src/
COPY src/public/views/ ./views/
COPY src/public/css/ ./assets/css/
COPY src/public/js/ ./assets/js/
COPY src/public/fonts/ ./assets/fonts/
COPY README.md ./

# Create uploads and public directories if they are managed by the app
# Ensure these directories are writable by the Node.js process
RUN mkdir -p uploads public && chmod -R 777 uploads public

# Configurar las fuentes y emojis
COPY src/public/fonts/ ./assets/fonts/
RUN chmod +x ./assets/fonts/setup-fonts.sh && \
    ./assets/fonts/setup-fonts.sh

# Expose the port the app runs on
EXPOSE 3000

# Define the command to run the application
# This will use the "start" script from package.json
CMD [ "npm", "start" ]

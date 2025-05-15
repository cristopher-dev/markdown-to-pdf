#!/bin/bash
# Script to install Microsoft TrueType Core Fonts and other useful fonts
# Used in the Dockerfile for the Markdown to PDF converter

# Exit immediately if a command exits with a non-zero status.
set -e

echo ">>> Installing Microsoft TrueType Core Fonts..."
# Add contrib repository for msttcorefonts
if ! grep -q "contrib" /etc/apt/sources.list; then
  echo "deb http://deb.debian.org/debian/ bullseye contrib" >> /etc/apt/sources.list
  echo "deb-src http://deb.debian.org/debian/ bullseye contrib" >> /etc/apt/sources.list
  apt-get update
fi

# Accept EULA for msttcorefonts
echo "ttf-mscorefonts-installer msttcorefonts/accepted-mscorefonts-eula select true" | debconf-set-selections
apt-get install -y ttf-mscorefonts-installer --no-install-recommends

# Fallback for msttcorefonts if direct install fails (e.g., behind certain firewalls)
# This part is often problematic due to SourceForge download issues.
# Consider pre-downloading .deb if this consistently fails.
if ! dpkg -s ttf-mscorefonts-installer &> /dev/null; then 
    echo "ttf-mscorefonts-installer failed to install via apt. Attempting manual download and install.";
    # This is a common workaround, but the sourceforge links can be unreliable.
    # Ensure these are kept up to date or host them yourself if possible.
    apt-get install -y cabextract xfonts-utils --no-install-recommends
    wget http://ftp.de.debian.org/debian/pool/contrib/m/msttcorefonts/ttf-mscorefonts-installer_3.8_all.deb -P /tmp/
    dpkg -i /tmp/ttf-mscorefonts-installer_3.8_all.deb || apt-get -f install -y
    rm /tmp/ttf-mscorefonts-installer_3.8_all.deb
fi


echo ">>> Installing Noto Fonts for CJK and Emoji support..."
apt-get install -y fonts-noto-cjk fonts-noto-color-emoji --no-install-recommends

# Install other useful fonts (DejaVu, Liberation, Symbola)
# These are often good fallbacks and provide wide Unicode coverage.
echo ">>> Installing DejaVu, Liberation, and Symbola fonts..."
apt-get install -y fonts-dejavu fonts-liberation fonts-symbola --no-install-recommends

# Update font cache
echo ">>> Updating font cache..."
fc-cache -fv

echo ">>> Font setup complete."

# Fonts for Markdown to PDF Converter

This directory contains resources related to font setup for the Docker container used by the Markdown to PDF converter.

## `setup-fonts.sh`

This shell script is executed during the Docker image build process (`Dockerfile`). Its main purposes are:

1.  **Install Microsoft TrueType Core Fonts:**

    - Downloads and installs the `msttcorefonts` package, which includes common fonts like Arial, Times New Roman, Comic Sans MS, etc.
    - This helps improve compatibility and rendering fidelity for documents that might expect these fonts.

2.  **Install Noto Fonts for CJK and Emoji Support:**

    - Installs `fonts-noto-cjk` for better rendering of Chinese, Japanese, and Korean characters.
    - Installs `fonts-noto-color-emoji` for displaying color emojis in the generated PDFs.

3.  **Update Font Cache:**
    - Runs `fc-cache -fv` to rebuild the font cache, ensuring that the newly installed fonts are recognized by the system and applications like Puppeteer (via Chrome).

## `windows-fonts-readme.md`

This file provides specific instructions and considerations for users who might want to use or ensure compatibility with Windows-specific fonts beyond the core TrueType set. It might include:

- Information on how to legally obtain and install other Windows fonts in a Linux environment (if applicable).
- Notes on font substitution if certain Windows fonts are not available.

## Usage in Dockerfile

The `Dockerfile` copies this `Fonts` directory into the image and then executes `setup-fonts.sh` to perform the font installations.

```dockerfile
# ... (other Dockerfile commands)

# Configurar las fuentes y emojis
COPY Fonts/ /usr/src/app/Fonts/
RUN chmod +x /usr/src/app/Fonts/setup-fonts.sh && \
    /usr/src/app/Fonts/setup-fonts.sh

# ... (other Dockerfile commands)
```

By managing fonts this way, the Docker image becomes more self-contained and capable of rendering a wider variety of Markdown documents accurately.

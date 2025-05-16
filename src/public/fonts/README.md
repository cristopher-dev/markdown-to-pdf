<!--
This directory contains resources related to font setup for the Docker container
used by the Markdown to PDF converter.
-->

### `setup-fonts.sh`

This shell script is executed during the Docker image build process (`Dockerfile`). Its main purposes are:

1. **Install Microsoft TrueType Core Fonts:**

   - It runs `echo ttf-mscorefonts-installer msttcorefonts/accepted-mscorefonts-eula select true | debconf-set-selections` to automatically accept the EULA for Microsoft fonts.
   - Then, it installs `ttf-mscorefonts-installer` using `apt-get install -y`.
   - This helps improve compatibility and rendering fidelity for documents that might expect these fonts.

2. **Install Noto Color Emoji Font:**

   - It installs `fonts-noto-color-emoji` using `apt-get install -y`.
   - Installs `fonts-noto-color-emoji` for displaying color emojis in the generated PDFs.

3. **Clear Font Caches:**
   - Executes `fc-cache -f -v` to rebuild font information caches. This ensures that the newly installed fonts are recognized by the system and applications like Puppeteer.

### `windows-fonts-readme.md`

This file likely contains instructions or notes specifically about using or installing common Windows fonts (like Arial, Times New Roman, Calibri, etc.) within the Docker environment or for the conversion process. This might involve:

- Guidance on legally obtaining and copying these font files into the Docker image.
- Configuration steps if these fonts require special handling.
- Reasons why these specific fonts might be important for certain documents (e.g., corporate templates).

### Purpose of Managing Fonts in Docker

When Puppeteer (or any headless browser) generates a PDF from HTML, it needs access to the fonts referenced in the HTML/CSS. If the required fonts are not available in the Docker container where Puppeteer is running, it will fall back to default fonts, which can lead to:

- Incorrect text rendering (wrong font used).
- Layout issues (due to different font metrics).
- Missing characters (especially for special symbols or non-Latin scripts).
- Inconsistent appearance compared to viewing the HTML in a browser with those fonts installed locally.

By managing fonts this way, the Docker image becomes more self-contained and capable of rendering a wider variety of Markdown documents accurately.

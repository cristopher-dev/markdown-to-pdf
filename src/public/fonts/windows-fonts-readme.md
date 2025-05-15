# Using Windows Fonts with the Markdown to PDF Converter (Docker)

While the `setup-fonts.sh` script installs the Microsoft TrueType Core Fonts (Arial, Times New Roman, etc.) and Noto fonts for broad compatibility, you might have Markdown documents that specifically reference other Windows fonts (e.g., Calibri, Cambria, Consolas, Segoe UI).

## Legality and Licensing

**Important:** Microsoft fonts are proprietary. You must own a valid Windows license to use its fonts. Copying fonts from a Windows installation to a non-Windows system (like a Linux Docker container) is generally permissible if you own that Windows license and are using the fonts for your own purposes within the terms of that license. However, redistributing these fonts as part of a public Docker image or application is typically **not allowed**.

**This guide assumes you are setting this up for personal or internal use where you comply with Microsoft's licensing terms.**

## How to Add More Windows Fonts to Your Docker Image (For Personal Use)

If you need additional Windows fonts, you can customize your Docker setup:

1.  **Obtain Font Files:**

    - Copy the `.ttf` or `.otf` font files from a licensed Windows system. They are usually located in `C:\Windows\Fonts`.
    - Identify the specific fonts you need (e.g., `calibri.ttf`, `cambria.ttc`, `consola.ttf`, `segoeui.ttf`).

2.  **Create a Local Fonts Directory:**

    - In your project directory (e.g., alongside your `Dockerfile`), create a folder to store these fonts. For example, `my-windows-fonts`.
    - Place the copied `.ttf` / `.otf` files into this `my-windows-fonts` directory.

3.  **Modify Your Dockerfile:**

    - You'll need to copy these fonts into the Docker image and update the font cache.

    ```dockerfile
    # ... (existing Dockerfile content)

    # Create a directory for custom fonts in the image
    RUN mkdir -p /usr/local/share/fonts/windows

    # Copy your local Windows fonts into the image
    # Make sure 'my-windows-fonts' is in the same directory as your Dockerfile or adjust path
    COPY my-windows-fonts/ /usr/local/share/fonts/windows/

    # After all font copying, including the setup-fonts.sh script if you still use it,
    # ensure the font cache is rebuilt.
    # If setup-fonts.sh already runs fc-cache, this might be redundant or you can consolidate.
    RUN fc-cache -fv

    # ... (rest of your Dockerfile)
    ```

4.  **Rebuild Your Docker Image:**
    ```bash
    docker-compose build
    # or
    docker build -t your-image-name .
    ```

## Using the Fonts in Markdown/CSS

Once the fonts are installed in the Docker image and the font cache is updated, Puppeteer (via Chrome headless) should be able to find and use them if they are referenced in your Markdown's CSS (either through `<style>` tags or an external CSS file).

For example, in your custom CSS:

```css
body {
  font-family: 'Segoe UI', Arial, sans-serif;
}

code,
pre {
  font-family: 'Consolas', 'Liberation Mono', monospace;
}
```

## Considerations:

- **Image Size:** Adding many fonts will increase the size of your Docker image.
- **Font Fallbacks:** Always define fallback fonts in your CSS (e.g., `font-family: "Calibri", sans-serif;`). If the primary font isn't found, the browser will try the next one.
- **Testing:** After rebuilding the image, thoroughly test PDF conversion with documents that use these specific fonts to ensure they are rendering correctly.
- **Legal Compliance:** Reiterate that you must ensure you are complying with font licensing terms.

This approach allows you to extend the font capabilities of your Markdown to PDF converter for specific needs while being mindful of licensing.

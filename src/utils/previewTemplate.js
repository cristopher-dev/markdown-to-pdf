// filepath: /home/markdown-to-pdf/previewTemplate.js
const path = require('path');

/**
 * Generates an HTML template for document preview
 * @param {string} fileName - Document file name
 * @param {string} htmlContent - Document's HTML content
 * @param {Object} options - Additional options
 * @param {boolean} options.colorBlindFriendly - Enable color blind friendly styles
 * @returns {string} - Complete HTML
 */
function generatePreviewTemplate(fileName, htmlContent, options = {}) {
  const {
    colorBlindFriendly = false, // Color-blind friendly could still be relevant if you have -cb styles for the base theme
  } = options;

  // The path to the highlight theme CSS should now be relative to this file's location
  // or, even better, a publicly accessible path if the preview is served.
  const customStylesWebPath = '/css/custom-styles.css'; // Maintain custom styles

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Preview: ${fileName}</title>
      <!-- Use web paths for CSS -->
      <link rel="stylesheet" href="${customStylesWebPath}">
      <style>
        body { font-family: sans-serif; margin: 20px; background-color: #f9f9f9; color: #333; }
        .container { background-color: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .preview-header { margin-bottom: 20px; padding-bottom: 10px; border-bottom: 1px solid #eee; }
        .preview-header h1 { font-size: 1.5em; margin: 0; }
        .preview-header p { font-size: 0.9em; color: #777; margin-top: 5px; }
        .controls { margin-bottom:20px; padding:10px; background-color:#f0f0f0; border-radius:5px; }
        .controls a { margin-right: 10px; text-decoration:none; color: #007bff; }
        .controls a:hover { text-decoration:underline; }
        /* Additional styles for markdown-body content if needed */
        .markdown-body {
          /* Base styles that might be in custom-styles.css or here */
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="preview-header">
          <h1>Preview: ${fileName}</h1>
          <p>This is a preview of the generated HTML. The PDF version might differ slightly in layout and pagination.</p>
        </div>
        <div class="controls">
          <!-- We assume PDF and HTML files are in the 'public' directory at the root -->
          <a href="/public/${encodeURIComponent(path.basename(fileName, path.extname(fileName)))}.pdf" target="_blank">View PDF</a>
          <a href="/public/${encodeURIComponent(path.basename(fileName, path.extname(fileName)))}.html" target="_blank">View Raw HTML</a>
        </div>
        <div class="markdown-body">
          ${htmlContent}
        </div>
      </div>
    </body>
    </html>
  `;
}

module.exports = { generatePreviewTemplate };

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
    colorBlindFriendly = false, // Esto podría seguir siendo relevante si tienes estilos -cb para el tema base
  } = options;

  // La ruta al CSS del tema de resaltado ahora debe ser relativa a la ubicación de este archivo
  // o, mejor aún, una ruta accesible públicamente si el preview se sirve.
  const customStylesWebPath = '/css/custom-styles.css'; // Mantener estilos personalizados

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Preview: ${fileName}</title>
      <!-- Usar rutas web para los CSS -->
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
        /* Estilos adicionales para el contenido de markdown-body si es necesario */
        .markdown-body {
          /* Estilos base que podrían estar en custom-styles.css o aquí */
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
          <!-- Asumimos que los archivos PDF y HTML están en el directorio 'public' en la raíz -->
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

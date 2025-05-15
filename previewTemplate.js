/**
 * Genera una plantilla HTML para previsualizar documentos
 * @param {string} title - Título del documento
 * @param {string} htmlContent - Contenido HTML del documento
 * @param {Object} options - Opciones adicionales
 * @param {string} options.codeTheme - Tema de resaltado de código (ej. 'github', 'atom-one-dark')
 * @param {boolean} options.colorBlindFriendly - Activar estilos adaptados para daltonismo
 * @returns {string} - HTML completo
 */
function generatePreviewTemplate(title, htmlContent, options = {}) {
  const codeTheme = options.codeTheme || 'github';
  const colorBlindFriendly = options.colorBlindFriendly || false;
  const colorBlindStyles = colorBlindFriendly ? '<link rel="stylesheet" href="/css/color-blind-friendly.css">' : '';

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Vista Previa: ${title}</title>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/github-markdown-css/5.2.0/github-markdown.min.css">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/${codeTheme}.min.css">
  ${colorBlindStyles}
  <style>
    body {
      box-sizing: border-box;
      min-width: 200px;
      max-width: 980px;
      margin: 0 auto;
      padding: 45px;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }
    .markdown-body {
      background-color: white;
      padding: 20px;
      border: 1px solid #ddd;
      border-radius: 5px;
    }
    @media (max-width: 767px) {
      body {
        padding: 15px;
      }
      .markdown-body {
        padding: 15px;
      }
    }
    /* Estilos adicionales para la previsualización si son necesarios */
  </style>
</head>
<body class="${colorBlindFriendly ? 'color-blind-mode' : ''}">
  <div class="markdown-body">
    ${htmlContent}
  </div>
</body>
</html>`;
}

module.exports = { generatePreviewTemplate };

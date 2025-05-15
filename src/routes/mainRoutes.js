// src/routes/mainRoutes.js
const express = require('express');
const fs = require('fs');
const path = require('path');
const MarkdownIt = require('markdown-it');
const mdFootnote = require('markdown-it-footnote');
const hljs = require('highlight.js');
const { convertMarkdownToPDF } = require('../services/conversionService'); // Importar el servicio de conversión

// Inicializar MarkdownIt con plugins y opciones de resaltado
const md = new MarkdownIt({
  html: true,        // Habilitar etiquetas HTML en el origen
  linkify: true,     // Convertir automáticamente texto similar a URL en enlaces
  typographer: true, // Habilitar algunos reemplazos neutrales al idioma + embellecimiento de comillas
  highlight: function (str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return '<pre class="hljs"><code>' +
               hljs.highlight(str, { language: lang, ignoreIllegals: true }).value +
               '</code></pre>';
      } catch (__) {}
    }
    return '<pre class="hljs"><code>' + md.utils.escapeHtml(str) + '</code></pre>'; // Fallback
  }
}).use(mdFootnote);

module.exports = (PUBLIC_DIR_FOR_UPLOADS) => {
  const router = express.Router();

  // Main route - sirve el index.html desde src/public/views/
  router.get('/', (req, res) => {
    // __dirname aquí es /home/markdown-to-pdf/src/routes
    res.sendFile(path.join(__dirname, '..', 'public', 'views', 'index.html'));
  });

  // Ruta para listar archivos en el directorio public (el de la raíz del proyecto)
  router.get('/list-files', (req, res) => {
    fs.readdir(PUBLIC_DIR_FOR_UPLOADS, (err, files) => {
      if (err) {
        console.error('Error reading public directory:', err);
        return res.status(500).json({ success: false, error: 'Error listing files.' });
      }
      const filteredFiles = files.filter(
        (file) => file.toLowerCase().endsWith('.pdf') || file.toLowerCase().endsWith('.html')
      );
      res.json({ success: true, files: filteredFiles });
    });
  });
  
  // Ruta para obtener detalles de los archivos en public (el de la raíz del proyecto)
  router.get('/public-files', (req, res, next) => {
    try {
      const files = fs.readdirSync(PUBLIC_DIR_FOR_UPLOADS);
      const fileDetails = files
        .filter((file) => file.endsWith('.html') || file.endsWith('.pdf'))
        .map((file) => {
          const filePath = path.join(PUBLIC_DIR_FOR_UPLOADS, file);
          const stat = fs.statSync(filePath);
          return {
            name: file,
            type: path.extname(file).substring(1),
            size: stat.size,
            lastModified: stat.mtime,
          };
        })
        .sort((a, b) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime());

      res.json({ success: true, files: fileDetails });
    } catch (error) {
      next(error);
    }
  });

  // Ruta para el ejemplo
  router.get('/example', async (req, res, next) => { // Convertir a async function
    const exampleMdFilename = "example.md";
    const exampleHtmlFilename = "example.html";
    const examplePdfFilename = "example.pdf"; // Nombre para el archivo PDF
    const exampleMdPath = path.join(PUBLIC_DIR_FOR_UPLOADS, exampleMdFilename);
    const exampleHtmlPath = path.join(PUBLIC_DIR_FOR_UPLOADS, exampleHtmlFilename);
    const examplePdfPath = path.join(PUBLIC_DIR_FOR_UPLOADS, examplePdfFilename); // Ruta para el archivo PDF

    try {
      // 1. Asegurar que example.md exista
      if (!fs.existsSync(exampleMdPath)) {
        const defaultContent = "# Ejemplo de Markdown\n\nEste es un archivo de ejemplo para la funcionalidad de vista previa.\n\n## Características\n\n*   Listas\n*   **Negrita**\n*   *Cursiva*\n\n[Visita Google](https://www.google.com)\n\n## Bloque de código\n\n```javascript\nfunction greet(name) {\n  console.log('Hello, ' + name + '!');\n}\ngreet('World');\n```\n";
        fs.writeFileSync(exampleMdPath, defaultContent, 'utf8');
        console.log(`Archivo '${exampleMdFilename}' creado en '${PUBLIC_DIR_FOR_UPLOADS}'`);
      }

      // 2. Leer example.md
      const markdownContent = fs.readFileSync(exampleMdPath, 'utf8');

      // 3. Convertir Markdown a HTML
      const htmlBodyContent = md.render(markdownContent);

      // 4. Crear el contenido HTML completo
      // Se asume que tienes CSS en /assets/css/ para estilos generales y de highlight.js
      const fullHtml = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Vista Previa de Markdown - Ejemplo</title>
    <link rel="stylesheet" href="/assets/css/style.css"> 
    <link rel="stylesheet" href="/assets/css/custom-styles.css">
    <!-- Si tienes un CSS específico para highlight.js, añádelo aquí, ej: -->
    <!-- <link rel="stylesheet" href="/assets/css/highlight-theme.css"> -->
</head>
<body>
    <div class="markdown-body container"> <!-- 'markdown-body' es común para estilos de GitHub Flavored Markdown -->
        ${htmlBodyContent}
    </div>
</body>
</html>
      `;

      // 5. Escribir example.html
      fs.writeFileSync(exampleHtmlPath, fullHtml, 'utf8');
      console.log(`Archivo '${exampleHtmlFilename}' creado/actualizado en '${PUBLIC_DIR_FOR_UPLOADS}'`);

      // 6. Convertir example.md a PDF
      const customStylesPath = path.join(__dirname, '..', 'public', 'css', 'custom-styles.css');
      const conversionOptions = { // Opciones básicas para el PDF de ejemplo
        pageSize: 'A4',
        codeTheme: 'github', // O el tema por defecto que prefieras
        // Puedes añadir más opciones si es necesario
      };
      
      // El outputBaseName no debe incluir la extensión .pdf, el servicio la añade.
      const outputBaseNameForPdf = path.join(PUBLIC_DIR_FOR_UPLOADS, path.basename(exampleMdFilename, '.md'));

      await convertMarkdownToPDF(
        markdownContent,
        outputBaseNameForPdf, // ej: /path/to/public/example (sin .pdf)
        customStylesPath,
        conversionOptions
      );
      console.log(`Archivo '${examplePdfFilename}' creado/actualizado en '${PUBLIC_DIR_FOR_UPLOADS}'`);

      // 7. Responder JSON
      res.json({
        success: true,
        markdownFile: exampleMdFilename,
        htmlFile: exampleHtmlFilename,
        pdfFile: examplePdfFilename, // Añadir el nombre del archivo PDF a la respuesta
        message: `Archivos de ejemplo '${exampleMdFilename}', '${exampleHtmlFilename}' y '${examplePdfFilename}' asegurados y listos.`
      });

    } catch (error) {
      console.error(`Error al procesar la ruta /example:`, error);
      next(error); 
    }
  });

  return router;
};

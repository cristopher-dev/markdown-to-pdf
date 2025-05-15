const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const markdownIt = require('markdown-it');
const hljs = require('highlight.js');

// Configurar markdown-it con soporte para resaltado de sintaxis
const md = markdownIt({
  html: true,
  xhtmlOut: true,
  breaks: true,
  linkify: true,
  typographer: true,
  highlight: function(str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(str, { language: lang }).value;
      } catch (__) {}
    }
    return ''; // usar resaltado externo
  }
});

/**
 * Convierte un archivo Markdown a PDF
 * @param {string} markdownContent - Contenido del archivo Markdown
 * @param {string} outputBaseName - Nombre base para los archivos de salida (sin extensión)
 * @param {string} customStylesPath - Ruta al archivo CSS de estilos personalizados
 * @param {Object} options - Opciones adicionales para la conversión
 * @param {string} options.pageSize - Tamaño de página (A4, Letter, Legal)
 * @param {string} options.codeTheme - Tema de resaltado de código
 * @param {boolean} options.colorBlindFriendly - Activar estilos adaptados para daltonismo
 * @param {string} options.orientation - Orientación de la página (portrait, landscape)
 * @param {string} options.marginTop - Margen superior
 * @param {string} options.marginBottom - Margen inferior
 * @param {string} options.marginLeft - Margen izquierdo
 * @param {string} options.marginRight - Margen derecho
 * @param {string} options.customCSS - CSS personalizado
 * @param {string} options.headerTemplate - Plantilla para el encabezado
 * @param {string} options.footerTemplate - Plantilla para el pie de página
 * @returns {Promise<{html: string, pdf: string}>} - Rutas a los archivos generados
 */
async function convertMarkdownToPDF(markdownContent, outputBaseName = 'output', customStylesPath = 'css/custom-styles.css', options = {}) {
  try {
    // Validar el contenido del markdown
    if (!markdownContent || typeof markdownContent !== 'string') {
      throw new Error('El contenido Markdown es requerido y debe ser un texto válido');
    }
    // Opciones por defecto y recibidas
    const pageSize = options.pageSize || 'A4';
    const codeTheme = options.codeTheme || 'github';
    const colorBlindFriendly = options.colorBlindFriendly || false;
    const orientation = options.orientation || 'portrait';
    const marginTop = options.marginTop || '20mm';
    const marginBottom = options.marginBottom || '20mm';
    const marginLeft = options.marginLeft || '20mm';
    const marginRight = options.marginRight || '20mm';
    const customCSS = options.customCSS || '';
    const headerTemplate = options.headerTemplate || '<div></div>';
    const footerTemplate = options.footerTemplate || '<div style="font-size: 8px; width: 100%; text-align: center;"><span class="pageNumber"></span> / <span class="totalPages"></span></div>';

    // Convertir el Markdown a HTML
    const htmlContent = md.render(markdownContent);
    
    // Obtener estilos personalizados
    let customStyles = '';
    try {
      if (fs.existsSync(customStylesPath)) {
        customStyles = fs.readFileSync(customStylesPath, 'utf8');
      }
      
      // Si se activa la opción de adaptación para daltónicos, cargar estilos adicionales
      if (colorBlindFriendly && fs.existsSync(path.join(__dirname, 'css', 'color-blind-friendly.css'))) {
        const colorBlindStyles = fs.readFileSync(path.join(__dirname, 'css', 'color-blind-friendly.css'), 'utf8');
        customStyles = colorBlindStyles + '\n' + customStyles; // Priorizar estilos para daltónicos
      }
    } catch (error) {
      console.warn(`No se pudieron cargar los estilos personalizados: ${error.message}`);
    }
    // Crear un HTML completo con estilos
    const fullHtml = `<!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Documento convertido</title>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/github-markdown-css/5.2.0/github-markdown.min.css">
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/${codeTheme}.min.css">
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
        }
        @media (max-width: 767px) {
          body {
            padding: 15px;
          }
        }
        @page {
          margin: 1cm; /* Margen general de la página, se puede sobreescribir abajo */
          size: ${pageSize} ${orientation === 'landscape' ? 'landscape' : ''};
        }
        ${customStyles}
        ${customCSS} /* Aplicar CSS personalizado del usuario */
      </style>
    </head>
    <body>
      <div class="markdown-body">
        ${htmlContent}
      </div>
    </body>
    </html>`;
    
    // Determinar las rutas de salida
    const htmlPath = `${outputBaseName}.html`;
    const pdfPath = `${outputBaseName}.pdf`;
    
    // Guardar el HTML para referencia
    fs.writeFileSync(htmlPath, fullHtml);
    
    // Lanzar Puppeteer y generar PDF
    const browser = await puppeteer.launch({ 
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'] 
    });
    const page = await browser.newPage();
    await page.setContent(fullHtml, { waitUntil: 'networkidle0' });
    // Configurar el formato del PDF
    await page.pdf({
      path: pdfPath,
      format: pageSize,
      landscape: orientation === 'landscape',
      printBackground: true,
      margin: {
        top: marginTop,
        right: marginRight,
        bottom: marginBottom,
        left: marginLeft
      },
      displayHeaderFooter: !!(headerTemplate || footerTemplate),
      headerTemplate: headerTemplate,
      footerTemplate: footerTemplate,
    });
    
    await browser.close();
    console.log(`✅ El PDF se ha generado correctamente como "${pdfPath}"`);
    
    return {
      html: htmlPath,
      pdf: pdfPath
    };
    
  } catch (error) {
    console.error('❌ Error durante la conversión:', error);
    throw error;
  }
}

// Si se ejecuta directamente (no como módulo)
if (require.main === module) {
  (async () => {
    try {
      // Leer el archivo Markdown predeterminado
      const markdownContent = fs.readFileSync('text.md', 'utf8');
      await convertMarkdownToPDF(markdownContent);
    } catch (error) {
      console.error('❌ Error al ejecutar la conversión:', error);
    }
  })();
}

module.exports = { convertMarkdownToPDF };

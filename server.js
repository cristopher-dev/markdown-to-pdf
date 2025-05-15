const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { convertMarkdownToPDF } = require('./convert');
const { generatePreviewTemplate } = require('./previewTemplate');

const app = express();
const PORT = process.env.PORT || 3000;

// --- Configuración de Middlewares ---
app.use(express.static(__dirname)); // Servir archivos estáticos desde el directorio actual
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use('/public', express.static(path.join(__dirname, 'public'))); // Servir archivos generados

// --- Nueva ruta para listar archivos en public/ ---
app.get('/list-files', (req, res) => {
  fs.readdir(PUBLIC_DIR, (err, files) => {
    if (err) {
      console.error('Error al leer el directorio public:', err);
      return res.status(500).json({ success: false, error: 'Error al listar archivos.' });
    }
    // Filtrar para excluir archivos o directorios no deseados si es necesario
    const pdfFiles = files.filter(file => file.toLowerCase().endsWith('.pdf') || file.toLowerCase().endsWith('.html'));
    res.json({ success: true, files: pdfFiles });
  });
});

// --- Configuración de Multer ---
const UPLOADS_DIR = path.join(__dirname, 'uploads');
const PUBLIC_DIR = path.join(__dirname, 'public');

// Crear directorios necesarios si no existen
[UPLOADS_DIR, PUBLIC_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => cb(null, file.originalname) // Conservar nombre original
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['text/markdown', '.md'];
  if (allowedTypes.includes(file.mimetype) || allowedTypes.includes(path.extname(file.originalname).toLowerCase())) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten archivos Markdown (.md)'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // Límite de 5MB
});

// --- Rutas ---

// Ruta principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Ruta para procesar archivo de ejemplo (README.md)
app.get('/example', async (req, res, next) => {
  try {
    const readmePath = path.join(__dirname, 'README.md');
    if (!fs.existsSync(readmePath)) {
      return res.status(404).json({ success: false, error: 'Archivo README.md no encontrado.' });
    }

    const markdownContent = fs.readFileSync(readmePath, 'utf8');
    const outputBaseName = path.join('public', 'README');
    const colorBlindMode = req.query.colorBlindFriendly === 'true';
    const codeTheme = req.query.codeTheme || 'github'; // Obtener tema de código de la query

    const conversionOptions = {
      pageSize: 'A4', // O el tamaño que prefieras por defecto para el ejemplo
      codeTheme: codeTheme,
      colorBlindFriendly: colorBlindMode
    };

    const results = await convertMarkdownToPDF(markdownContent, outputBaseName, 'css/custom-styles.css', conversionOptions);

    // Leer el HTML generado por Puppeteer (que ya tiene los estilos básicos)
    const rawHtmlContent = fs.readFileSync(results.html, 'utf8');

    // Generar la plantilla de previsualización mejorada
    const previewContent = generatePreviewTemplate('README.md', rawHtmlContent, {
      codeTheme: codeTheme,
      colorBlindFriendly: colorBlindMode
    });

    fs.writeFileSync(results.html, previewContent); // Sobrescribir el HTML con la versión de previsualización

    res.json({
      success: true,
      filename: 'README.md',
      html: results.html, // Ruta al HTML mejorado
      pdf: results.pdf
    });
  } catch (error) {
    next(error); // Pasar el error al middleware de manejo de errores
  }
});

// Ruta para convertir archivos Markdown subidos por el usuario
app.post('/convert', upload.single('markdown-file'), async (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({ success: false, error: 'No se subió ningún archivo.' });
  }

  try {
    const filePath = req.file.path;
    const fileName = req.file.originalname;
    const baseName = path.basename(fileName, path.extname(fileName));
    const outputBaseName = path.join(PUBLIC_DIR, baseName); // Usar PUBLIC_DIR

    const markdownContent = fs.readFileSync(filePath, 'utf8');

    const conversionOptions = {
      pageSize: req.body.pageSize || 'A4',
      codeTheme: req.body.codeTheme || 'github',
      colorBlindFriendly: req.body.colorBlindFriendly === 'true' || false,
      orientation: req.body.orientation || 'portrait',
      marginTop: req.body.marginTop,
      marginBottom: req.body.marginBottom,
      marginLeft: req.body.marginLeft,
      marginRight: req.body.marginRight,
      customCSS: req.body.customCSS,
      headerTemplate: req.body.headerTemplate,
      footerTemplate: req.body.footerTemplate
    };

    const results = await convertMarkdownToPDF(markdownContent, outputBaseName, 'css/custom-styles.css', conversionOptions);

    // Leer el HTML generado por Puppeteer
    const rawHtmlContent = fs.readFileSync(results.html, 'utf8');

    // Generar la plantilla de previsualización mejorada
    const previewContent = generatePreviewTemplate(fileName, rawHtmlContent, {
      codeTheme: conversionOptions.codeTheme,
      colorBlindFriendly: conversionOptions.colorBlindFriendly
    });

    fs.writeFileSync(results.html, previewContent); // Sobrescribir el HTML

    // Limpiar el archivo subido después de la conversión
    fs.unlink(filePath, (err) => {
      if (err) console.error(`Error al eliminar el archivo temporal: ${filePath}`, err);
    });

    res.json({
      success: true,
      filename: fileName,
      html: results.html, // Ruta al HTML mejorado
      pdf: results.pdf
    });
  } catch (error) {
    // Si hay un error, intentar eliminar el archivo temporal si existe
    if (req.file && req.file.path && fs.existsSync(req.file.path)) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error(`Error al eliminar el archivo temporal tras un error de conversión: ${req.file.path}`, err);
      });
    }
    next(error);
  }
});

// Ruta para eliminar archivos generados (HTML y PDF)
app.delete('/delete-files/:basename', (req, res, next) => {
  try {
    const basename = req.params.basename;
    if (!basename || typeof basename !== 'string' || basename.includes('..')) {
      return res.status(400).json({ success: false, error: 'Nombre de archivo inválido.' });
    }

    const htmlPath = path.join(PUBLIC_DIR, `${basename}.html`);
    const pdfPath = path.join(PUBLIC_DIR, `${basename}.pdf`);
    let deletedFiles = [];
    let errors = [];

    [htmlPath, pdfPath].forEach(filePath => {
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
          deletedFiles.push(path.basename(filePath));
        } catch (err) {
          errors.push(`Error al eliminar ${path.basename(filePath)}: ${err.message}`);
        }
      }
    });

    if (errors.length > 0) {
      return res.status(500).json({ success: false, error: errors.join('; ') });
    }
    if (deletedFiles.length === 0) {
      return res.status(404).json({ success: false, error: 'No se encontraron archivos para eliminar.' });
    }
    res.json({ success: true, message: `Archivos eliminados: ${deletedFiles.join(', ')}` });
  } catch (error) {
    next(error);
  }
});

// Ruta para obtener la lista de archivos en el directorio public
app.get('/public-files', (req, res, next) => {
  try {
    const files = fs.readdirSync(PUBLIC_DIR);
    const fileDetails = files
      .filter(file => file.endsWith('.html') || file.endsWith('.pdf'))
      .map(file => {
        const filePath = path.join(PUBLIC_DIR, file);
        const stat = fs.statSync(filePath);
        return {
          name: file,
          type: path.extname(file).substring(1),
          size: stat.size,
          lastModified: stat.mtime
        };
      })
      .sort((a, b) => b.lastModified - a.lastModified); // Ordenar por fecha de modificación descendente

    res.json({ success: true, files: fileDetails });
  } catch (error) {
    next(error);
  }
});

// --- Middleware de Manejo de Errores ---
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Error interno del servidor.'
  });
});

// --- Iniciar Servidor ---
app.listen(PORT, () => {
  console.log(`Servidor iniciado en http://localhost:${PORT}`);
  console.log('Abre tu navegador y visita la URL anterior.');
});

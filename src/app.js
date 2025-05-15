// src/app.js
const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const conversionRoutes = require('./routes/conversionRoutes');
const mainRoutes = require('./routes/mainRoutes'); // Crearemos este para la ruta principal y otras generales
const errorHandler = require('./middlewares/errorHandler');

const app = express();

// --- Middleware Configuration ---
// Servir archivos estáticos desde el nuevo directorio 'src/public' bajo el prefijo '/assets'
app.use('/assets', express.static(path.join(__dirname, 'public')));

// Servir archivos estáticos desde el directorio 'public' en la raíz del proyecto bajo el prefijo '/public'
app.use('/public', express.static(path.join(__dirname, '..', 'public')));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Add custom headers to all responses
app.use((req, res, next) => {
  res.setHeader('X-Powered-By', 'Markdown-to-PDF by Cristopher Martinez');
  res.setHeader('X-Author', 'Cristopher Martinez');
  res.setHeader('X-Author-Website', 'https://github.com/cristopher-dev');
  next();
});

// --- Multer Configuration (similar a tu server.js original pero con rutas ajustadas) ---
const UPLOADS_DIR = path.join(__dirname, '..', 'uploads'); // Sube un nivel para llegar a la raíz del proyecto
const CONVERTED_PDF_DIR = path.join(__dirname, '..', 'public'); // Directorio público en la raíz para archivos generados

// Crear directorios necesarios si no existen
[UPLOADS_DIR, CONVERTED_PDF_DIR].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => cb(null, file.originalname),
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['text/markdown', '.md'];
  if (
    allowedTypes.includes(file.mimetype) ||
    allowedTypes.includes(path.extname(file.originalname).toLowerCase())
  ) {
    cb(null, true);
  } else {
    cb(new Error('Only Markdown (.md) files are allowed'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

// Pasar 'upload' y 'CONVERTED_PDF_DIR' a las rutas de conversión
app.use('/api/convert', conversionRoutes(upload, CONVERTED_PDF_DIR)); // Prefijo para rutas de API
app.use('/', mainRoutes(CONVERTED_PDF_DIR)); // Rutas principales como '/' y '/list-files'

// --- Error Handling Middleware ---
app.use(errorHandler);

module.exports = app;

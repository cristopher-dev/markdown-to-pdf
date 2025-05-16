// src/app.js
const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const conversionRoutes = require('./routes/conversionRoutes');
const mainRoutes = require('./routes/mainRoutes'); // We'll create this for the main route and other general ones
const errorHandler = require('./middlewares/errorHandler');

const app = express();

// --- Middleware Configuration ---
// Serve static files from the new directory 'src/public' under the prefix '/assets'
app.use('/assets', express.static(path.join(__dirname, 'public')));

// Serve static files from the 'public' directory at the project root under the '/public' prefix
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

// --- Multer Configuration (similar to your original server.js but with adjusted paths) ---
const UPLOADS_DIR = path.join(__dirname, '..', 'uploads'); // Go up one level to reach the project root
const CONVERTED_PDF_DIR = path.join(__dirname, '..', 'public'); // Public directory at the root for generated files

// Create necessary directories if they don't exist
[UPLOADS_DIR, CONVERTED_PDF_DIR].forEach(dir => {
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

// Pass 'upload' and 'CONVERTED_PDF_DIR' to conversion routes
app.use('/api/convert', conversionRoutes(upload, CONVERTED_PDF_DIR)); // Prefix for API routes
app.use('/', mainRoutes(CONVERTED_PDF_DIR)); // Main routes like '/' and '/list-files'

// --- Error Handling Middleware ---
app.use(errorHandler);

module.exports = app;

// src/routes/conversionRoutes.js
const express = require('express');
const {
  handleConversion,
  handleExampleConversion,
  handleDeleteFiles,
} = require('../controllers/conversionController');

// Esta función router factory toma 'upload' y 'PUBLIC_DIR_FOR_UPLOADS' como dependencias
module.exports = (upload, PUBLIC_DIR_FOR_UPLOADS) => {
  const router = express.Router();

  // La ruta base ya es /api/convert (definida en app.js)
  router.post('/', upload.single('markdown-file'), handleConversion(PUBLIC_DIR_FOR_UPLOADS));
  router.get('/example', handleExampleConversion(PUBLIC_DIR_FOR_UPLOADS));
  router.delete('/delete/:basename', handleDeleteFiles(PUBLIC_DIR_FOR_UPLOADS)); // Cambiado para ser más RESTful

  return router;
};

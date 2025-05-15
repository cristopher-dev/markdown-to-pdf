const app = require('./app'); // Importar la aplicación configurada desde app.js
const PORT = process.env.PORT || 3000;

// --- Start Server ---
app.listen(PORT, () => {
  console.log(`
  ┌──────────────────────────────────────────┐
  │                                          │
  │  Markdown to PDF Converter                │
  │  Developed by: Cristopher Martinez        │
  │  https://github.com/cristopher-dev        │
  │                                          │
  │  Server running at: http://localhost:${PORT}  │
  │                                          │
  └──────────────────────────────────────────┘
  `);
  console.log('Open your browser and visit the URL above.');
});

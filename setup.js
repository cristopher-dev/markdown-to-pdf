const fs = require('fs');
const path = require('path');

// Carpetas necesarias para el proyecto
const directories = [
  'uploads',
  'public'
];

// Crear directorios si no existen
directories.forEach(dir => {
  const dirPath = path.join(__dirname, dir);
  if (!fs.existsSync(dirPath)) {
    console.log(`Creando directorio: ${dir}`);
    fs.mkdirSync(dirPath, { recursive: true });
  } else {
    console.log(`El directorio ya existe: ${dir}`);
  }
});

console.log('Configuración completada.');

/**
 * environment.js - Script para detectar el entorno de ejecución y ajustar el comportamiento
 * 
 * Este script detecta si la aplicación está ejecutándose en:
 * 1. Entorno de desarrollo (localhost)
 * 2. GitHub Pages u otro entorno estático
 * 
 * Autor: Cristopher Martinez
 */

(function() {
  // Detectar si estamos en un entorno estático (GitHub Pages u otro hosting estático)
  window.appEnvironment = {
    isStaticHosting: function() {
      return window.location.hostname.includes('github.io') || 
             window.location.hostname.includes('cristopher-dev.com') ||
             !window.location.hostname.includes('localhost');
    },
    
    // Ruta base para cargar archivos estáticos
    getBasePath: function() {
      return this.isStaticHosting() ? '' : '';
    },
    
    // Función para cargar archivos Markdown estáticos en entornos GitHub Pages
    loadStaticMarkdown: async function(filename) {
      try {
        const response = await fetch(filename);
        if (!response.ok) {
          throw new Error(`No se pudo cargar el archivo ${filename}`);
        }
        return await response.text();
      } catch (error) {
        console.error('Error cargando el archivo Markdown:', error);
        throw error;
      }
    },
    
    // Función para simular la conversión de Markdown a HTML en el cliente
    renderMarkdownToHtml: function(markdownContent) {
      if (window.markdownit) {
        const md = window.markdownit({
          html: true,
          linkify: true,
          typographer: true,
          highlight: function(str, lang) {
            if (window.hljs && lang && window.hljs.getLanguage(lang)) {
              try {
                return window.hljs.highlight(str, { language: lang }).value;
              } catch (__) {}
            }
            return ''; // usar escape por defecto
          }
        });
        
        return md.render(markdownContent);
      } else {
        console.warn('markdown-it no está disponible. No se puede renderizar Markdown.');
        return '<div class="alert alert-warning">No se pudo procesar el Markdown. La biblioteca markdown-it no está disponible.</div>';
      }
    },
    
    // Crear un link para descargar contenido como archivo
    createDownloadLink: function(content, fileName, contentType) {
      const blob = new Blob([content], { type: contentType });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      a.textContent = `Descargar ${fileName}`;
      a.className = 'btn btn-primary';
      
      // Liberar el objeto URL cuando ya no sea necesario
      setTimeout(() => URL.revokeObjectURL(url), 60000);
      
      return a;
    },
    
    // Verificar si una ruta de archivo está disponible
    checkFileExists: async function(url) {
      try {
        const response = await fetch(url, { method: 'HEAD' });
        return response.ok;
      } catch (error) {
        console.error(`Error comprobando si existe el archivo ${url}:`, error);
        return false;
      }
    }
  };
  
  console.log(`App ejecutándose en entorno ${window.appEnvironment.isStaticHosting() ? 'estático (GitHub Pages)' : 'servidor dinámico'}`);
})();

// Load highlight.js for code highlighting
document.addEventListener('DOMContentLoaded', () => {
  if (typeof hljs !== 'undefined') {
  } else {
    console.warn('Highlight.js is not defined. Code highlighting will not work.');
  }
});

// Show example file
document.getElementById('show-example')?.addEventListener('click', async function() {
  const loadingEl = document.getElementById('loading');
  if (loadingEl) {
    loadingEl.classList.remove('d-none');
    loadingEl.classList.add('d-flex');
  }
  try {
    const colorBlindMode = document.body.classList.contains('color-blind-mode');
    
    // Verificar si estamos en un entorno de GitHub Pages
    const isGitHubPages = window.location.hostname.includes('github.io') || 
                         window.location.hostname.includes('cristopher-dev.com');
                         
    let result;
    
    if (isGitHubPages) {
      // En GitHub Pages, cargamos el README.md estático desde el repositorio
      try {
        const readmeResponse = await fetch('README.md');
        if (!readmeResponse.ok) {
          throw new Error(`No se pudo cargar el README.md (Status: ${readmeResponse.status})`);
        }
        
        const readmeContent = await readmeResponse.text();
        
        // Mostrar el README como ejemplo
        // Aquí podríamos usar una librería cliente de markdown para la conversión
        // Por ejemplo, usando markdown-it si está disponible en el cliente
        
        // Para esta solución, simplemente simulamos un resultado exitoso
        result = {
          success: true,
          filename: 'README.md',
          html: 'public/README.html',
          pdf: 'public/README.pdf'
        };
        
        // Si tenemos markdown-it cargado en el cliente, podríamos convertir y mostrar el markdown
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
              return ''; // use external default escaping
            }
          });
          
          // Podríamos mostrar esto en un modal o en una sección de vista previa
          const htmlContent = md.render(readmeContent);
          
          // Actualizar elemento en la página si existe
          const previewContainer = document.getElementById('markdown-preview');
          if (previewContainer) {
            previewContainer.innerHTML = htmlContent;
            previewContainer.classList.remove('d-none');
          }
        }
        
      } catch (readmeError) {
        throw new Error(`Error al cargar el ejemplo: ${readmeError.message}`);
      }
    } else {
      // En entorno local/servidor, usa la API normal
      const response = await fetch(`/example?colorBlindFriendly=${colorBlindMode}`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || `Could not load example (Status: ${response.status})`);
      }
      
      // The server should now return the filename in the JSON response
      result = await response.json();
    }

    if (result.success && result.filename) {
        updateDocumentsList(result.filename, new Date(), true);
        const modeMsg = colorBlindMode ? ' (color blind optimized mode)' : '';
        showNotification(`<i class="fas fa-check-circle me-1"></i> Example "${result.filename}" successfully loaded${modeMsg}.`, 'success');
    } else {
        throw new Error(result.error || 'Unexpected server response when loading example.');
    }

  } catch (error) {
    console.error('Error loading example:', error);
    showNotification(`<i class="fas fa-exclamation-triangle me-1"></i> Error loading example: ${error.message}`, 'error');
  } finally {
    if (loadingEl) {
      loadingEl.classList.add('d-none');
      loadingEl.classList.remove('d-flex');
    }
  }
});

// Markdown preview
document.getElementById('markdown-file')?.addEventListener('change', function(e) {
  const file = e.target.files[0];
  const previewContainer = document.getElementById('markdown-preview');
  const previewContent = document.getElementById('preview-content');

  if (!file) {
    previewContainer?.classList.add('d-none');
    return;
  }

  if (!previewContainer || !previewContent) return;

  const reader = new FileReader();
  reader.onload = function(event) {
    const content = event.target.result;
    try {
      // Use markdown-it for a more accurate preview if available
      // This is an optional enhancement, if markdown-it is not available globally, use simple pre.
      let htmlContent;
      if (typeof MarkdownIt !== 'undefined') {
        const md = new MarkdownIt();
        htmlContent = md.render(content.substring(0, 500) + (content.length > 500 ? '...' : ''));
      } else {
        let previewText = content.substring(0, 500);
        if (content.length > 500) previewText += '... (preview truncated)';
        htmlContent = `<pre class="bg-light p-3 rounded">${previewText.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</pre>`;
      }

      const fileSize = (file.size / 1024).toFixed(2) + ' KB';
      const fileInfo = `<div class="mt-2 text-muted small">
                          <span class="badge bg-secondary me-2">${file.name}</span>
                          <span class="badge bg-light text-dark border">Size: ${fileSize}</span>
                        </div>`;

      previewContent.innerHTML = htmlContent + fileInfo;
      previewContainer.classList.remove('d-none');
    } catch (error) {
      console.error("Error generating preview:", error);
      previewContent.innerHTML = `<p class="text-danger">Error generating preview.</p>`;
      previewContainer.classList.remove('d-none');
    }
  };

  reader.onerror = function() {
    console.error("Error reading file for preview.");
    previewContent.innerHTML = `<p class="text-danger">Could not read file for preview.</p>`;
    previewContainer.classList.remove('d-none');
  };

  reader.readAsText(file);
});

// Initialize highlight.js after the DOM is fully loaded
// and apply the initial theme.
// The applyThemeSetting function (in index.html) is responsible for calling hljs.highlightAll()
// or configuring the correct language after changing the highlight.js theme.
// Make sure that hljs.highlightAll() is called when necessary, for example,
// after loading dynamic content that needs highlighting.

// If using AJAX to load content containing code blocks,
// call hljs.highlightAll() or hljs.highlightElement() after inserting the content.

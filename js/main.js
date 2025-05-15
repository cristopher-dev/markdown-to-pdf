// Cargar el highlight.js para resaltado de código
document.addEventListener('DOMContentLoaded', () => {
  if (typeof hljs !== 'undefined') {
  } else {
    console.warn('Highlight.js no está definido. El resaltado de código no funcionará.');
  }
});

// Mostrar archivo de ejemplo
document.getElementById('show-example')?.addEventListener('click', async function() {
  const loadingEl = document.getElementById('loading');
  if (loadingEl) {
    loadingEl.classList.remove('d-none');
    loadingEl.classList.add('d-flex');
  }
  try {
    const colorBlindMode = document.body.classList.contains('color-blind-mode');
    const response = await fetch(`/example?colorBlindFriendly=${colorBlindMode}`);

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.error || `No se pudo cargar el ejemplo (Estado: ${response.status})`);
    }
    // El servidor ahora debería devolver el nombre del archivo en la respuesta JSON
    const result = await response.json();

    if (result.success && result.filename) {
        updateDocumentsList(result.filename, new Date(), true);
        const modoMsg = colorBlindMode ? ' (modo daltónico optimizado)' : '';
        showNotification(`<i class="fas fa-check-circle me-1"></i> Ejemplo "${result.filename}" cargado correctamente${modoMsg}.`, 'success');
    } else {
        throw new Error(result.error || 'Respuesta inesperada del servidor al cargar ejemplo.');
    }

  } catch (error) {
    console.error('Error al cargar el ejemplo:', error);
    showNotification(`<i class="fas fa-exclamation-triangle me-1"></i> Error al cargar el ejemplo: ${error.message}`, 'error');
  } finally {
    if (loadingEl) {
      loadingEl.classList.add('d-none');
      loadingEl.classList.remove('d-flex');
    }
  }
});

// Vista previa de Markdown
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
      // Usar markdown-it para una vista previa más fiel si está disponible
      // Esta es una mejora opcional, si markdown-it no está disponible globalmente, usar pre simple.
      let htmlContent;
      if (typeof MarkdownIt !== 'undefined') {
        const md = new MarkdownIt();
        htmlContent = md.render(content.substring(0, 500) + (content.length > 500 ? '...' : ''));
      } else {
        let previewText = content.substring(0, 500);
        if (content.length > 500) previewText += '... (vista previa truncada)';
        htmlContent = `<pre class="bg-light p-3 rounded">${previewText.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</pre>`;
      }

      const fileSize = (file.size / 1024).toFixed(2) + ' KB';
      const fileInfo = `<div class="mt-2 text-muted small">
                          <span class="badge bg-secondary me-2">${file.name}</span>
                          <span class="badge bg-light text-dark border">Tamaño: ${fileSize}</span>
                        </div>`;

      previewContent.innerHTML = htmlContent + fileInfo;
      previewContainer.classList.remove('d-none');
    } catch (error) {
      console.error("Error al generar vista previa:", error);
      previewContent.innerHTML = `<p class="text-danger">Error al generar la vista previa.</p>`;
      previewContainer.classList.remove('d-none');
    }
  };

  reader.onerror = function() {
    console.error("Error al leer el archivo para vista previa.");
    previewContent.innerHTML = `<p class="text-danger">No se pudo leer el archivo para la vista previa.</p>`;
    previewContainer.classList.remove('d-none');
  };

  reader.readAsText(file);
});

// Inicializar highlight.js después de que el DOM esté completamente cargado
// y aplicar el tema inicial.
// La función applyThemeSetting (en index.html) se encarga de llamar a hljs.highlightAll()
// o configurar el lenguaje correcto después de cambiar el tema de highlight.js.
// Asegurarse que hljs.highlightAll() se llame cuando sea necesario, por ejemplo,
// después de cargar contenido dinámicamente que necesite resaltado.

// Si se usa AJAX para cargar contenido que contiene bloques de código,
// llamar a hljs.highlightAll() o hljs.highlightElement() después de insertar el contenido.

// Inicialización de los tooltips de Bootstrap
document.addEventListener('DOMContentLoaded', function () {
  // Inicializar tooltips
  var tooltipTriggerList = [].slice.call(
    document.querySelectorAll('[data-bs-toggle="tooltip"]')
  );
  var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl);
  });

  // Mostrar la fecha y hora actual como última actualización
  const now = new Date();
  const lastUpdateEl = document.getElementById('last-update');
  if (lastUpdateEl) {
    lastUpdateEl.textContent =
      now.toLocaleDateString(undefined, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }) +
      ' ' +
      now.toLocaleTimeString();
  }

  // Cargar documentos existentes
  checkExistingDocuments();

  // Toggle para el panel de configuración avanzada (dentro del panel de opciones)
  const toggleSettingsButton = document.getElementById('toggle-settings');
  const settingsContent = document.getElementById('settings-content');

  if (toggleSettingsButton && settingsContent) {
    const settingsChevron = toggleSettingsButton.querySelector(
      '.fas.fa-chevron-down, .fas.fa-chevron-up'
    );
    toggleSettingsButton.addEventListener('click', () => {
      settingsContent.classList.toggle('d-none');
      const isHidden = settingsContent.classList.contains('d-none');
      if (settingsChevron) {
        settingsChevron.classList.toggle('fa-chevron-down', isHidden);
        settingsChevron.classList.toggle('fa-chevron-up', !isHidden);
      }
      toggleSettingsButton.setAttribute('aria-expanded', !isHidden);
    });
  }

  // Toggle para el botón principal de "Opciones" que muestra/oculta el panel de settings
  const settingsBtn = document.getElementById('settings-btn');
  const settingsPanel = document.getElementById('settings-panel');

  if (settingsBtn && settingsPanel) {
    settingsBtn.addEventListener('click', () => {
      settingsPanel.classList.toggle('d-none');
      settingsBtn.setAttribute('aria-expanded', !settingsPanel.classList.contains('d-none'));
    });
    settingsBtn.setAttribute('aria-expanded', !settingsPanel.classList.contains('d-none'));
    settingsBtn.setAttribute('aria-controls', 'settings-panel');
  }

  // Cargar opciones guardadas al inicio
  loadOptions();

  // Listeners para botones de guardar y resetear opciones
  const saveBtn = document.getElementById('save-options-btn');
  if (saveBtn) {
    saveBtn.addEventListener('click', saveOptions);
  }

  const resetBtn = document.getElementById('reset-options-btn');
  if (resetBtn) {
    resetBtn.addEventListener('click', resetOptions);
  }
});

// Control de tema claro/oscuro
const themeToggle = document.getElementById('theme-toggle');
const themeIcon = themeToggle.querySelector('i');
const htmlElement = document.documentElement;
const highlightLink = document.getElementById('highlight-theme');
const themeSelect = document.getElementById('theme-select');

function updateHighlightTheme(selectedThemeOption, currentBsTheme) {
  const cssFile =
    currentBsTheme === 'dark'
      ? selectedThemeOption.dataset.dark
      : selectedThemeOption.dataset.light;
  highlightLink.setAttribute(
    'href',
    `https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/${cssFile}`
  );
}

function applyThemeSetting(theme) {
  // theme is 'light' or 'dark'
  htmlElement.setAttribute('data-bs-theme', theme);
  localStorage.setItem('theme', theme);
  themeIcon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
  // Actualizar el tema de highlight.js si ya se ha seleccionado uno
  const selectedHighlightTheme = themeSelect.options[themeSelect.selectedIndex];
  if (selectedHighlightTheme && selectedHighlightTheme.value !== '') {
    updateHighlightTheme(selectedHighlightTheme, theme);
  }
}

// Verificar si hay una preferencia de tema guardada o del sistema
let initialTheme = localStorage.getItem('theme');
if (!initialTheme) {
  initialTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}
applyThemeSetting(initialTheme); // Aplicar tema inicial

themeToggle.addEventListener('click', () => {
  const currentTheme = htmlElement.getAttribute('data-bs-theme');
  applyThemeSetting(currentTheme === 'dark' ? 'light' : 'dark');
});

// Cambiar tema de highlight.js cuando se selecciona uno nuevo
themeSelect.addEventListener('change', function () {
  const selectedOption = this.options[this.selectedIndex];
  if (selectedOption.value) {
    localStorage.setItem('highlightJsTheme', selectedOption.value);
    const currentBsTheme = htmlElement.getAttribute('data-bs-theme') || 'light';
    updateHighlightTheme(selectedOption, currentBsTheme);
  }
});

// Mostrar el nombre del archivo seleccionado y cambiar estilo del área de carga
const markdownFileInput = document.getElementById('markdown-file');
const fileNameDisplay = document.getElementById('file-name-display');
const fileUploadArea = document.querySelector('.file-upload');

markdownFileInput.addEventListener('change', function (e) {
  const file = e.target.files[0];
  if (file) {
    fileNameDisplay.textContent = file.name;
    fileUploadArea.classList.add('border-success');
    fileUploadArea.classList.remove(
      'border-primary',
      'border-info',
      'bg-info-subtle',
      'bg-light'
    );
  } else {
    fileNameDisplay.textContent =
      'Arrastra tu archivo Markdown aquí o haz clic para seleccionar';
    fileUploadArea.classList.remove('border-success', 'border-info', 'bg-info-subtle');
    fileUploadArea.classList.add('border-primary', 'bg-light');
  }
});

// Función para verificar y cargar documentos existentes
async function checkExistingDocuments() {
  const documentsListEl = document.getElementById('documents-list');
  const noDocumentsEl = document.getElementById('no-documents');

  try {
    const response = await fetch('/list-files'); // Cambiado de /public-files a /list-files
    if (!response.ok) throw new Error('No se pudieron obtener los archivos');
    const responseData = await response.json();

    if (!responseData.success || !Array.isArray(responseData.files)) {
      console.error(
        'La respuesta del servidor no contenía una lista de archivos válida:',
        responseData
      );
      throw new Error('Formato de respuesta de archivos no válido.');
    }

    const filesArray = responseData.files;

    documentsListEl.innerHTML = ''; // Limpiar lista
    let hasDocuments = false;

    const uniqueBaseNames = new Set();
    filesArray.forEach((file) => {
      if (file.endsWith('.html') || file.endsWith('.pdf')) {
        uniqueBaseNames.add(file.split('.').slice(0, -1).join('.'));
      }
    });

    uniqueBaseNames.forEach((baseName) => {
      updateDocumentsList(baseName + '.md', new Date(), false); // false para no mostrar notificación
      hasDocuments = true;
    });

    if (hasDocuments) {
      documentsListEl.classList.remove('d-none');
      noDocumentsEl.classList.add('d-none');
    } else {
      documentsListEl.classList.add('d-none');
      noDocumentsEl.classList.remove('d-none');
    }
  } catch (error) {
    console.error('Error al cargar documentos existentes:', error);
    documentsListEl.classList.add('d-none');
    noDocumentsEl.classList.remove('d-none');
  }
}

// Manejar la subida del archivo Markdown
document.getElementById('upload-form').addEventListener('submit', async function (e) {
  e.preventDefault();

  const fileInput = document.getElementById('markdown-file');
  const file = fileInput.files[0];

  if (!file) {
    showNotification(
      '<i class="fas fa-exclamation-circle me-1"></i> Por favor, selecciona un archivo Markdown (.md).',
      'error'
    );
    return;
  }

  const loadingEl = document.getElementById('loading');
  loadingEl.classList.remove('d-none');
  loadingEl.classList.add('d-flex');

  const pageSize = document.getElementById('page-size')?.value || 'A4';
  const codeThemeOption = document.getElementById('theme-select')?.selectedOptions[0];
  const codeThemeValue = codeThemeOption ? codeThemeOption.value : 'github';
  const pageOrientation = document.getElementById('page-orientation')?.value || 'portrait';
  const marginTop = document.getElementById('margin-top')?.value;
  const marginBottom = document.getElementById('margin-bottom')?.value;
  const marginLeft = document.getElementById('margin-left')?.value;
  const marginRight = document.getElementById('margin-right')?.value;
  const customCSS = document.getElementById('custom-css')?.value || '';
  const headerTemplate = document.getElementById('header-template')?.value || '';
  const footerTemplate = document.getElementById('footer-template')?.value || '';

  const formData = new FormData();
  formData.append('markdown-file', file);
  formData.append('pageSize', pageSize);
  formData.append('codeTheme', codeThemeValue); // Enviar el valor del tema, no el nombre del archivo CSS
  formData.append('orientation', pageOrientation);
  if (marginTop) formData.append('marginTop', marginTop + 'mm');
  if (marginBottom) formData.append('marginBottom', marginBottom + 'mm');
  if (marginLeft) formData.append('marginLeft', marginLeft + 'mm');
  if (marginRight) formData.append('marginRight', marginRight + 'mm');
  if (customCSS.trim()) formData.append('customCSS', customCSS);
  if (headerTemplate.trim()) formData.append('headerTemplate', headerTemplate);
  if (footerTemplate.trim()) formData.append('footerTemplate', footerTemplate);

  const statusElement = document.getElementById('processing-status');
  const updateStatus = (message) => {
    if (statusElement) statusElement.textContent = message;
  };

  try {
    updateStatus('Enviando archivo...');
    // Simulación de progreso
    setTimeout(() => updateStatus('Convirtiendo a HTML...'), 300);
    setTimeout(() => updateStatus('Generando PDF...'), 1000);

    const response = await fetch('/convert', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ error: `Error del servidor: ${response.status}` }));
      throw new Error(errorData.error || `Error HTTP: ${response.status}`);
    }

    updateStatus('Procesando resultado...');
    const result = await response.json();

    if (result.success) {
      showNotification(
        '<i class="fas fa-check-circle me-1"></i> ¡Archivo convertido con éxito!',
        'success'
      );
      updateDocumentsList(result.filename, new Date(), true); // true para mostrar notificación
      fileInput.value = ''; // Limpiar input
      // Disparar evento change para resetear el display del nombre del archivo y estilo del área de carga
      fileInput.dispatchEvent(new Event('change'));
      document.getElementById('markdown-preview').classList.add('d-none'); // Ocultar preview
    } else {
      throw new Error(result.error || 'Error desconocido al convertir el archivo.');
    }
  } catch (error) {
    console.error('Error en la conversión:', error);
    showNotification(
      `<i class="fas fa-exclamation-triangle me-1"></i> Error: ${error.message}`,
      'error'
    );
  } finally {
    loadingEl.classList.add('d-none');
    loadingEl.classList.remove('d-flex');
    updateStatus('Procesando...'); // Reset status
  }
});

// Guardar y cargar preferencias de opciones
const optionsToSave = [
  { id: 'page-size', type: 'value' },
  { id: 'theme-select', type: 'value' },
  { id: 'page-orientation', type: 'value' },
  { id: 'margin-top', type: 'value' },
  { id: 'margin-bottom', type: 'value' },
  { id: 'margin-left', type: 'value' },
  { id: 'margin-right', type: 'value' },
  { id: 'custom-css', type: 'value' },
  { id: 'header-template', type: 'value' },
  { id: 'footer-template', type: 'value' },
];

function saveOptions() {
  optionsToSave.forEach(opt => {
    const element = document.getElementById(opt.id);
    if (element) {
      localStorage.setItem(`option_${opt.id}`, element[opt.type]);
    }
  });
  showNotification('<i class="fas fa-save me-1"></i> Preferencias guardadas.', 'success');
}

function loadOptions() {
  optionsToSave.forEach(opt => {
    const savedValue = localStorage.getItem(`option_${opt.id}`);
    if (savedValue !== null) {
      const element = document.getElementById(opt.id);
      if (element) {
        element[opt.type] = savedValue;
        // Disparar evento change para selectores para que se actualice la UI si es necesario (ej. highlight theme)
        if (element.tagName === 'SELECT') {
          element.dispatchEvent(new Event('change'));
        }
      }
    }
  });
}

function resetOptions() {
  const defaultValues = {
    'page-size': 'A4',
    'theme-select': 'github',
    'page-orientation': 'portrait',
    'margin-top': '',
    'margin-bottom': '',
    'margin-left': '',
    'margin-right': '',
    'custom-css': '',
    'header-template': "<div style='font-size: 8px; width: 100%; text-align: center;'><span class='date'></span> - <span class='title'></span></div>",
    'footer-template': "<div style='font-size: 8px; width: 100%; text-align: center;'><span class='pageNumber'></span> / <span class='totalPages'></span></div>",
  };

  optionsToSave.forEach(opt => {
    const element = document.getElementById(opt.id);
    if (element) {
      element[opt.type] = defaultValues[opt.id] || '';
      if (element.tagName === 'SELECT') {
        element.dispatchEvent(new Event('change'));
      }
    }
  });
  showNotification('<i class="fas fa-undo me-1"></i> Opciones restablecidas a los valores por defecto.', 'info');
  optionsToSave.forEach(opt => localStorage.removeItem(`option_${opt.id}`));
}

function showNotification(message, type = 'info', duration = 5000) {
  const existingNotifications = document.querySelectorAll('.alert.notification-toast');
  existingNotifications.forEach((notif) => {
    const bsAlert = bootstrap.Alert.getInstance(notif);
    if (bsAlert) bsAlert.close();
    else notif.remove();
  });

  const alertClass =
    type === 'success' ? 'alert-success' : type === 'error' ? 'alert-danger' : 'alert-info'; // default to info

  const notification = document.createElement('div');
  notification.className = `alert ${alertClass} alert-dismissible fade show shadow-sm notification-toast position-fixed top-0 end-0 m-3`;
  notification.style.zIndex = '1100'; // Asegurar que esté por encima de otros elementos
  notification.setAttribute('role', 'alert');
  notification.innerHTML = `
    ${message}
    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
  `;

  document.body.appendChild(notification); // Añadir al body para posicionamiento fixed

  setTimeout(() => {
    const bsAlert = bootstrap.Alert.getInstance(notification);
    if (bsAlert) bsAlert.close();
    else notification.remove();
  }, duration);
}

function updateDocumentsList(filename, creationDate, showNotif = true) {
  const documentsListEl = document.getElementById('documents-list');
  const noDocumentsEl = document.getElementById('no-documents');

  documentsListEl.classList.remove('d-none');
  noDocumentsEl.classList.add('d-none');

  const baseName = filename.replace(/\.md$/, '');
  const dateToDisplay = creationDate || new Date(); // Usar fecha provista o actual

  // Evitar duplicados basados en baseName
  const existingItem = documentsListEl.querySelector(`[data-basename="${baseName}"]`);
  if (existingItem) {
    // Opcional: actualizar timestamp si es necesario, o simplemente no hacer nada.
    // Por ahora, si ya existe, no lo re-añadimos.
    // Podrías querer actualizar el timestamp si el archivo se convierte de nuevo.
    const timestampEl = existingItem.querySelector('.document-timestamp');
    if (timestampEl) {
      timestampEl.textContent = `Reconvertido: ${dateToDisplay.toLocaleString()}`;
    }
    if (showNotif && filename.endsWith('.md')) {
      // Solo notificar si es una nueva conversión de MD
      showNotification(
        `<i class="fas fa-sync-alt me-1"></i> "${baseName}.md" actualizado.`,
        'info'
      );
    }
    return; // No añadir duplicado
  }

  const newItem = document.createElement('div');
  newItem.className =
    'list-group-item list-group-item-action d-flex justify-content-between align-items-center flex-wrap gap-2';
  newItem.setAttribute('data-basename', baseName);
  newItem.setAttribute('data-date', dateToDisplay.getTime().toString()); // Guardar timestamp para ordenar

  newItem.innerHTML = `
    <div class="flex-grow-1">
      <h5 class="mb-1 text-primary">${baseName}.md</h5>
      <small class="text-muted">Convertido: ${dateToDisplay.toLocaleString()}</small>
    </div>
    <div class="btn-group" role="group" aria-label="Acciones del documento">
      <a href="public/${baseName}.html" target="_blank" class="btn btn-sm btn-outline-secondary" title="Ver HTML de ${baseName}.md">
        <i class="fas fa-file-alt me-1"></i> HTML
      </a>
      <a href="public/${baseName}.pdf" class="btn btn-sm btn-danger" target="_blank" title="Ver PDF de ${baseName}.md">
        <i class="fas fa-file-pdf me-1"></i> PDF
      </a>
      <button class="btn btn-sm btn-outline-danger delete-btn" title="Eliminar ${baseName}">
        <i class="fas fa-trash-alt me-1"></i> Eliminar
      </button>
    </div>
  `;

  // Insertar ordenado por fecha (más reciente primero)
  const existingItems = Array.from(documentsListEl.children);
  let inserted = false;
  for (const item of existingItems) {
    if (dateToDisplay.getTime() > parseInt(item.dataset.date || '0')) {
      documentsListEl.insertBefore(newItem, item);
      inserted = true;
      break;
    }
  }
  if (!inserted) {
    documentsListEl.appendChild(newItem);
  }

  // Agregar event listener para el botón de eliminar
  const deleteButton = newItem.querySelector('.delete-btn');
  deleteButton.addEventListener('click', async () => {
    const confirmDelete = confirm(
      `¿Estás seguro de que quieres eliminar los archivos asociados con "${baseName}.md"?`
    );
    if (confirmDelete) {
      try {
        const response = await fetch(`/delete-files/${baseName}`, { method: 'DELETE' });
        const result = await response.json();
        if (result.success) {
          newItem.remove();
          showNotification(
            `<i class="fas fa-check-circle me-1"></i> Archivos de "${baseName}.md" eliminados.`,
            'success'
          );
          // Verificar si la lista está vacía después de eliminar
          if (documentsListEl.children.length === 0) {
            noDocumentsEl.classList.remove('d-none');
            documentsListEl.classList.add('d-none');
          }
        } else {
          showNotification(
            `<i class="fas fa-exclamation-triangle me-1"></i> Error al eliminar: ${result.error}`,
            'error'
          );
        }
      } catch (error) {
        showNotification(
          `<i class="fas fa-exclamation-triangle me-1"></i> Error de red al eliminar: ${error.message}`,
          'error'
        );
      }
    }
  });

  if (showNotif && filename.endsWith('.md')) {
    // Solo notificar si es una nueva conversión de MD
    showNotification(
      `<i class="fas fa-check-circle me-1"></i> "${baseName}.md" añadido a la lista.`,
      'success'
    );
  }
}

// Funcionalidad de arrastrar y soltar
const dropArea = document.querySelector('.file-upload');

['dragenter', 'dragover', 'dragleave', 'drop'].forEach((eventName) => {
  dropArea.addEventListener(eventName, preventDefaults, false);
});

function preventDefaults(e) {
  e.preventDefault();
  e.stopPropagation();
}

['dragenter', 'dragover'].forEach((eventName) => {
  dropArea.addEventListener(
    eventName,
    () => {
      if (!dropArea.classList.contains('border-success')) {
        // No cambiar si ya hay un archivo válido
        dropArea.classList.add('border-info', 'bg-info-subtle');
        dropArea.classList.remove('border-primary', 'bg-light');
      }
    },
    false
  );
});

['dragleave', 'drop'].forEach((eventName) => {
  dropArea.addEventListener(
    eventName,
    () => {
      if (!dropArea.classList.contains('border-success')) {
        dropArea.classList.remove('border-info', 'bg-info-subtle');
        dropArea.classList.add('border-primary', 'bg-light');
      }
    },
    false
  );
});

dropArea.addEventListener(
  'drop',
  (e) => {
    const dt = e.dataTransfer;
    const files = dt.files;

    if (files.length > 0) {
      const fileInput = document.getElementById('markdown-file');
      fileInput.files = files;
      const event = new Event('change', { bubbles: true });
      fileInput.dispatchEvent(event); // Para actualizar UI y preview
    }
  },
  false
);

// filepath: /home/markdown-to-pdf/js/script.js
// Bootstrap tooltips initialization
document.addEventListener('DOMContentLoaded', function () {
  // Initialize tooltips
  var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
  var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl);
  });

  // Show current date and time as last update
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

  // Load existing documents
  checkExistingDocuments();

  // Toggle for advanced configuration panel (inside options panel)
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

  // Toggle for the main "Options" button that shows/hides the settings panel
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

  // Load saved options on startup
  loadOptions();

  // Listeners for save and reset options buttons
  const saveBtn = document.getElementById('save-options-btn');
  if (saveBtn) {
    saveBtn.addEventListener('click', saveOptions);
  }

  const resetBtn = document.getElementById('reset-options-btn');
  if (resetBtn) {
    resetBtn.addEventListener('click', resetOptions);
  }
});

// Options to save/load - DECLARE EARLIER
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

// Theme control (light/dark/auto)
const themeToggle = document.getElementById('theme-toggle');
const themeOptions = document.querySelectorAll('.theme-option');
const themeIcon = themeToggle.querySelector('i');
const htmlElement = document.documentElement;

function updateHighlightTheme(selectedThemeOption, currentBsTheme) {
  // Esta función ya no es necesaria o necesitaría una reescritura completa si se mantiene highlight.js sin temas dinámicos.
  // Por ahora, la eliminamos o la dejamos vacía si alguna parte de la lógica aún la llama.
  // console.log("updateHighlightTheme llamada pero la funcionalidad de temas de highlight.js ha sido eliminada.");
}

function applyThemeSetting(theme) {
  // Determine the theme to apply
  // For 'auto', check system preference
  const effectiveTheme =
    theme === 'auto'
      ? window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light'
      : theme;

  // Apply theme to document
  htmlElement.setAttribute('data-bs-theme', effectiveTheme);
  localStorage.setItem('theme', theme); // Store user preference (light/dark/auto/cristopher)

  // Update theme toggle icon based on current effective theme
  if (themeToggle && themeIcon) {
    // Ensure elements exist
    if (theme === 'auto') {
      themeIcon.className = 'fas fa-magic';
    } else if (theme === 'cristopher') {
      themeIcon.className = 'fas fa-star'; // Corrected icon for Cristopher theme
    } else {
      themeIcon.className = effectiveTheme === 'dark' ? 'fas fa-moon' : 'fas fa-sun';
    }
  }

  // Update the active state in dropdown menu
  themeOptions.forEach(option => {
    if (option.dataset.theme === theme) {
      option.classList.add('active');
    } else {
      option.classList.remove('active');
    }
  });
}

// Register listeners for system color scheme changes
const systemDarkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
systemDarkModeMediaQuery.addEventListener('change', e => {
  const currentTheme = localStorage.getItem('theme') || 'auto';
  if (currentTheme === 'auto') {
    applyThemeSetting('auto'); // Re-apply auto theme when system preference changes
  }
});

// Check if there's a saved theme preference or default to auto
let initialTheme = localStorage.getItem('theme');
if (!initialTheme) {
  initialTheme = 'auto'; // Default to auto theme if not set
}
applyThemeSetting(initialTheme); // Apply initial theme

// Theme dropdown option click handler
themeOptions.forEach(option => {
  option.addEventListener('click', function () {
    const selectedTheme = this.dataset.theme;
    applyThemeSetting(selectedTheme);
  });
});

// Display selected filename and change upload area style
const markdownFileInput = document.getElementById('markdown-file');
const fileNameDisplay = document.getElementById('file-name-display');
const fileUploadArea = document.querySelector('.file-upload');

markdownFileInput.addEventListener('change', function (e) {
  const file = e.target.files[0];
  if (file) {
    fileNameDisplay.textContent = file.name;
    fileUploadArea.classList.add('border-success');
    fileUploadArea.classList.remove('border-primary', 'border-info', 'bg-info-subtle', 'bg-light');
  } else {
    fileNameDisplay.textContent = 'Drag your Markdown file here or click to select';
    fileUploadArea.classList.remove('border-success', 'border-info', 'bg-info-subtle');
    fileUploadArea.classList.add('border-primary', 'bg-light');
  }
});

// Function to check and load existing documents
async function checkExistingDocuments() {
  const documentsListEl = document.getElementById('documents-list');
  const noDocumentsEl = document.getElementById('no-documents');

  try {
    const response = await fetch('/list-files'); // Changed from /public-files to /list-files
    if (!response.ok) throw new Error('Could not retrieve files');
    const responseData = await response.json();

    if (!responseData.success || !Array.isArray(responseData.files)) {
      console.error('Server response did not contain a valid file list:', responseData);
      throw new Error('Invalid file response format.');
    }

    const filesArray = responseData.files;

    documentsListEl.innerHTML = ''; // Clear list
    let hasDocuments = false;

    const uniqueBaseNames = new Set();
    filesArray.forEach(file => {
      if (file.endsWith('.html') || file.endsWith('.pdf')) {
        uniqueBaseNames.add(file.split('.').slice(0, -1).join('.'));
      }
    });

    uniqueBaseNames.forEach(baseName => {
      updateDocumentsList(baseName + '.md', new Date(), false); // false to not show notification
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
    console.error('Error loading existing documents:', error);
    documentsListEl.classList.add('d-none');
    noDocumentsEl.classList.remove('d-none');
  }
}

// Handle Markdown file upload
document.getElementById('upload-form').addEventListener('submit', async function (e) {
  e.preventDefault();

  const fileInput = document.getElementById('markdown-file');
  const file = fileInput.files[0];

  if (!file) {
    showNotification(
      '<i class="fas fa-exclamation-circle me-1"></i> Please select a Markdown file (.md).',
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
  formData.append('codeTheme', codeThemeValue); // Send theme value, not CSS filename
  formData.append('orientation', pageOrientation);
  if (marginTop) formData.append('marginTop', marginTop + 'mm');
  if (marginBottom) formData.append('marginBottom', marginBottom + 'mm');
  if (marginLeft) formData.append('marginLeft', marginLeft + 'mm');
  if (marginRight) formData.append('marginRight', marginRight + 'mm');
  if (customCSS.trim()) formData.append('customCSS', customCSS);
  if (headerTemplate.trim()) formData.append('headerTemplate', headerTemplate);
  if (footerTemplate.trim()) formData.append('footerTemplate', footerTemplate);

  const statusElement = document.getElementById('processing-status');
  const updateStatus = message => {
    if (statusElement) statusElement.textContent = message;
  };

  try {
    updateStatus('Sending file...');
    // Progress simulation
    setTimeout(() => updateStatus('Converting to HTML...'), 300);
    setTimeout(() => updateStatus('Generating PDF...'), 1000);

    const response = await fetch('/api/convert', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ error: `Server error: ${response.status}` }));
      throw new Error(errorData.error || `HTTP Error: ${response.status}`);
    }

    updateStatus('Processing result...');
    const result = await response.json();

    if (result.success) {
      showNotification(
        '<i class="fas fa-check-circle me-1"></i> File converted successfully!',
        'success'
      );
      updateDocumentsList(result.filename, new Date(), true); // true to show notification
      fileInput.value = ''; // Clear input
      // Trigger change event to reset filename display and upload area style
      fileInput.dispatchEvent(new Event('change'));
      document.getElementById('markdown-preview').classList.add('d-none'); // Hide preview
    } else {
      throw new Error(result.error || 'Unknown error converting file.');
    }
  } catch (error) {
    console.error('Conversion error:', error);
    showNotification(
      `<i class="fas fa-exclamation-triangle me-1"></i> Error: ${error.message}`,
      'error'
    );
  } finally {
    loadingEl.classList.add('d-none');
    loadingEl.classList.remove('d-flex');
    updateStatus('Processing...'); // Reset status
  }
});

// Save and load option preferences
function saveOptions() {
  optionsToSave.forEach(opt => {
    const element = document.getElementById(opt.id);
    if (element) {
      localStorage.setItem(`option_${opt.id}`, element[opt.type]);
    }
  });
  showNotification('<i class="fas fa-save me-1"></i> Preferences saved.', 'success');
}

function loadOptions() {
  optionsToSave.forEach(opt => {
    const savedValue = localStorage.getItem(`option_${opt.id}`);
    if (savedValue !== null) {
      const element = document.getElementById(opt.id);
      if (element) {
        element[opt.type] = savedValue;
        // Trigger change event for selectors to update UI if needed (e.g. highlight theme)
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
    'header-template': '', // Modified to be empty by default
    'footer-template': '', // Modified to be empty by default
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
  showNotification('<i class="fas fa-undo me-1"></i> Options reset to default values.', 'info');
  optionsToSave.forEach(opt => localStorage.removeItem(`option_${opt.id}`));
}

function showNotification(message, type = 'info', duration = 5000) {
  const existingNotifications = document.querySelectorAll('.alert.notification-toast');
  existingNotifications.forEach(notif => {
    const bsAlert = bootstrap.Alert.getInstance(notif);
    if (bsAlert) bsAlert.close();
    else notif.remove();
  });

  const alertClass =
    type === 'success' ? 'alert-success' : type === 'error' ? 'alert-danger' : 'alert-info'; // default to info

  const notification = document.createElement('div');
  notification.className = `alert ${alertClass} alert-dismissible fade show shadow-sm notification-toast position-fixed top-0 end-0 m-3`;
  notification.style.zIndex = '1100'; // Ensure it's above other elements
  notification.setAttribute('role', 'alert');
  notification.innerHTML = `
    ${message}
    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
  `;

  document.body.appendChild(notification); // Add to body for fixed positioning

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
  const dateToDisplay = creationDate || new Date(); // Use provided date or current date

  // Avoid duplicates based on baseName
  const existingItem = documentsListEl.querySelector(`[data-basename="${baseName}"]`);
  if (existingItem) {
    // Optional: update timestamp if needed, or just do nothing.
    // For now, if it already exists, we don't re-add it.
    // You might want to update the timestamp if the file is converted again.
    const timestampEl = existingItem.querySelector('.document-timestamp');
    if (timestampEl) {
      timestampEl.textContent = `Reconverted: ${dateToDisplay.toLocaleString()}`;
    }
    if (showNotif && filename.endsWith('.md')) {
      // Only notify if it's a new MD conversion
      showNotification(`<i class="fas fa-sync-alt me-1"></i> "${baseName}.md" updated.`, 'info');
    }
    return; // Don't add duplicate
  }

  const newItem = document.createElement('div');
  newItem.className =
    'list-group-item list-group-item-action d-flex justify-content-between align-items-center flex-wrap gap-2';
  newItem.setAttribute('data-basename', baseName);
  newItem.setAttribute('data-date', dateToDisplay.getTime().toString()); // Save timestamp for sorting

  newItem.innerHTML = `
    <div class="flex-grow-1">
      <h5 class="mb-1 text-primary">${baseName}.md</h5>
      <small class="text-muted">Converted: ${dateToDisplay.toLocaleString()}</small>
    </div>
    <div class="btn-group" role="group" aria-label="Document actions">
      <a href="public/${baseName}.html" target="_blank" class="btn btn-sm btn-outline-secondary" title="View HTML of ${baseName}.md">
        <i class="fas fa-file-alt me-1"></i> HTML
      </a>
      <a href="public/${baseName}.pdf" class="btn btn-sm btn-danger" target="_blank" title="View PDF of ${baseName}.md">
        <i class="fas fa-file-pdf me-1"></i> PDF
      </a>
      <button class="btn btn-sm btn-outline-danger delete-btn" title="Delete ${baseName}">
        <i class="fas fa-trash-alt me-1"></i> Delete
      </button>
    </div>
  `;

  // Insert sorted by date (most recent first)
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

  // Add event listener for delete button
  const deleteButton = newItem.querySelector('.delete-btn');
  deleteButton.addEventListener('click', async () => {
    const confirmDelete = confirm(
      `Are you sure you want to delete the files associated with "${baseName}.md"?`
    );
    if (confirmDelete) {
      try {
        const response = await fetch(`/api/convert/delete/${baseName}`, { method: 'DELETE' });
        const result = await response.json();
        if (result.success) {
          newItem.remove();
          showNotification(
            `<i class="fas fa-check-circle me-1"></i> "${baseName}.md" files deleted.`,
            'success'
          );
          // Check if list is empty after deletion
          if (documentsListEl.children.length === 0) {
            noDocumentsEl.classList.remove('d-none');
            documentsListEl.classList.add('d-none');
          }
        } else {
          showNotification(
            `<i class="fas fa-exclamation-triangle me-1"></i> Error deleting: ${result.error}`,
            'error'
          );
        }
      } catch (error) {
        showNotification(
          `<i class="fas fa-exclamation-triangle me-1"></i> Network error while deleting: ${error.message}`,
          'error'
        );
      }
    }
  });

  if (showNotif && filename.endsWith('.md')) {
    // Only notify if it's a new MD conversion
    showNotification(
      `<i class="fas fa-check-circle me-1"></i> "${baseName}.md" added to the list.`,
      'success'
    );
  }
}

// Drag and drop functionality
const dropArea = document.querySelector('.file-upload');

['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
  dropArea.addEventListener(eventName, preventDefaults, false);
});

function preventDefaults(e) {
  e.preventDefault();
  e.stopPropagation();
}

['dragenter', 'dragover'].forEach(eventName => {
  dropArea.addEventListener(
    eventName,
    () => {
      if (!dropArea.classList.contains('border-success')) {
        // Don't change if there's already a valid file
        dropArea.classList.add('border-info', 'bg-info-subtle');
        dropArea.classList.remove('border-primary', 'bg-light');
      }
    },
    false
  );
});

['dragleave', 'drop'].forEach(eventName => {
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
  e => {
    const dt = e.dataTransfer;
    const files = dt.files;

    if (files.length > 0) {
      const fileInput = document.getElementById('markdown-file');
      fileInput.files = files;
      const event = new Event('change', { bubbles: true });
      fileInput.dispatchEvent(event); // To update UI and preview
    }
  },
  false
);

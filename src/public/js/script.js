// filepath: /home/markdown-to-pdf/js/script.js
// Bootstrap tooltips initialization
document.addEventListener('DOMContentLoaded', () => {
  // Initialize Bootstrap tooltips
  const tooltipTriggerList = [
    ...document.querySelectorAll('[data-bs-toggle="tooltip"]'),
  ];
  tooltipTriggerList.map(
    (tooltipTriggerEl) => new bootstrap.Tooltip(tooltipTriggerEl)
  );

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
  const toggleSettingsButton = document.getElementById('toggleSettings');
  const settingsPanel = document.getElementById('settingsPanel');
  const mainContent = document.getElementById('mainContent'); // Assuming your main content area has this ID

  if (toggleSettingsButton && settingsPanel && mainContent) {
    toggleSettingsButton.addEventListener('click', () => {
      settingsPanel.classList.toggle('show');
      mainContent.classList.toggle('settings-panel-open');

      // Update chevron icon
      const settingsChevron = toggleSettingsButton.querySelector(
        '.fas.fa-chevron-right, .fas.fa-chevron-left'
      );
      if (settingsPanel.classList.contains('show')) {
        settingsChevron.classList.remove('fa-chevron-left');
        settingsChevron.classList.add('fa-chevron-right');
        toggleSettingsButton.setAttribute('aria-expanded', 'true');
      } else {
        settingsChevron.classList.remove('fa-chevron-right');
        settingsChevron.classList.add('fa-chevron-left');
        toggleSettingsButton.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // Toggle for the main "Options" button that shows/hides the settings panel
  const settingsBtn = document.getElementById('settings-btn');
  const settingsPanelEl = document.getElementById('settings-panel');

  if (settingsBtn && settingsPanelEl) {
    settingsBtn.addEventListener('click', () => {
      settingsPanelEl.classList.toggle('d-none');
      settingsBtn.setAttribute('aria-expanded', !settingsPanelEl.classList.contains('d-none'));
    });
    settingsBtn.setAttribute('aria-expanded', !settingsPanelEl.classList.contains('d-none'));
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

  // Theme toggle functionality
  const themeToggle = document.getElementById('themeToggle');
  const themeOptions = document.querySelectorAll('.theme-option');
  const themeIcon = themeToggle.querySelector('i');
  const currentHtmlTheme = document.documentElement.getAttribute('data-bs-theme');

  // Function to set the theme
  function setTheme(theme) {
    document.documentElement.setAttribute('data-bs-theme', theme);
    localStorage.setItem('theme', theme);
    updateThemeIcon(theme);
    updateActiveThemeOption(theme);
  }

  // Function to update the theme icon
  function updateThemeIcon(theme) {
    if (theme === 'auto') {
      themeIcon.className = 'fas fa-circle-half-stroke'; // Icon for auto/system
    } else if (theme === 'dark') {
      themeIcon.className = 'fas fa-moon'; // Icon for dark
    } else {
      themeIcon.className = 'fas fa-sun'; // Icon for light
    }
  }

  // Function to update the active theme option in the dropdown
  function updateActiveThemeOption(theme) {
    themeOptions.forEach(option => {
      option.classList.remove('active');
      if (option.getAttribute('data-theme-value') === theme) {
        option.classList.add('active');
      }
    });
  }

  // Event listener for theme options in the dropdown
  themeOptions.forEach(option => {
    option.addEventListener('click', (e) => {
      e.preventDefault();
      const selectedTheme = option.getAttribute('data-theme-value');
      setTheme(selectedTheme);
    });
  });

  // Apply stored theme or system preference on load
  const storedTheme = localStorage.getItem('theme');
  const systemDarkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  systemDarkModeMediaQuery.addEventListener('change', (e) => {
    if (localStorage.getItem('theme') === 'auto') {
      setTheme(e.matches ? 'dark' : 'light');
    }
  });

  if (storedTheme) {
    setTheme(storedTheme);
  } else if (currentHtmlTheme && currentHtmlTheme !== 'auto') {
    setTheme(currentHtmlTheme); // Use theme from HTML if set and not 'auto'
  } else {
    // Default to 'auto' if nothing is set
    setTheme('auto');
    // If auto, immediately apply system preference
    if (systemDarkModeMediaQuery.matches) {
      document.documentElement.setAttribute('data-bs-theme', 'dark');
      updateThemeIcon('dark'); // Update icon based on actual applied theme
    } else {
      document.documentElement.setAttribute('data-bs-theme', 'light');
      updateThemeIcon('light'); // Update icon based on actual applied theme
    }
  }
  // Ensure the active option is correctly set on load
  updateActiveThemeOption(localStorage.getItem('theme') || (systemDarkModeMediaQuery.matches ? 'dark' : 'light'));

  // File upload area drag and drop functionality
  const fileUploadArea = document.querySelector('.file-upload');
  const fileInput = document.getElementById('markdownFile');
  const fileUploadLabel = document.querySelector('.file-upload-label');
  const fileChosenSpan = document.getElementById('file-chosen');

  if (fileUploadArea && fileInput && fileUploadLabel && fileChosenSpan) {
    fileUploadArea.addEventListener('dragover', (event) => {
      event.preventDefault();
      fileUploadArea.classList.add('dragging');
    });

    fileUploadArea.addEventListener('dragleave', () => {
      fileUploadArea.classList.remove('dragging');
    });

    fileUploadArea.addEventListener('drop', (event) => {
      event.preventDefault();
      fileUploadArea.classList.remove('dragging');
      const files = event.dataTransfer.files;
      if (files.length > 0) {
        fileInput.files = files; // Assign dropped files to the input
        fileChosenSpan.textContent = files[0].name;
        fileChosenSpan.classList.remove('text-muted');
        // Optionally, trigger form submission or other actions here
      }
    });

    // Update file chosen text on manual file selection
    fileInput.addEventListener('change', () => {
      if (fileInput.files.length > 0) {
        fileChosenSpan.textContent = fileInput.files[0].name;
        fileChosenSpan.classList.remove('text-muted'); // Make it normal text color
      } else {
        fileChosenSpan.textContent = 'No file chosen';
        fileChosenSpan.classList.add('text-muted'); // Make it muted text color
      }
    });

    // Allow label click to trigger file input
    fileUploadLabel.addEventListener('click', (event) => {
      // Prevent default if the click is on the label itself and not the input
      if (event.target.tagName.toLowerCase() === 'label' || event.target.classList.contains('file-upload-label')) {
         fileInput.click();
      }
    });
  }

  // Handle form submission for text input
  const textForm = document.getElementById('convertTextForm');
  if (textForm) {
    textForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const formData = new FormData(textForm);
      const responseDisplay = document.getElementById('textConversionResponse');
      const submitButton = textForm.querySelector('button[type="submit"]');
      const originalButtonText = submitButton.innerHTML;
      submitButton.disabled = true;
      submitButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Converting...';

      try {
        const response = await fetch('/api/convert-text', {
          method: 'POST',
          body: new URLSearchParams(formData) // Send as x-www-form-urlencoded
        });

        const result = await response.json();

        if (response.ok) {
          responseDisplay.innerHTML = 
            `<div class="alert alert-success alert-dismissible fade show" role="alert">
              Conversion successful! 
              <a href="${result.pdfPath}" target="_blank" class="alert-link">View PDF</a>
              ${result.htmlPath ? `| <a href="${result.htmlPath}" target="_blank" class="alert-link">View HTML</a>` : ''}
              <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>`;
          fetchConvertedFiles(); // Refresh file list
        } else {
          responseDisplay.innerHTML = 
            `<div class="alert alert-danger alert-dismissible fade show" role="alert">
              <strong>Error:</strong> ${result.message || 'Conversion failed'}
              ${result.error ? `<br><small>${result.error}</small>` : ''}
              <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>`;
        }
      } catch (error) {
        responseDisplay.innerHTML = 
          `<div class="alert alert-danger alert-dismissible fade show" role="alert">
            <strong>Network Error:</strong> ${error.message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
          </div>`;
      }
      finally {
        submitButton.disabled = false;
        submitButton.innerHTML = originalButtonText;
      }
    });
  }

  // Handle form submission for file upload
  const fileForm = document.getElementById('convertFileForm');
  if (fileForm) {
    fileForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const formData = new FormData(fileForm);
      const responseDisplay = document.getElementById('fileConversionResponse');
      const submitButton = fileForm.querySelector('button[type="submit"]');
      const originalButtonText = submitButton.innerHTML;
      submitButton.disabled = true;
      submitButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Converting...';

      try {
        const response = await fetch('/api/convert', {
          method: 'POST',
          body: formData, // FormData handles multipart/form-data
        });

        const result = await response.json();

        if (response.ok) {
          responseDisplay.innerHTML = 
            `<div class="alert alert-success alert-dismissible fade show" role="alert">
              Conversion successful! 
              <a href="${result.pdfPath}" target="_blank" class="alert-link">View PDF</a>
              ${result.htmlPath ? `| <a href="${result.htmlPath}" target="_blank" class="alert-link">View HTML</a>` : ''}
              <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>`;
          fetchConvertedFiles(); // Refresh file list
          fileInput.value = ''; // Clear the file input
          fileChosenSpan.textContent = 'No file chosen';
          fileChosenSpan.classList.add('text-muted');
        } else {
          responseDisplay.innerHTML = 
            `<div class="alert alert-danger alert-dismissible fade show" role="alert">
              <strong>Error:</strong> ${result.message || 'Conversion failed'}
              ${result.error ? `<br><small>${result.error}</small>` : ''}
              <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>`;
        }
      } catch (error) {
        responseDisplay.innerHTML = 
          `<div class="alert alert-danger alert-dismissible fade show" role="alert">
            <strong>Network Error:</strong> ${error.message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
          </div>`;
      }
      finally {
        submitButton.disabled = false;
        submitButton.innerHTML = originalButtonText;
      }
    });
  }

  // Fetch and display converted files
  const convertedFilesList = document.getElementById('convertedFilesList');
  async function fetchConvertedFiles() {
    if (!convertedFilesList) return;
    try {
      const response = await fetch('/list-files');
      const files = await response.json();
      convertedFilesList.innerHTML = ''; // Clear existing list

      if (files.length === 0) {
        convertedFilesList.innerHTML = '<li class="list-group-item text-muted">No files converted yet.</li>';
        return;
      }

      files.forEach((file) => {
        const listItem = document.createElement('li');
        listItem.className =
          'list-group-item d-flex justify-content-between align-items-center';
        
        let fileTypeIcon = '<i class="fas fa-file-alt me-2"></i>'; // Default icon
        if (file.type === 'PDF') {
          fileTypeIcon = '<i class="fas fa-file-pdf text-danger me-2"></i>';
        } else if (file.type === 'HTML') {
          fileTypeIcon = '<i class="fas fa-file-code text-primary me-2"></i>';
        }

        listItem.innerHTML = `
          <div>
            ${fileTypeIcon}
            <a href="/public/${file.name}" target="_blank" title="View ${file.name}">${file.name}</a>
            <small class="text-muted ms-2">(${file.size})</small>
          </div>
          <div>
            ${file.type === 'PDF' && files.find(f => f.name === file.name.replace('.pdf', '.html')) 
              ? `<a href="/public/${file.name.replace('.pdf', '.html')}" target="_blank" class="btn btn-sm btn-outline-secondary me-2" title="View HTML Preview"><i class="fas fa-eye"></i> HTML</a>` 
              : ''}
            <button class="btn btn-sm btn-outline-danger delete-file-btn" data-filename="${file.name}" title="Delete ${file.name}">
              <i class="fas fa-trash-alt"></i>
            </button>
          </div>
        `;
        convertedFilesList.appendChild(listItem);
      });

      // Add event listeners to new delete buttons
      document.querySelectorAll('.delete-file-btn').forEach((button) => {
        button.addEventListener('click', async (event) => {
          const filename = event.currentTarget.dataset.filename;
          if (confirm(`Are you sure you want to delete ${filename}? This action cannot be undone.`)) {
            try {
              const deleteResponse = await fetch(`/delete-file/${filename}`, {
                method: 'DELETE',
              });
              const result = await deleteResponse.json();
              if (deleteResponse.ok) {
                // alert(result.message);
                fetchConvertedFiles(); // Refresh the list
                // Show a success toast or small message
                showToast('File Deleted', result.message, 'success');
              } else {
                // alert(`Error: ${result.message}`);
                showToast('Error Deleting File', result.message, 'danger');
              }
            } catch (err) {
              // alert(`Network error: ${err.message}`);
              showToast('Network Error', err.message, 'danger');
            }
          }
        });
      });
    } catch (error) {
      convertedFilesList.innerHTML =
        '<li class="list-group-item text-danger">Error loading files.</li>';
      console.error('Error fetching files:', error);
    }
  }

  // Initial fetch of files
  fetchConvertedFiles();

  // Load settings for conversion options
  const pageFormatSelect = document.getElementById('pageFormat');
  const pageOrientationSelect = document.getElementById('pageOrientation');
  const codeThemeSelect = document.getElementById('codeTheme');
  // ... add for text area form as well if they are separate
  const textPageFormatSelect = document.getElementById('textPageFormat');
  const textPageOrientationSelect = document.getElementById('textPageOrientation');
  const textCodeThemeSelect = document.getElementById('textCodeTheme');


  async function loadConversionSettings() {
    try {
      const response = await fetch('/settings');
      const settings = await response.json();

      // Populate Page Format
      populateSelect(pageFormatSelect, settings.pageFormats, settings.defaultPageFormat);
      populateSelect(textPageFormatSelect, settings.pageFormats, settings.defaultPageFormat);

      // Populate Page Orientation
      populateSelect(pageOrientationSelect, settings.pageOrientations, settings.defaultPageOrientation);
      populateSelect(textPageOrientationSelect, settings.pageOrientations, settings.defaultPageOrientation);
      
      // Populate Code Theme
      populateSelect(codeThemeSelect, settings.codeThemes, settings.defaultCodeTheme);
      populateSelect(textCodeThemeSelect, settings.codeThemes, settings.defaultCodeTheme);

      // Handle Colorblind Friendly option (if it's a checkbox)
      const colorBlindFriendlyCheckbox = document.getElementById('colorBlindFriendly');
      if (colorBlindFriendlyCheckbox && settings.colorBlindFriendlyAvailable) {
        // You might set a default or leave it as is
      }
      const textColorBlindFriendlyCheckbox = document.getElementById('textColorBlindFriendly');
      if (textColorBlindFriendlyCheckbox && settings.colorBlindFriendlyAvailable) {
        // You might set a default or leave it as is
      }

    } catch (error) {
      console.error('Error loading conversion settings:', error);
      // Optionally, display an error to the user in the settings panel
    }
  }

  function populateSelect(selectElement, options, defaultValue) {
    if (!selectElement) return;
    selectElement.innerHTML = ''; // Clear existing options
    options.forEach(optionValue => {
      const option = document.createElement('option');
      option.value = optionValue;
      option.textContent = optionValue.charAt(0).toUpperCase() + optionValue.slice(1); // Capitalize
      if (optionValue === defaultValue) {
        option.selected = true;
      }
      selectElement.appendChild(option);
    });
  }

  // Load settings when the page loads
  loadConversionSettings();

  // Live preview iframe update
  const markdownTextArea = document.getElementById('markdownText');
  const livePreviewFrame = document.getElementById('livePreviewFrame');
  const refreshPreviewButton = document.getElementById('refreshPreview');

  function updateLivePreview() {
    if (!livePreviewFrame) return;
    // A simple way to refresh is to change the src attribute, forcing a reload.
    // This assumes your /live-preview endpoint can take the markdown content
    // or that you have another mechanism to update it (e.g., via postMessage or a backend update).
    // For simplicity, we'll just reload the iframe which should pick up the latest example.md or default.
    // A more advanced implementation would send the current text area content to the server
    // or render it client-side if possible.
    livePreviewFrame.src = '/live-preview?cache_bust=' + new Date().getTime();
  }

  if (markdownTextArea && livePreviewFrame && refreshPreviewButton) {
    // Initial load
    // updateLivePreview(); // Uncomment if you want to load preview on page load

    // Refresh button
    refreshPreviewButton.addEventListener('click', updateLivePreview);

    // Optional: Update preview on text change (can be performance intensive)
    let debounceTimer;
    markdownTextArea.addEventListener('input', () => {
      // Debounce to avoid too many updates
      // clearTimeout(debounceTimer);
      // debounceTimer = setTimeout(updateLivePreview, 500);
      // For now, let's keep it manual with the refresh button to avoid complexity
    });
  }

  // Toast functionality
  const toastContainer = document.getElementById('toastContainer');
  function showToast(title, message, type = 'info') { // type can be primary, secondary, success, danger, warning, info, light, dark
    if (!toastContainer) {
      console.warn('Toast container not found. Cannot display toast.');
      alert(`${title}: ${message}`); // Fallback to alert
      return;
    }

    const toastId = 'toast-' + Date.now();
    const toastHtml = `
      <div id="${toastId}" class="toast align-items-center text-bg-${type} border-0" role="alert" aria-live="assertive" aria-atomic="true">
        <div class="d-flex">
          <div class="toast-body">
            <strong>${title}</strong><br>
            ${message}
          </div>
          <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
      </div>
    `;
    toastContainer.insertAdjacentHTML('beforeend', toastHtml);
    const toastElement = document.getElementById(toastId);
    const toast = new bootstrap.Toast(toastElement, { delay: 5000 }); // Auto-hide after 5 seconds
    toast.show();
    // Remove the toast from DOM after it's hidden to prevent clutter
    toastElement.addEventListener('hidden.bs.toast', () => {
      toastElement.remove();
    });
  }

  // Example: showToast('Info', 'This is an informational message.', 'info');
  // Example: showToast('Success!', 'Operation completed successfully.', 'success');
});

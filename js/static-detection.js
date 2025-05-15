// Este script se ejecuta cuando la página ha cargado completamente
document.addEventListener('DOMContentLoaded', function() {
    // Si existe la función de detección de entorno estático
    if (window.appEnvironment && typeof window.appEnvironment.isStaticHosting === 'function') {
        // Detectar si estamos en un entorno estático (GitHub Pages)
        if (window.appEnvironment.isStaticHosting()) {
            // Mostrar la alerta de entorno estático
            const staticAlert = document.getElementById('static-environment-alert');
            if (staticAlert) {
                staticAlert.classList.remove('d-none');
                staticAlert.innerHTML = `
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                <h4 class="alert-heading"><i class="fas fa-info-circle"></i> Entorno de GitHub Pages</h4>
                <p>Estás visualizando esta aplicación en GitHub Pages. <strong>La conversión de Markdown a PDF no está disponible</strong> en este entorno.</p>
                <hr>
                <p class="mb-0">Para utilizar todas las funcionalidades, <a href="https://github.com/cristopher-dev/markdown-to-pdf" class="alert-link">clona el repositorio</a> y ejecútalo localmente.</p>
                <div class="mt-2">
                    <button class="btn btn-sm btn-outline-primary show-examples-btn">Ver ejemplos pre-convertidos</button>
                </div>`;
                
                // Agregar evento al botón de ejemplos
                const showExamplesBtn = staticAlert.querySelector('.show-examples-btn');
                if (showExamplesBtn) {
                    showExamplesBtn.addEventListener('click', function() {
                        const filesArea = document.getElementById('files-area');
                        if (filesArea) {
                            filesArea.scrollIntoView({behavior: 'smooth'});
                        }
                    });
                }
            }
            
            // Modificar UI para entorno estático
            document.querySelectorAll('.dynamic-only').forEach(elem => {
                elem.classList.add('d-none');
            });
            
            document.querySelectorAll('.static-only').forEach(elem => {
                elem.classList.remove('d-none');
            });
            
            // Deshabilitar o mostrar advertencias en elementos que no funcionarán
            const convertButton = document.querySelector('button[type="submit"]');
            if (convertButton) {
                // Añadir un evento para mostrar un mensaje cuando se intente convertir
                convertButton.addEventListener('click', function(e) {
                    if (window.appEnvironment.isStaticHosting()) {
                        e.preventDefault();
                        // Usar modal de Bootstrap en lugar de alert nativo
                        const modalBody = `
                        <div class="modal-body">
                            <div class="text-center mb-4">
                                <i class="fas fa-server fa-3x text-muted mb-3"></i>
                                <h5>Funcionalidad no disponible</h5>
                            </div>
                            <p>La conversión de Markdown a PDF no está disponible en GitHub Pages debido a las limitaciones de los entornos de alojamiento estático.</p>
                            <p>Para utilizar esta función, necesitas:</p>
                            <ol>
                                <li>Clonar el repositorio: <code>git clone https://github.com/cristopher-dev/markdown-to-pdf.git</code></li>
                                <li>Instalar dependencias: <code>npm install</code></li>
                                <li>Ejecutar la aplicación: <code>npm start</code></li>
                            </ol>
                            <p>Puedes ver los ejemplos pre-convertidos en la sección "Archivos generados".</p>
                        </div>
                        <div class="modal-footer">
                            <a href="https://github.com/cristopher-dev/markdown-to-pdf" class="btn btn-primary" target="_blank">
                                <i class="fab fa-github"></i> Ver en GitHub
                            </a>
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
                        </div>`;
                        
                        // Mostrar modal
                        const modalEl = document.getElementById('static-mode-modal') || createInfoModal('static-mode-modal', 'Función no disponible en GitHub Pages', modalBody);
                        const modal = new bootstrap.Modal(modalEl);
                        modal.show();
                        
                        // Mostrar la alerta si se había cerrado
                        const staticAlert = document.getElementById('static-environment-alert');
                        if (staticAlert && staticAlert.classList.contains('d-none')) {
                            staticAlert.classList.remove('d-none');
                        }
                    }
                });
            }
            
            // Cargar archivos pre-convertidos
            fetchAndDisplayPreConvertedFiles();
        }
    }
});

// Función para crear un modal de información
function createInfoModal(id, title, bodyContent) {
    const modalDiv = document.createElement('div');
    modalDiv.className = 'modal fade';
    modalDiv.id = id;
    modalDiv.setAttribute('tabindex', '-1');
    modalDiv.setAttribute('aria-labelledby', `${id}Label`);
    modalDiv.setAttribute('aria-hidden', 'true');
    
    modalDiv.innerHTML = `
    <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="${id}Label">${title}</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            ${bodyContent}
        </div>
    </div>`;
    
    document.body.appendChild(modalDiv);
    return modalDiv;
}

// Función para cargar y mostrar archivos pre-convertidos
function fetchAndDisplayPreConvertedFiles() {
    fetch('public/files-list.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Error cargando la lista de archivos');
            }
            return response.json();
        })
        .then(data => {
            const filesContainer = document.getElementById('files-list');
            if (filesContainer && data.files && data.files.length) {
                filesContainer.innerHTML = '<h4 class="mb-3">Archivos pre-convertidos disponibles</h4>';
                
                const filesList = document.createElement('div');
                filesList.className = 'list-group';
                
                data.files.forEach(file => {
                    const extension = file.split('.').pop().toLowerCase();
                    let icon, color;
                    
                    // Determinar icono según extensión
                    if (extension === 'pdf') {
                        icon = 'fa-file-pdf';
                        color = 'danger';
                    } else if (extension === 'html') {
                        icon = 'fa-file-code';
                        color = 'primary';
                    } else {
                        icon = 'fa-file';
                        color = 'secondary';
                    }
                    
                    const item = document.createElement('a');
                    item.href = `public/${file}`;
                    item.className = `list-group-item list-group-item-action d-flex align-items-center`;
                    item.setAttribute('target', '_blank');
                    item.innerHTML = `
                        <i class="fas ${icon} text-${color} me-3"></i>
                        <span>${file}</span>
                        <span class="ms-auto">
                            <i class="fas fa-external-link-alt"></i>
                        </span>`;
                    
                    filesList.appendChild(item);
                });
                
                filesContainer.appendChild(filesList);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            const filesContainer = document.getElementById('files-list');
            if (filesContainer) {
                filesContainer.innerHTML = `
                <div class="alert alert-warning">
                    <i class="fas fa-exclamation-circle"></i> No se pudieron cargar los archivos pre-convertidos.
                </div>`;
            }
        });
}

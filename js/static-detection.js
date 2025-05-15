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
            }
            
            // Deshabilitar o mostrar advertencias en elementos que no funcionarán
            const convertButton = document.querySelector('button[type="submit"]');
            if (convertButton) {
                // Añadir un evento para mostrar un mensaje cuando se intente convertir
                convertButton.addEventListener('click', function(e) {
                    if (window.appEnvironment.isStaticHosting()) {
                        e.preventDefault();
                        alert('La conversión de Markdown a PDF no está disponible en GitHub Pages. Para utilizar esta función, clona el repositorio y ejecútalo localmente.');
                        
                        // Mostrar la alerta si se había cerrado
                        const staticAlert = document.getElementById('static-environment-alert');
                        if (staticAlert && staticAlert.classList.contains('d-none')) {
                            staticAlert.classList.remove('d-none');
                        }
                    }
                });
            }
        }
    }
});

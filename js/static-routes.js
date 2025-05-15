// Este archivo se ejecuta en GitHub Pages para simular el comportamiento de algunos endpoints del servidor

/**
 * Maneja simulaciones de rutas del servidor en GitHub Pages
 * 
 * Este archivo permite simular algunas funciones básicas del servidor 
 * cuando la aplicación se está ejecutando en GitHub Pages u otro entorno estático
 */

(function() {
  if (!window.appEnvironment || !window.appEnvironment.isStaticHosting()) {
    console.log('StaticRoutes: No se ejecuta en entorno estático');
    return; // Solo ejecutar en entorno estático
  }
  
  console.log('StaticRoutes: Iniciando simulación de rutas para entorno estático');
  
  // Interceptar fetch para simular rutas del servidor
  const originalFetch = window.fetch;
  
  window.fetch = async function(url, options) {
    const urlString = url.toString();
    
    // Simular ruta /list-files
    if (urlString.includes('/list-files') || urlString.includes('/public-files')) {
      console.log('StaticRoutes: Interceptada solicitud a /list-files');
      try {
        // Intentar cargar el archivo JSON estático que contiene la lista de archivos
        const filesListResponse = await originalFetch('public/files-list.json');
        if (filesListResponse.ok) {
          const filesData = await filesListResponse.json();
          
          // Formato que espera el cliente
          const response = {
            success: true,
            files: filesData.files || ['README.html', 'README.pdf']
          };
          
          // Crear una respuesta simulada
          return new Response(JSON.stringify(response), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          });
        }
      } catch (error) {
        console.error('StaticRoutes: Error cargando files-list.json', error);
      }
      
      // Respuesta por defecto si no se puede cargar el archivo JSON
      return new Response(JSON.stringify({
        success: true,
        files: ['README.html', 'README.pdf']
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Simular ruta /example
    if (urlString.includes('/example')) {
      console.log('StaticRoutes: Interceptada solicitud a /example');
      
      // Extraer parámetros de la URL
      const urlObj = new URL(urlString, window.location.origin);
      const colorBlindMode = urlObj.searchParams.get('colorBlindFriendly') === 'true';
      
      // Crear una respuesta simulada
      return new Response(JSON.stringify({
        success: true,
        filename: 'README.md',
        html: 'public/README.html', 
        pdf: 'public/README.pdf'
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Simular la ruta /convert (solo mostrar mensaje)
    if (urlString.includes('/convert') && options && options.method === 'POST') {
      console.log('StaticRoutes: Interceptada solicitud a /convert - No disponible en GitHub Pages');
      
      // Devolver mensaje indicando que la conversión no está disponible en GitHub Pages
      return new Response(JSON.stringify({
        success: false, 
        error: 'La conversión de Markdown a PDF no está disponible en el entorno de GitHub Pages. Esta funcionalidad requiere un servidor en ejecución.'
      }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Simular la ruta /delete-files
    if (urlString.includes('/delete-files/')) {
      console.log('StaticRoutes: Interceptada solicitud a /delete-files');
      
      // Verificar que sea método DELETE
      if (options && options.method === 'DELETE') {
        // Extraer el nombre base del archivo de la URL
        const baseName = urlString.split('/delete-files/')[1];
        
        // En entorno estático no podemos eliminar archivos realmente, así que simulamos una respuesta exitosa
        return new Response(JSON.stringify({
          success: true,
          message: `Simulación de eliminación: se simularía eliminar archivos ${baseName}.html y ${baseName}.pdf`
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      } else {
        // Si no es DELETE, devolvemos un error adecuado con instrucciones
        return new Response(JSON.stringify({
          success: false,
          error: 'Método no permitido. Usa DELETE para eliminar archivos.',
          message: 'En el entorno estático, solo se permite el método DELETE para esta ruta.'
        }), {
          status: 405,
          headers: { 
            'Content-Type': 'application/json',
            'Allow': 'DELETE'
          }
        });
      }
    }
    
    // Continuar con la solicitud fetch original para otras rutas
    return originalFetch(url, options);
  };
  
  console.log('StaticRoutes: Interceptación de rutas configurada correctamente');
})();

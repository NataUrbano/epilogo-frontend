const fs = require('fs');
const path = require('path');

// Rutas
const outputDir = path.join(__dirname, 'dist/epilogo-frontend');
const browserDir = path.join(outputDir, 'browser');
const indexPath = path.join(outputDir, 'index.html');

// Verificar que el directorio browser existe
if (!fs.existsSync(browserDir)) {
  console.error('Error: Browser directory not found!');
  process.exit(1);
}

// Crear archivo index.html de redirección en la raíz
const htmlContent = `<!DOCTYPE html>
<html>
  <head>
    <meta http-equiv="refresh" content="0;URL='./browser/index.html'" />
  </head>
  <body>
    <p>Redirecting to app...</p>
  </body>
</html>`;

fs.writeFileSync(indexPath, htmlContent);
console.log('✅ Created redirect index.html in output directory');

// Opcional: Copiar todos los archivos de browser al directorio raíz
// Esto es una garantía adicional, pero normalmente no es necesario con los rewrites
/*
fs.readdirSync(browserDir).forEach(file => {
  const sourcePath = path.join(browserDir, file);
  const targetPath = path.join(outputDir, file);
  
  if (fs.lstatSync(sourcePath).isDirectory() && file !== 'assets') {
    // No copiar directorios excepto assets
    return;
  }
  
  if (file === 'assets') {
    // Manejar la carpeta de assets si es necesario
    return;
  }
  
  fs.copyFileSync(sourcePath, targetPath);
  console.log(`Copied ${file} to output root`);
});
*/
// src/routes/mainRoutes.js
const express = require('express');
const fs = require('fs');
const path = require('path');
const MarkdownIt = require('markdown-it');
const mdFootnote = require('markdown-it-footnote');
const hljs = require('highlight.js');
const { convertMarkdownToPDF } = require('../services/conversionService'); // Import the conversion service

// Initialize MarkdownIt with plugins and highlighting options
const md = new MarkdownIt({
  html: true, // Enable HTML tags in source
  linkify: true, // Automatically convert URL-like text to links
  typographer: true, // Enable some smart quotes substitutions, etc.
  highlight: function (str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return (
          '<pre class="hljs"><code>' +
          hljs.highlight(str, { language: lang, ignoreIllegals: true }).value +
          '</code></pre>'
        );
      } catch (__) {}
    }
    return '<pre class="hljs"><code>' + md.utils.escapeHtml(str) + '</code></pre>'; // Fallback
  },
}).use(mdFootnote);

module.exports = PUBLIC_DIR_FOR_UPLOADS => {
  const router = express.Router();

  // Main route - serves index.html from src/public/views/
  router.get('/', (req, res) => {
    // __dirname here is /home/markdown-to-pdf/src/routes
    res.sendFile(path.join(__dirname, '..', 'public', 'views', 'index.html'));
  });

  // Route to list files in the public directory (project root)
  router.get('/list-files', (req, res) => {
    fs.readdir(PUBLIC_DIR_FOR_UPLOADS, (err, files) => {
      if (err) {
        console.error('Error reading public directory:', err);
        return res.status(500).json({ success: false, error: 'Error listing files.' });
      }
      const filteredFiles = files.filter(
        file => file.toLowerCase().endsWith('.pdf') || file.toLowerCase().endsWith('.html')
      );
      res.json({ success: true, files: filteredFiles });
    });
  });

  // Route to get details of files in the public directory (project root)
  router.get('/public-files', (req, res, next) => {
    try {
      const files = fs.readdirSync(PUBLIC_DIR_FOR_UPLOADS);
      const fileDetails = files
        .filter(file => file.endsWith('.html') || file.endsWith('.pdf'))
        .map(file => {
          const filePath = path.join(PUBLIC_DIR_FOR_UPLOADS, file);
          const stat = fs.statSync(filePath);
          return {
            name: file,
            type: path.extname(file).substring(1),
            size: stat.size,
            lastModified: stat.mtime,
          };
        })
        .sort((a, b) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime());

      res.json({ success: true, files: fileDetails });
    } catch (error) {
      next(error);
    }
  });

  // Route for the example
  router.get('/example', async (req, res, next) => {
    // Convert to async function
    const exampleMdFilename = 'example.md';
    const exampleHtmlFilename = 'example.html';
    const examplePdfFilename = 'example.pdf'; // Name for the PDF file
    const exampleMdPath = path.join(PUBLIC_DIR_FOR_UPLOADS, exampleMdFilename);
    const exampleHtmlPath = path.join(PUBLIC_DIR_FOR_UPLOADS, exampleHtmlFilename);
    const examplePdfPath = path.join(PUBLIC_DIR_FOR_UPLOADS, examplePdfFilename); // Path for the PDF file

    try {
      // 1. Ensure example.md exists
      if (!fs.existsSync(exampleMdPath)) {
        const defaultContent =
          "# Markdown Example\n\nThis is an example file for the preview functionality.\n\n## Features\n\n*   Lists\n*   **Bold**\n*   *Italics*\n\n[Visit Google](https://www.google.com)\n\n## Code Block\n\n```javascript\nfunction greet(name) {\n  console.log('Hello, ' + name + '!');\n}\ngreet('World');\n```\n";
        fs.writeFileSync(exampleMdPath, defaultContent, 'utf8');
        console.log(`File '${exampleMdFilename}' created in '${PUBLIC_DIR_FOR_UPLOADS}'`);
      }

      // 2. Read example.md
      const markdownContent = fs.readFileSync(exampleMdPath, 'utf8');

      // 3. Convert Markdown to HTML
      const htmlBodyContent = md.render(markdownContent);

      // 4. Create the full HTML content
      // Assume you have CSS in /assets/css/ for general styles and highlight.js
      const fullHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Markdown Preview - Example</title>
    <link rel="stylesheet" href="/assets/css/style.css"> 
    <link rel="stylesheet" href="/assets/css/custom-styles.css">
    <!-- If you have specific CSS for highlight.js, add it here, e.g.: -->
    <!-- <link rel="stylesheet" href="/assets/css/highlight-theme.css"> -->
</head>
<body>
    <div class="markdown-body container"> <!-- 'markdown-body' is common for GitHub Flavored Markdown styles -->
        ${htmlBodyContent}
    </div>
</body>
</html>
      `;

      // 5. Write example.html
      fs.writeFileSync(exampleHtmlPath, fullHtml, 'utf8');
      console.log(`File '${exampleHtmlFilename}' created/updated in '${PUBLIC_DIR_FOR_UPLOADS}'`);

      // 6. Convert example.md to PDF
      const customStylesPath = path.join(__dirname, '..', 'public', 'css', 'custom-styles.css');
      const conversionOptions = {
        // Basic options for the example PDF
        pageSize: 'A4',
        codeTheme: 'github', // Or the default theme you prefer
        // You can add more options if necessary
      };

      // The outputBaseName should not include the .pdf extension, the service adds it.
      const outputBaseNameForPdf = path.join(
        PUBLIC_DIR_FOR_UPLOADS,
        path.basename(exampleMdFilename, '.md')
      );

      await convertMarkdownToPDF(
        markdownContent,
        outputBaseNameForPdf, // e.g.: /path/to/public/example (without .pdf)
        customStylesPath,
        conversionOptions
      );
      console.log(`File '${examplePdfFilename}' created/updated in '${PUBLIC_DIR_FOR_UPLOADS}'`);

      // 7. Respond with JSON
      res.json({
        success: true,
        markdownFile: exampleMdFilename,
        htmlFile: exampleHtmlFilename,
        pdfFile: examplePdfFilename, // Add the PDF file name to the response
        message: `Example files '${exampleMdFilename}', '${exampleHtmlFilename}', and '${examplePdfFilename}' ensured and ready.`,
      });
    } catch (error) {
      console.error(`Error processing the /example route:`, error);
      next(error);
    }
  });

  return router;
};

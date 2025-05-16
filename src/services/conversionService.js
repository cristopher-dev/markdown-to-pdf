// filepath: /home/markdown-to-pdf/convert.js
require('dotenv').config(); // Load environment variables
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const markdownIt = require('markdown-it')({
  html: true, // Enable HTML tags in source
  linkify: true, // Autoconvert URL-like text to links
  typographer: true, // Enable some smart quotes substitutions, etc.
  highlight: function (str, lang) {
    // Add syntax highlighting
    if (lang && hljs.getLanguage(lang)) {
      try {
        return (
          '<pre class="hljs"><code>' +
          hljs.highlight(str, { language: lang, ignoreIllegals: true }).value +
          '</code></pre>'
        );
      } catch (__) {}
    }
    return '<pre class="hljs"><code>' + markdownIt.utils.escapeHtml(str) + '</code></pre>';
  },
}).use(require('markdown-it-footnote')); // Add support for footnotes
const hljs = require('highlight.js');

// Ensure that the public directory exists at the project root
const ensurePublicDirectoryExists = outputBaseName => {
  const publicDir = path.dirname(outputBaseName);
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }
};

/**
 * Converts a Markdown file to PDF
 * @param {string} markdownContent - Content of the Markdown file
 * @param {string} outputBaseName - Base name for output files (without extension)
 * @param {string} customCSSPath - Path to custom CSS styles file
 * @param {Object} options - Additional conversion options
 * @param {string} options.pageSize - Page size (A4, Letter, Legal)
 * @param {string} options.orientation - Page orientation (portrait, landscape)
 * @param {string} options.marginTop - Top margin
 * @param {string} options.marginBottom - Bottom margin
 * @param {string} options.marginLeft - Left margin
 * @param {string} options.marginRight - Right margin
 * @param {string} options.customCSS - Custom CSS
 * @param {string} options.headerTemplate - Header template
 * @param {string} options.footerTemplate - Footer template
 * @param {string} options.fontSize - Font size
 * @returns {Promise<{html: string, pdf: string}>} - Paths to generated files
 */
async function convertMarkdownToPDF(
  markdownContent,
  outputBaseName, // e.g., /home/markdown-to-pdf/public/fileName
  customCSSPath, // e.g., /home/markdown-to-pdf/src/public/css/custom-styles.css
  options = {}
) {
  ensurePublicDirectoryExists(outputBaseName);

  const {
    pageSize = process.env.DEFAULT_PAGE_SIZE || 'A4',
    orientation = process.env.DEFAULT_ORIENTATION || 'portrait',
    marginTop = process.env.DEFAULT_MARGIN_TOP || '20mm',
    marginBottom = process.env.DEFAULT_MARGIN_BOTTOM || '20mm',
    marginLeft = process.env.DEFAULT_MARGIN_LEFT || '20mm',
    marginRight = process.env.DEFAULT_MARGIN_RIGHT || '20mm',
    customCSS = '',
    headerTemplate = '',
    footerTemplate = '',
    fontSize = process.env.DEFAULT_FONT_SIZE || '16px', // Add fontSize with a default value
  } = options;

  const htmlContent = markdownIt.render(markdownContent);

  let customCSSText = '';
  if (customCSSPath && fs.existsSync(customCSSPath)) {
    customCSSText = fs.readFileSync(customCSSPath, 'utf8');
  }

  const fullHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>${path.basename(outputBaseName)}</title>
      <style>
        /* Base styles */
        body { 
          font-family: sans-serif; 
          margin: 0; 
          padding: 20px; 
          font-size: ${fontSize}; /* Apply dynamic font size to body */
        }
        /* Ensure markdown-body inherits font-size or has its own if needed */
        article.markdown-body { 
          margin: auto; 
          /* font-size: ${fontSize}; /* Optionally set here as well if body inheritance is not enough */
        }
        img { max-width: 100%; height: auto; }
        table { border-collapse: collapse; width: 100%; margin-bottom: 1em; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
        blockquote { border-left: 4px solid #ccc; padding-left: 10px; color: #666; margin-left: 0; }
        hr { border: none; border-top: 1px solid #eee; margin: 2em 0; }
        /* Code block styles */
        pre { background-color: #f5f5f5; padding: 10px; border-radius: 5px; overflow-x: auto; }
        code { font-family: "Courier New", Courier, monospace; }
        /* Custom user styles from custom-styles.css */
        ${customCSSText}
        /* Custom CSS from user input */
        ${customCSS}
      </style>
    </head>
    <body>
      <article class="markdown-body">
        ${htmlContent}
      </article>
    </body>
    </html>
  `;

  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--single-process',
      '--font-render-hinting=none',
    ],
    ignoreDefaultArgs: ['--enable-automation'],
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
  });
  const page = await browser.newPage();
  await page.setContent(fullHtml, { waitUntil: 'networkidle0' });

  const pdfPath = `${outputBaseName}.pdf`;
  const htmlPath = `${outputBaseName}.html`; // Also save the processed HTML

  await page.pdf({
    path: pdfPath,
    format: pageSize,
    landscape: orientation === 'landscape',
    printBackground: true,
    margin: {
      top: marginTop,
      right: marginRight,
      bottom: marginBottom,
      left: marginLeft,
    },
    displayHeaderFooter: !!(headerTemplate || footerTemplate),
    headerTemplate: headerTemplate || '<div></div>', // Puppeteer requires a string, even empty
    footerTemplate: footerTemplate || '<div></div>',
  });

  await browser.close();

  // Save the full HTML that was used to generate the PDF (for preview or debugging)
  fs.writeFileSync(htmlPath, fullHtml);

  return { pdf: pdfPath, html: htmlPath };
}

// If executed directly (not as a module)
if (require.main === module) {
  (async () => {
    try {
      // Read the specified file or default to README.md
      const inputFile = process.argv[2] || 'README.md';
      console.log(`🔍 Reading Markdown file: ${inputFile}`);

      const markdownContent = fs.readFileSync(inputFile, 'utf8');

      // Get output base name from input filename (without extension)
      const outputBaseName = process.argv[3] || 'output';

      await convertMarkdownToPDF(markdownContent, outputBaseName);
    } catch (error) {
      console.error('❌ Error running conversion:', error);
    }
  })();
}

module.exports = { convertMarkdownToPDF };

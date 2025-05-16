// src/controllers/conversionController.js
const fs = require('fs');
const path = require('path');
const { convertMarkdownToPDF } = require('../services/conversionService');
const { generatePreviewTemplate } = require('../utils/previewTemplate');

// This function needs PUBLIC_DIR_FOR_UPLOADS to know where to save the files
const handleConversion = PUBLIC_DIR_FOR_UPLOADS => async (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({ success: false, error: 'No file was uploaded.' });
  }

  try {
    const filePath = req.file.path;
    const fileName = req.file.originalname;
    const baseName = path.basename(fileName, path.extname(fileName));
    // Ensure outputBaseName points to the correct public directory at the project root
    const outputBaseName = path.join(PUBLIC_DIR_FOR_UPLOADS, baseName);

    const markdownContent = fs.readFileSync(filePath, 'utf8');

    const conversionOptions = {
      pageSize: req.body.pageSize || 'A4',
      codeTheme: req.body.codeTheme || 'github',
      colorBlindFriendly: req.body.colorBlindFriendly === 'true' || false,
      orientation: req.body.orientation || 'portrait',
      marginTop: req.body.marginTop,
      marginBottom: req.body.marginBottom,
      marginLeft: req.body.marginLeft,
      marginRight: req.body.marginRight,
      customCSS: req.body.customCSS, // This will be passed to the conversion service
      headerTemplate: req.body.headerTemplate,
      footerTemplate: req.body.footerTemplate,
      fontSize: req.body.fontSize, // Add fontSize to conversionOptions
    };

    // The path to custom-styles.css must now be relative to the new public location
    const customStylesPath = path.join(__dirname, '..', 'public', 'css', 'custom-styles.css');

    const results = await convertMarkdownToPDF(
      markdownContent,
      outputBaseName,
      customStylesPath, // Updated path to custom-styles.css
      conversionOptions
    );

    const rawHtmlContent = fs.readFileSync(results.html, 'utf8');
    const previewContent = generatePreviewTemplate(fileName, rawHtmlContent, {
      codeTheme: conversionOptions.codeTheme,
      colorBlindFriendly: conversionOptions.colorBlindFriendly,
    });
    fs.writeFileSync(results.html, previewContent);

    fs.unlink(filePath, err => {
      if (err) console.error(`Error deleting temporary file: ${filePath}`, err);
    });

    res.json({
      success: true,
      filename: fileName,
      // Paths returned to the client must be relative to the web server root
      html: path.join('public', path.basename(results.html)), // e.g., /public/name.html
      pdf: path.join('public', path.basename(results.pdf)), // e.g., /public/name.pdf
    });
  } catch (error) {
    if (req.file && req.file.path && fs.existsSync(req.file.path)) {
      fs.unlink(req.file.path, err => {
        if (err)
          console.error(
            `Error deleting temporary file after conversion error: ${req.file.path}`,
            err
          );
      });
    }
    next(error);
  }
};

const handleExampleConversion = PUBLIC_DIR_FOR_UPLOADS => async (req, res, next) => {
  try {
    // README.md is located at the project root
    const readmePath = path.join(__dirname, '..', '..', 'README.md');
    if (!fs.existsSync(readmePath)) {
      return res.status(404).json({ success: false, error: 'README.md file not found.' });
    }

    const markdownContent = fs.readFileSync(readmePath, 'utf8');
    const outputBaseName = path.join(PUBLIC_DIR_FOR_UPLOADS, 'README');
    const colorBlindMode = req.query.colorBlindFriendly === 'true';
    const codeTheme = req.query.codeTheme || 'github';

    const conversionOptions = {
      pageSize: 'A4',
      codeTheme: codeTheme,
      colorBlindFriendly: colorBlindMode,
    };

    const customStylesPath = path.join(__dirname, '..', 'public', 'css', 'custom-styles.css');

    const results = await convertMarkdownToPDF(
      markdownContent,
      outputBaseName,
      customStylesPath,
      conversionOptions
    );

    const rawHtmlContent = fs.readFileSync(results.html, 'utf8');
    const previewContent = generatePreviewTemplate('README.md', rawHtmlContent, {
      codeTheme: codeTheme,
      colorBlindFriendly: colorBlindMode,
    });
    fs.writeFileSync(results.html, previewContent);

    res.json({
      success: true,
      filename: 'README.md',
      html: path.join('public', path.basename(results.html)),
      pdf: path.join('public', path.basename(results.pdf)),
    });
  } catch (error) {
    next(error);
  }
};

const handleDeleteFiles = PUBLIC_DIR_FOR_UPLOADS => (req, res, next) => {
  try {
    const basename = req.params.basename;
    if (!basename || typeof basename !== 'string' || basename.includes('..')) {
      return res.status(400).json({ success: false, error: 'Invalid filename.' });
    }

    const htmlPath = path.join(PUBLIC_DIR_FOR_UPLOADS, `${basename}.html`);
    const pdfPath = path.join(PUBLIC_DIR_FOR_UPLOADS, `${basename}.pdf`);
    let deletedFiles = [];
    let errors = [];

    [htmlPath, pdfPath].forEach(filePath => {
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
          deletedFiles.push(path.basename(filePath));
        } catch (err) {
          errors.push(`Error deleting ${path.basename(filePath)}: ${err.message}`);
        }
      }
    });

    if (errors.length > 0) {
      return res.status(500).json({ success: false, error: errors.join('; ') });
    }
    if (deletedFiles.length === 0) {
      return res.status(404).json({ success: false, error: 'No files found to delete.' });
    }
    res.json({ success: true, message: `Files deleted: ${deletedFiles.join(', ')}` });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  handleConversion,
  handleExampleConversion,
  handleDeleteFiles,
};

const { app, BrowserWindow, ipcMain, dialog, shell, protocol } = require('electron');
let autoUpdater = null; // lazy-required when packaged
const path = require('path');
const fs = require('fs');
const storage = require('./storage');
const simpleGit = require('simple-git');

// Set app name for notifications
app.name = 'Markedit';

// Production/development flag
const isDev = !app.isPackaged;

let mainWindow;
let rpcClient = null;
let rpcReady = false;
let rpcStartTs = Math.floor(Date.now() / 1000);
let lastPresence = null; // cache last activity to re-apply on reconnect
let rpcImageKey = 'icon'; // default asset key; can be overridden via settings.rpcAssetKey
let rpcEnabled = true; // togglable via settings
let pendingFileToOpen = null; // Store file path opened from external source

// Initialize Discord Rich Presence (best-effort)
async function initRichPresence() {
  if (!rpcEnabled) {
    if (isDev) console.log('[RPC] disabled; not initializing');
    return;
  }
  try {
    const RPC = require('@xhayper/discord-rpc');
    rpcClient = new RPC.Client({ clientId: '1435353105666412744', transport: 'ipc' });

    rpcClient.on('ready', () => {
      rpcReady = true;
      if (isDev) console.log('[RPC] ready');
      // Re-apply last presence or default to home
      if (lastPresence) {
        try { applyActivity(lastPresence); } catch (e) { if (isDev) console.warn('[RPC] setActivity on ready failed:', e?.message || e); }
      } else {
        setPresenceHome();
      }
    });

    rpcClient.on('connected', () => { if (isDev) console.log('[RPC] connected'); });
    rpcClient.on('error', (e) => { if (isDev) console.warn('[RPC] error:', e?.message || e); });
    rpcClient.on('disconnected', () => {
      rpcReady = false;
      if (isDev) console.warn('[RPC] disconnected, retrying in 3s');
      // try to reconnect after a delay if still enabled
      if (rpcEnabled) setTimeout(() => initRichPresence(), 3000);
    });

    await rpcClient.login();
  } catch (err) {
    if (isDev) console.warn('Discord RPC init failed:', err.message || err);
    // retry later in case Discord starts after the app
    if (rpcEnabled) setTimeout(() => initRichPresence(), 5000);
  }
}

function applyActivity(activity) {
  if (!rpcClient || !rpcReady) return;
  // Support both client.setActivity and client.user.setActivity depending on lib version
  if (typeof rpcClient.setActivity === 'function') {
    rpcClient.setActivity(activity);
  } else if (rpcClient.user && typeof rpcClient.user.setActivity === 'function') {
    rpcClient.user.setActivity(activity);
  } else {
    if (isDev) console.warn('[RPC] No setActivity method available');
  }
}

function setPresenceHome() {
  if (!rpcEnabled || !rpcClient || !rpcReady) return;
  const activity = {
    details: 'In the home screen',
    state: 'MarkEdit - V1.3.0',
    timestamps: { start: rpcStartTs * 1000 },
  assets: { large_image: rpcImageKey, large_text: 'Markedit' },
    buttons: [{ label: 'Download Markedit', url: 'https://github.com/naplon74/markedit' }]
  };
  lastPresence = activity;
  try { applyActivity(activity); } catch (e) { if (isDev) console.warn('[RPC] setActivity(home) failed:', e?.message || e); }
}

function setPresenceEditing(filename) {
  if (!rpcEnabled || !rpcClient || !rpcReady) return;
  const activity = {
    details: `Editing ${filename || 'Untitled'}`,
    timestamps: { start: rpcStartTs * 1000 },
  assets: { large_image: rpcImageKey, large_text: 'Markedit' },
    buttons: [{ label: 'Download Markedit', url: 'https://github.com/naplon74/markedit' }]
  };
  lastPresence = activity;
  try { applyActivity(activity); } catch (e) { if (isDev) console.warn('[RPC] setActivity(editing) failed:', e?.message || e); }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    frame: false,
    icon: path.join(__dirname, '..', 'assets', 'icon.ico'),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      devTools: true // Enable DevTools for debugging
    },
    backgroundColor: '#1e1e1e',
    titleBarStyle: 'hidden'
  });

  // Check if onboarding is needed
  const settings = storage.getSettings();
  if (settings && settings.rpcAssetKey) {
    rpcImageKey = settings.rpcAssetKey;
  }
  if (settings && Object.prototype.hasOwnProperty.call(settings, 'rpcEnabled')) {
    rpcEnabled = !!settings.rpcEnabled;
  }
  
  // Check if we have a pending file to open
  if (pendingFileToOpen) {
    // First load the editor page, then import the file after it's ready
    mainWindow.loadFile('editor.html');
    mainWindow.webContents.once('did-finish-load', () => {
      importAndOpenFile(pendingFileToOpen);
      pendingFileToOpen = null;
    });
  } else if (!settings.username) {
    mainWindow.loadFile('onboarding.html');
  } else {
    mainWindow.loadFile('home.html');
  }
  if (rpcEnabled) initRichPresence();
}

// -------------------- Auto Updater --------------------
function initAutoUpdater() {
  if (!app.isPackaged) {
    if (isDev) console.log('[Updater] Skipping auto updater in development');
    return;
  }

  try {
    // Lazy require to avoid dev-time crashes if module isn't installed yet
    if (!autoUpdater) {
      const eu = require('electron-updater');
      autoUpdater = eu.autoUpdater;
    }
    autoUpdater.autoDownload = true;
    autoUpdater.autoInstallOnAppQuit = true;
    
    // Forward events to renderer
    autoUpdater.on('checking-for-update', () => {
      if (isDev) console.log('[Updater] Checking for updates...');
      mainWindow?.webContents.send('update-status', { status: 'checking' });
    });
    autoUpdater.on('update-available', (info) => {
      if (isDev) console.log('[Updater] Update available:', info?.version);
      mainWindow?.webContents.send('update-available', info);
    });
    autoUpdater.on('update-not-available', (info) => {
      if (isDev) console.log('[Updater] No updates available');
      mainWindow?.webContents.send('update-not-available', info);
    });
    autoUpdater.on('error', (err) => {
      if (isDev) console.warn('[Updater] Error:', err?.message || err);
      mainWindow?.webContents.send('update-error', { message: err?.message || String(err) });
    });
    autoUpdater.on('download-progress', (progress) => {
      if (isDev) console.log('[Updater] Download progress:', Math.floor(progress?.percent || 0) + '%');
      mainWindow?.webContents.send('download-progress', progress);
    });
    autoUpdater.on('update-downloaded', (info) => {
      if (isDev) console.log('[Updater] Update downloaded:', info?.version);
      mainWindow?.webContents.send('update-downloaded', info);
    });

    // Auto-check for updates 5 seconds after window loads
    setTimeout(() => {
      if (isDev) console.log('[Updater] Starting automatic update check...');
      autoUpdater.checkForUpdates().catch(err => {
        if (isDev) console.warn('[Updater] Auto-check failed:', err?.message || err);
      });
    }, 5000);
  } catch (e) {
    if (isDev) console.warn('[Updater] init failed:', e?.message || e);
  }
}

// IPC Handlers
ipcMain.on('minimize-window', () => {
  if (mainWindow) mainWindow.minimize();
});

ipcMain.on('maximize-window', () => {
  if (mainWindow) {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  }
});

ipcMain.on('close-window', () => {
  if (mainWindow) {
    mainWindow.webContents.send('request-close');
  }
});

ipcMain.on('confirm-close', () => {
  if (mainWindow) {
    // Before closing, if current file is an untouched 'Untitled' empty, delete it
    try {
      mainWindow.webContents.executeJavaScript(`(function(){
        try {
          // Only check if we're on editor page
          const onEditorPage = !!document.getElementById('file-title') && !!document.getElementById('markdown-input');
          if (!onEditorPage) {
            return { shouldDelete: false };
          }
          
          const id = localStorage.getItem('currentFileId');
          const title = (document.getElementById('file-title')?.value || '').trim();
          const content = (document.getElementById('markdown-input')?.value || '').trim();
          
          // Only delete if truly empty: no content AND (no title OR title is "Untitled")
          const shouldDelete = id && content === '' && (title === '' || title === 'Untitled');
          
          return { id, title, content, shouldDelete };
        } catch (e) { 
          console.error('confirm-close check error:', e);
          return { shouldDelete: false }; 
        }
      })();`).then(async (state) => {
        try {
          if (isDev) console.log('[Close] File state:', state);
          if (state && state.shouldDelete && state.id) {
            if (isDev) console.log('[Close] Deleting empty file:', state.id);
            await storage.deleteFile(state.id);
          }
        } catch (e) {
          if (isDev) console.error('[Close] Delete failed:', e);
        }
        mainWindow.destroy();
      });
    } catch (e) {
      if (isDev) console.error('[Close] executeJavaScript failed:', e);
      mainWindow.destroy();
    }
  }
});

ipcMain.on('load-page', (event, page) => {
  if (mainWindow) mainWindow.loadFile(page);
  if (page === 'home.html') setPresenceHome();
});

ipcMain.handle('get-settings', () => {
  return storage.getSettings();
});

ipcMain.handle('load-settings', () => {
  return storage.getSettings();
});

ipcMain.handle('save-settings', (event, settings) => {
  // Track toggles and apply side-effects
  const prev = storage.getSettings() || {};
  storage.saveSettings(settings);

  // Handle RPC asset key change
  if (settings && settings.rpcAssetKey) {
    rpcImageKey = settings.rpcAssetKey;
    if (lastPresence) {
      lastPresence.assets = Object.assign({}, lastPresence.assets, { large_image: rpcImageKey });
      try { applyActivity(lastPresence); } catch {}
    }
  }

  // Handle RPC enabled toggle
  const newEnabled = settings && Object.prototype.hasOwnProperty.call(settings, 'rpcEnabled') ? !!settings.rpcEnabled : true;
  if (newEnabled !== rpcEnabled) {
    rpcEnabled = newEnabled;
    if (!rpcEnabled) {
      // Disable: try to clear activity and destroy client
      try {
        if (rpcClient) {
          if (typeof rpcClient.clearActivity === 'function') {
            rpcClient.clearActivity();
          } else if (typeof rpcClient.setActivity === 'function') {
            rpcClient.setActivity();
          }
          if (typeof rpcClient.destroy === 'function') rpcClient.destroy();
        }
      } catch {}
      rpcClient = null;
      rpcReady = false;
      lastPresence = null;
    } else {
      // Enable: re-init
      initRichPresence();
    }
  }

  return true;
});

ipcMain.handle('get-recent-files', () => {
  return storage.getRecentFiles();
});

ipcMain.handle('save-file', (event, fileData) => {
  return storage.saveFile(fileData);
});

ipcMain.handle('load-file', (event, fileId) => {
  return storage.loadFile(fileId);
});

ipcMain.handle('create-new-file', () => {
  return storage.createNewFile();
});

ipcMain.handle('delete-file', (event, fileId) => {
  return storage.deleteFile(fileId);
});

ipcMain.handle('rename-file', (event, fileId, newTitle) => {
  return storage.renameFile(fileId, newTitle);
});

ipcMain.handle('auto-save', (event, fileId, content) => {
  return storage.autoSave(fileId, content);
});

// Danger zone: clear all cached data and files
ipcMain.handle('clear-all-data', async () => {
  try {
    const userDataPath = app.getPath('userData');
    const targets = [
      path.join(userDataPath, 'files'),
      path.join(userDataPath, 'drafts'),
      path.join(userDataPath, 'images'),
      path.join(userDataPath, 'git-repos')
    ];
    for (const dir of targets) {
      try { if (fs.existsSync(dir)) fs.rmSync(dir, { recursive: true, force: true }); } catch (e) { if (isDev) console.warn('Failed to remove', dir, e?.message || e); }
    }
    // Recreate required base directories
    try { fs.mkdirSync(path.join(userDataPath, 'files'), { recursive: true }); } catch {}
    return { success: true };
  } catch (e) {
    if (isDev) console.error('clear-all-data failed:', e);
    return { success: false, error: e?.message || String(e) };
  }
});

ipcMain.handle('export-file', async (event, content, title) => {
  const { filePath, format } = await dialog.showSaveDialog(mainWindow, {
    title: 'Export File',
    defaultPath: `${title || 'document'}.md`,
    filters: [
      { name: 'Markdown', extensions: ['md'] },
      { name: 'Text', extensions: ['txt'] },
      { name: 'HTML', extensions: ['html'] },
      { name: 'PDF', extensions: ['pdf'] },
      { name: 'Word Document', extensions: ['docx'] }
    ]
  });

  if (filePath) {
    try {
      let fileContent = content;
      
      // If exporting as PDF or HTML, convert markdown to HTML
      if (filePath.endsWith('.pdf')) {
        const { marked } = require('marked');
        marked.setOptions({
          breaks: true,
          gfm: true,
          headerIds: true,
          mangle: false
        });
        const printHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${title || 'Document'}</title>
  <style>
    html, body { height: 100%; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      max-width: 800px;
      margin: 40px auto;
      padding: 20px;
      line-height: 1.6;
      color: #111;
      background: #fff;
      white-space: normal;
      word-wrap: break-word;
      overflow-wrap: anywhere;
    }
    p, li, td, th, blockquote { white-space: normal; word-break: break-word; overflow-wrap: anywhere; }
    h1, h2, h3, h4, h5, h6 { color: #111; page-break-after: avoid; }
    a { color: #0a66c2; text-decoration: none; }
    code { background: #f4f4f4; padding: 2px 6px; border-radius: 3px; }
    pre { background: #f4f4f4; padding: 16px; border-radius: 6px; overflow-x: auto; white-space: pre-wrap; word-break: break-word; }
    blockquote { border-left: 4px solid #ddd; padding-left: 16px; color: #555; }
    table { border-collapse: collapse; width: 100%; }
    th, td { border: 1px solid #ddd; padding: 8px 12px; vertical-align: top; }
    th { background: #fafafa; }
    img { max-width: 100%; height: auto; }
    hr { border: none; border-top: 1px solid #ddd; margin: 24px 0; }
  </style>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <meta http-equiv="Content-Security-Policy" content="default-src 'self' 'unsafe-inline' data:; img-src data: *;">
  
</head>
<body>
${marked.parse(content)}
</body>
</html>`;

        // Render HTML to PDF using an offscreen BrowserWindow
        const pdfWindow = new BrowserWindow({
          show: false,
          webPreferences: {
            offscreen: true
          },
          backgroundColor: '#ffffff'
        });

        await pdfWindow.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(printHtml));

        const pdfData = await pdfWindow.webContents.printToPDF({
          printBackground: true,
          pageSize: 'A4',
          landscape: false,
          margins: {
            marginType: 'default'
          }
        });

        fs.writeFileSync(filePath, pdfData);
        pdfWindow.destroy();
        return { success: true, path: filePath, format };
      }

      // If exporting as HTML, convert markdown to HTML
      if (filePath.endsWith('.html')) {
        const { marked } = require('marked');
        marked.setOptions({
          breaks: true,
          gfm: true,
          headerIds: true,
          mangle: false
        });
        fileContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${title || 'Document'}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; line-height: 1.6; }
    code { background: #f4f4f4; padding: 2px 6px; border-radius: 3px; }
    pre { background: #f4f4f4; padding: 16px; border-radius: 6px; overflow-x: auto; }
    blockquote { border-left: 4px solid #ddd; padding-left: 16px; color: #666; }
  </style>
</head>
<body>
${marked.parse(content)}
</body>
</html>`;
      }

      // If exporting as DOCX, convert markdown to HTML then to Word document
      if (filePath.endsWith('.docx')) {
        const { marked } = require('marked');
        const htmlDocx = require('html-docx-js-typescript');
        
        marked.setOptions({
          breaks: true,
          gfm: true,
          headerIds: true,
          mangle: false
        });

        const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${title || 'Document'}</title>
  <style>
    body { font-family: Calibri, Arial, sans-serif; font-size: 11pt; line-height: 1.5; }
    h1 { font-size: 20pt; font-weight: bold; margin-top: 12pt; margin-bottom: 6pt; }
    h2 { font-size: 16pt; font-weight: bold; margin-top: 10pt; margin-bottom: 4pt; }
    h3 { font-size: 14pt; font-weight: bold; margin-top: 8pt; margin-bottom: 3pt; }
    h4, h5, h6 { font-size: 12pt; font-weight: bold; margin-top: 6pt; margin-bottom: 2pt; }
    p { margin-top: 0pt; margin-bottom: 8pt; }
    code { font-family: 'Courier New', monospace; background: #f0f0f0; padding: 2px 4px; }
    pre { font-family: 'Courier New', monospace; background: #f0f0f0; padding: 8pt; margin: 8pt 0; }
    blockquote { border-left: 3pt solid #ccc; padding-left: 12pt; margin-left: 0; color: #666; }
    table { border-collapse: collapse; width: 100%; margin: 8pt 0; }
    th, td { border: 1pt solid #ccc; padding: 4pt 8pt; text-align: left; }
    th { background: #f0f0f0; font-weight: bold; }
    ul, ol { margin-top: 0pt; margin-bottom: 8pt; padding-left: 24pt; }
    li { margin-bottom: 4pt; }
  </style>
</head>
<body>
${marked.parse(content)}
</body>
</html>`;

        const docxBuffer = await htmlDocx.asBlob(htmlContent);
        fs.writeFileSync(filePath, Buffer.from(docxBuffer));
        return { success: true, path: filePath, format: 'docx' };
      }
      
      fs.writeFileSync(filePath, fileContent, 'utf8');
      return { success: true, path: filePath, format };
    } catch (error) {
      if (isDev) console.error('Error exporting file:', error);
      return { success: false, error: error.message };
    }
  }
  
  return { success: false, cancelled: true };
});
// Open external links (e.g., Download Markedit)
ipcMain.on('open-external', (event, url) => {
  if (url) {
    shell.openExternal(url);
  }
});

// Updater IPC
ipcMain.on('check-for-updates', async () => {
  if (!app.isPackaged) {
    mainWindow?.webContents.send('update-error', { message: 'Updater disabled in development.' });
    return;
  }
  try {
    if (!autoUpdater) initAutoUpdater();
    await autoUpdater.checkForUpdates();
  } catch (e) {
    mainWindow?.webContents.send('update-error', { message: e?.message || String(e) });
  }
});

ipcMain.on('quit-and-install', () => {
  try {
    if (autoUpdater) {
      // quitAndInstall(isSilent, isForceRunAfter)
      // false = show installation, true = force run after install
      autoUpdater.quitAndInstall(false, true);
    }
  } catch (e) {
    if (isDev) console.warn('[Updater] quitAndInstall failed:', e?.message || e);
  }
});

// Rich Presence updates from renderers
ipcMain.on('rpc-set-home', () => setPresenceHome());
ipcMain.on('rpc-set-editing', (e, filename) => setPresenceEditing(filename));

// Import a specific external path (used by drag & drop)
ipcMain.handle('import-external', async (_e, externalPath) => {
  try {
    if (!externalPath || !fs.existsSync(externalPath)) return { success: false, error: 'File not found' };
    const existing = storage.findFileBySourcePath(externalPath);
    if (existing && existing.id) return { success: true, fileId: existing.id, reused: true };
    const content = fs.readFileSync(externalPath, 'utf8');
    const fileName = path.basename(externalPath, path.extname(externalPath));
    const fileData = storage.createNewFile();
    if (!fileData) return { success: false, error: 'Failed to create file' };
    fileData.title = fileName; fileData.content = content; fileData.sourcePath = externalPath;
    storage.saveFile(fileData);
    return { success: true, fileId: fileData.id, reused: false };
  } catch (e) {
    if (isDev) console.error('import-external failed:', e);
    return { success: false, error: e?.message || String(e) };
  }
});


ipcMain.handle('import-file', async () => {
  const { filePaths } = await dialog.showOpenDialog(mainWindow, {
    title: 'Import File',
    filters: [
      { name: 'Markdown', extensions: ['md', 'markdown'] },
      { name: 'Text', extensions: ['txt'] }
    ],
    properties: ['openFile']
  });

  if (filePaths && filePaths.length > 0) {
    const selectedPath = filePaths[0];
    // Check if already imported
    const existing = storage.findFileBySourcePath(selectedPath);
    if (existing && existing.id) {
      return { success: true, fileId: existing.id, reused: true };
    }
    try {
      const content = fs.readFileSync(selectedPath, 'utf8');
      const fileName = path.basename(selectedPath, path.extname(selectedPath));
      // Create a new file with imported content
      const fileData = storage.createNewFile();
      if (fileData) {
        fileData.title = fileName;
        fileData.content = content;
        fileData.sourcePath = selectedPath;
        storage.saveFile(fileData);
        return { success: true, fileId: fileData.id, reused: false };
      }
    } catch (error) {
      if (isDev) console.error('Error importing file:', error);
      return { success: false, error: error.message };
    }
  }
  
  return { success: false, cancelled: true };
});

// Add image to file
ipcMain.handle('add-image', async (event, fileId) => {
  const { filePaths } = await dialog.showOpenDialog(mainWindow, {
    title: 'Add Image',
    filters: [
      { name: 'Images', extensions: ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'] }
    ],
    properties: ['openFile']
  });

  if (filePaths && filePaths.length > 0) {
    try {
      const imagePath = filePaths[0];
      const imageExt = path.extname(imagePath);
      const imageFileName = `${Date.now()}${imageExt}`;
      
      // Create images directory for this file
      const userDataPath = app.getPath('userData');
      const imagesDir = path.join(userDataPath, 'images', fileId);
      if (!fs.existsSync(imagesDir)) {
        fs.mkdirSync(imagesDir, { recursive: true });
      }
      
      // Copy image to images directory
      const destPath = path.join(imagesDir, imageFileName);
      fs.copyFileSync(imagePath, destPath);
      
      // Return the custom protocol path that can be used in markdown
      const relativePath = `app-images://images/${fileId}/${imageFileName}`;
      return { success: true, path: relativePath, fileName: path.basename(imagePath, imageExt) };
    } catch (error) {
      if (isDev) console.error('Error adding image:', error);
      return { success: false, error: error.message };
    }
  }
  
  return { success: false, cancelled: true };
});

// Download remote image into file's images cache (smart paste)
ipcMain.handle('download-image', async (event, { url, fileId }) => {
  if (!url || !fileId) return { success: false, error: 'Missing url or fileId' };
  try {
    // Basic validation
    if (!/^https?:\/\//i.test(url)) return { success: false, error: 'Invalid URL' };
    const extMatch = url.match(/\.(png|jpe?g|gif|webp|svg)(\?|#|$)/i);
    const ext = extMatch ? ('.' + extMatch[1].toLowerCase().replace('jpeg', 'jpg')) : '.png';
    const imageFileName = `${Date.now()}${ext}`;
    const userDataPath = app.getPath('userData');
    const imagesDir = path.join(userDataPath, 'images', fileId);
    if (!fs.existsSync(imagesDir)) fs.mkdirSync(imagesDir, { recursive: true });
    const destPath = path.join(imagesDir, imageFileName);

    // Use native fetch (Node 18+/Electron >= 20) fallback to https if needed
    let arrayBuffer;
    if (typeof fetch === 'function') {
      const resp = await fetch(url, { redirect: 'follow' });
      if (!resp.ok) return { success: false, error: `HTTP ${resp.status}` };
      arrayBuffer = await resp.arrayBuffer();
    } else {
      const https = require('https');
      arrayBuffer = await new Promise((resolve, reject) => {
        https.get(url, (res) => {
          if (res.statusCode && res.statusCode >= 400) return reject(new Error('HTTP ' + res.statusCode));
          const chunks = [];
            res.on('data', d => chunks.push(d));
            res.on('end', () => resolve(Buffer.concat(chunks)));
        }).on('error', reject);
      });
    }
    fs.writeFileSync(destPath, Buffer.from(arrayBuffer));
    const relativePath = `app-images://images/${fileId}/${imageFileName}`;
    const baseName = path.basename(url).split('?')[0].split('#')[0];
    return { success: true, path: relativePath, fileName: baseName.replace(/\.(png|jpe?g|gif|webp|svg)$/i,'') };
  } catch (e) {
    if (isDev) console.error('download-image failed:', e);
    return { success: false, error: e.message };
  }
});

// Draft autosave & recovery handlers
const getDraftsDir = () => {
  const dir = path.join(app.getPath('userData'), 'drafts');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return dir;
};

ipcMain.handle('save-draft', (event, fileId, content) => {
  try {
    if (!fileId) return { success: false, error: 'No fileId' };
    const draftsDir = getDraftsDir();
    const draftPath = path.join(draftsDir, `${fileId}.json`);
    fs.writeFileSync(draftPath, JSON.stringify({ content, updatedAt: Date.now() }));
    return { success: true };
  } catch (e) {
    if (isDev) console.error('save-draft failed:', e);
    return { success: false, error: e.message };
  }
});

ipcMain.handle('load-draft', (event, fileId, fileUpdatedAt) => {
  try {
    if (!fileId) return { success: false };
    const draftsDir = getDraftsDir();
    const draftPath = path.join(draftsDir, `${fileId}.json`);
    if (!fs.existsSync(draftPath)) return { success: true, exists: false };
    const data = JSON.parse(fs.readFileSync(draftPath, 'utf8'));
    const newer = !fileUpdatedAt || data.updatedAt > new Date(fileUpdatedAt).getTime();
    return { success: true, exists: true, newer, content: data.content };
  } catch (e) {
    if (isDev) console.error('load-draft failed:', e);
    return { success: false, error: e.message };
  }
});

ipcMain.handle('delete-draft', (event, fileId) => {
  try {
    if (!fileId) return { success: false };
    const draftsDir = getDraftsDir();
    const draftPath = path.join(draftsDir, `${fileId}.json`);
    if (fs.existsSync(draftPath)) fs.unlinkSync(draftPath);
    return { success: true };
  } catch (e) {
    if (isDev) console.error('delete-draft failed:', e);
    return { success: false, error: e.message };
  }
});

// Git Integration
const gitRepos = new Map(); // Store git instances by repo URL

ipcMain.handle('git-connect', async (event, repoUrl) => {
  try {
    // Create a temporary directory for the repo
    const userDataPath = app.getPath('userData');
    const gitDir = path.join(userDataPath, 'git-repos', Buffer.from(repoUrl).toString('base64').substring(0, 20));
    
    if (!fs.existsSync(gitDir)) {
      fs.mkdirSync(gitDir, { recursive: true });
    }

    const git = simpleGit(gitDir);
    
    // Check if already cloned
    const isRepo = await git.checkIsRepo();
    if (!isRepo) {
      // Clone the repository
      await git.clone(repoUrl, gitDir);
    } else {
      // Pull latest changes
      await git.pull();
    }
    
    gitRepos.set(repoUrl, { git, dir: gitDir });
    
    // Get list of markdown files
    const files = fs.readdirSync(gitDir).filter(f => f.endsWith('.md'));
    
    return { success: true, files, message: 'Connected successfully!' };
  } catch (error) {
    if (isDev) console.error('Git connect error:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('git-push', async (event, { repoUrl, filename, content, commitMsg }) => {
  try {
    const repoData = gitRepos.get(repoUrl);
    if (!repoData) {
      return { success: false, error: 'Repository not connected. Please connect first.' };
    }

    const { git, dir } = repoData;
    const filePath = path.join(dir, filename);
    
    // Write the file
    fs.writeFileSync(filePath, content, 'utf8');
    
    // Git add, commit, push
    await git.add(filename);
    await git.commit(commitMsg || 'Update from Markedit');
    await git.push();
    
    return { success: true, message: `Successfully pushed ${filename} to GitHub!` };
  } catch (error) {
    if (isDev) console.error('Git push error:', error);
    return { success: false, error: error.message };
  }
});

// Function to import external file and open in editor
function importAndOpenFile(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      if (isDev) console.warn('[File Open] File not found:', filePath);
      return;
    }

    // Deduplicate by original path
    const existing = storage.findFileBySourcePath(filePath);
    if (existing && existing.id) {
      if (isDev) console.log('[File Open] Reusing cached file for', filePath);
      if (mainWindow) {
        // If we're not on editor page yet, load it first
        const currentURL = mainWindow.webContents.getURL();
        if (!currentURL.includes('editor.html')) {
          mainWindow.loadFile('editor.html');
          mainWindow.webContents.once('did-finish-load', () => {
            mainWindow.webContents.executeJavaScript(`
              try { 
                localStorage.setItem('currentFileId', '${existing.id}');
                window.location.reload();
              } catch(e) { console.error(e); }
            `);
          });
        } else {
          mainWindow.webContents.executeJavaScript(`
            try { 
              localStorage.setItem('currentFileId', '${existing.id}');
              window.location.reload();
            } catch(e) { console.error(e); }
          `);
        }
      }
      return;
    }

    const content = fs.readFileSync(filePath, 'utf8');
    const fileName = path.basename(filePath, path.extname(filePath));
    
    // Create a new file with imported content
    const fileData = storage.createNewFile();
    if (fileData) {
      fileData.title = fileName;
      fileData.content = content;
      fileData.sourcePath = filePath; // link to external source
      storage.saveFile(fileData);
      
      if (isDev) console.log('[File Open] Imported external file:', fileName);
      
      // Load editor with this file
      if (mainWindow) {
        // If we're not on editor page yet, load it first
        const currentURL = mainWindow.webContents.getURL();
        if (!currentURL.includes('editor.html')) {
          mainWindow.loadFile('editor.html');
          mainWindow.webContents.once('did-finish-load', () => {
            mainWindow.webContents.executeJavaScript(`
              try {
                localStorage.setItem('currentFileId', '${fileData.id}');
                window.location.reload();
              } catch(e) { console.error(e); }
            `);
          });
        } else {
          mainWindow.webContents.executeJavaScript(`
            try {
              localStorage.setItem('currentFileId', '${fileData.id}');
              window.location.reload();
            } catch(e) { console.error(e); }
          `);
        }
      }
    }
  } catch (error) {
    if (isDev) console.error('[File Open] Error importing file:', error);
  }
}

// Handle file open from Windows (command line args)
const fileArg = process.argv.find(arg => arg.endsWith('.md') || arg.endsWith('.markdown'));
if (fileArg && fs.existsSync(fileArg)) {
  pendingFileToOpen = fileArg;
}

// Handle file open on macOS
app.on('open-file', (event, filePath) => {
  event.preventDefault();
  if (filePath && (filePath.endsWith('.md') || filePath.endsWith('.markdown'))) {
    if (mainWindow) {
      importAndOpenFile(filePath);
    } else {
      pendingFileToOpen = filePath;
    }
  }
});

// Request single instance lock to handle file opens when app is already running
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    // Handle file open from second instance (Windows)
    const fileArg = commandLine.find(arg => arg.endsWith('.md') || arg.endsWith('.markdown'));
    if (fileArg && fs.existsSync(fileArg)) {
      if (mainWindow) {
        if (mainWindow.isMinimized()) mainWindow.restore();
        mainWindow.focus();
        importAndOpenFile(fileArg);
      }
    } else if (mainWindow) {
      // Just focus the window if no file argument
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
}

app.whenReady().then(() => {
  // Register custom protocol to serve local images
  protocol.registerFileProtocol('app-images', (request, callback) => {
    const url = request.url.replace('app-images://', '');
    const imagePath = path.join(app.getPath('userData'), url);
    callback({ path: imagePath });
  });

  createWindow();
  initAutoUpdater();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

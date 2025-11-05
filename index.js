const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
let autoUpdater = null; // lazy-required when packaged
const path = require('path');
const fs = require('fs');
const storage = require('./storage');

// Production/development flag
const isDev = !app.isPackaged;

let mainWindow;
let rpcClient = null;
let rpcReady = false;
let rpcStartTs = Math.floor(Date.now() / 1000);
let lastPresence = null; // cache last activity to re-apply on reconnect
let rpcImageKey = 'icon'; // default asset key; can be overridden via settings.rpcAssetKey
let rpcEnabled = true; // togglable via settings

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
    details: 'Markedit',
    state: 'In the home screen',
    timestamps: { start: rpcStartTs * 1000 },
  assets: { large_image: rpcImageKey, large_text: 'Markedit' },
    buttons: [{ label: 'Download Markedit', url: 'https://github.com/example/markedit' }]
  };
  lastPresence = activity;
  try { applyActivity(activity); } catch (e) { if (isDev) console.warn('[RPC] setActivity(home) failed:', e?.message || e); }
}

function setPresenceEditing(filename) {
  if (!rpcEnabled || !rpcClient || !rpcReady) return;
  const activity = {
    details: `Editing ${filename || 'Untitled'}`,
    state: 'Markedit',
    timestamps: { start: rpcStartTs * 1000 },
  assets: { large_image: rpcImageKey, large_text: 'Markedit' },
    buttons: [{ label: 'Download Markedit', url: 'https://github.com/example/markedit' }]
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
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      devTools: false // Disable DevTools by default
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
  if (!settings.username) {
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
    mainWindow.destroy();
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

ipcMain.handle('export-file', async (event, content, title) => {
  const { filePath, format } = await dialog.showSaveDialog(mainWindow, {
    title: 'Export File',
    defaultPath: `${title || 'document'}.md`,
    filters: [
      { name: 'Markdown', extensions: ['md'] },
      { name: 'Text', extensions: ['txt'] },
      { name: 'HTML', extensions: ['html'] },
      { name: 'PDF', extensions: ['pdf'] }
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
    if (autoUpdater) autoUpdater.quitAndInstall();
  } catch (e) {
    if (isDev) console.warn('[Updater] quitAndInstall failed:', e?.message || e);
  }
});

// Rich Presence updates from renderers
ipcMain.on('rpc-set-home', () => setPresenceHome());
ipcMain.on('rpc-set-editing', (e, filename) => setPresenceEditing(filename));


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
    try {
      const content = fs.readFileSync(filePaths[0], 'utf8');
      const fileName = path.basename(filePaths[0], path.extname(filePaths[0]));
      
      // Create a new file with imported content
      const fileData = storage.createNewFile();
      if (fileData) {
        fileData.title = fileName;
        fileData.content = content;
        storage.saveFile(fileData);
        return { success: true, fileId: fileData.id };
      }
    } catch (error) {
      if (isDev) console.error('Error importing file:', error);
      return { success: false, error: error.message };
    }
  }
  
  return { success: false, cancelled: true };
});

app.whenReady().then(() => {
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

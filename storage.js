const fs = require('fs');
const path = require('path');
const { app } = require('electron');

// Production/development flag
const isDev = !app.isPackaged;

const userDataPath = app.getPath('userData');
const settingsPath = path.join(userDataPath, 'settings.json');
const filesPath = path.join(userDataPath, 'files');

// Ensure files directory exists
if (!fs.existsSync(filesPath)) {
  fs.mkdirSync(filesPath, { recursive: true });
}

// Default settings
const defaultSettings = {
  username: '',
  language: 'en',
  theme: 'dark',
  gitEnabled: false,
  gitPanelCollapsed: false
};

// Get settings
function getSettings() {
  try {
    if (fs.existsSync(settingsPath)) {
      const data = fs.readFileSync(settingsPath, 'utf8');
      return { ...defaultSettings, ...JSON.parse(data) };
    }
  } catch (error) {
    if (isDev) console.error('Error reading settings:', error);
  }
  return { ...defaultSettings };
}

// Save settings
function saveSettings(settings) {
  try {
    fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
    return true;
  } catch (error) {
    if (isDev) console.error('Error saving settings:', error);
    return false;
  }
}

// Get recent files
function getRecentFiles() {
  try {
    const files = fs.readdirSync(filesPath);
    const fileList = files
      .filter(file => file.endsWith('.json'))
      .map(file => {
        const filePath = path.join(filesPath, file);
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        const stats = fs.statSync(filePath);
        return {
          id: file.replace('.json', ''),
          title: data.title || 'Untitled',
          lastModified: stats.mtime,
          preview: data.content.substring(0, 100)
        };
      })
      .sort((a, b) => b.lastModified - a.lastModified);
    
    return fileList;
  } catch (error) {
    if (isDev) console.error('Error getting recent files:', error);
    return [];
  }
}

// Create new file
function createNewFile() {
  try {
    const id = Date.now().toString();
    const fileData = {
      id,
      title: 'Untitled',
      content: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const filePath = path.join(filesPath, `${id}.json`);
    fs.writeFileSync(filePath, JSON.stringify(fileData, null, 2));
    
    return fileData;
  } catch (error) {
    if (isDev) console.error('Error creating new file:', error);
    return null;
  }
}

// Save file
function saveFile(fileData) {
  try {
    const filePath = path.join(filesPath, `${fileData.id}.json`);
    const data = {
      ...fileData,
      updatedAt: new Date().toISOString()
    };
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    if (isDev) console.error('Error saving file:', error);
    return false;
  }
}

// Load file
function loadFile(fileId) {
  try {
    const filePath = path.join(filesPath, `${fileId}.json`);
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    if (isDev) console.error('Error loading file:', error);
  }
  return null;
}

// Delete file
function deleteFile(fileId) {
  try {
    const filePath = path.join(filesPath, `${fileId}.json`);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
  } catch (error) {
    if (isDev) console.error('Error deleting file:', error);
  }
  return false;
}

// Rename file
function renameFile(fileId, newTitle) {
  try {
    const filePath = path.join(filesPath, `${fileId}.json`);
    if (fs.existsSync(filePath)) {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      data.title = newTitle;
      data.updatedAt = new Date().toISOString();
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
      return true;
    }
  } catch (error) {
    if (isDev) console.error('Error renaming file:', error);
  }
  return false;
}

// Auto-save (debounced save)
function autoSave(fileId, content) {
  try {
    const filePath = path.join(filesPath, `${fileId}.json`);
    if (fs.existsSync(filePath)) {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      
      // Update both content and timestamp
      data.content = content;
      data.updatedAt = new Date().toISOString();
      
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
      return true;
    }
  } catch (error) {
    if (isDev) console.error('Error auto-saving:', error);
  }
  return false;
}

// Find a cached file by external source path (case-insensitive on Windows)
function findFileBySourcePath(externalPath) {
  try {
    if (!externalPath) return null;
    const normalize = (p) => {
      try { return path.normalize(p).toLowerCase(); } catch { return String(p || '').toLowerCase(); }
    };
    const target = normalize(externalPath);
    const files = fs.readdirSync(filesPath).filter(f => f.endsWith('.json'));
    for (const f of files) {
      const fp = path.join(filesPath, f);
      try {
        const data = JSON.parse(fs.readFileSync(fp, 'utf8'));
        if (data && data.sourcePath && normalize(data.sourcePath) === target) {
          return {
            id: f.replace('.json',''),
            data
          };
        }
      } catch {}
    }
  } catch (e) {
    if (isDev) console.warn('findFileBySourcePath failed:', e);
  }
  return null;
}

module.exports = {
  getSettings,
  saveSettings,
  getRecentFiles,
  createNewFile,
  saveFile,
  loadFile,
  deleteFile,
  renameFile,
  autoSave,
  findFileBySourcePath
};

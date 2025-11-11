// Settings Page JavaScript
const { ipcRenderer } = require('electron');

// Window controls
document.getElementById('minimize-btn').addEventListener('click', () => {
  ipcRenderer.send('minimize-window');
});

document.getElementById('maximize-btn').addEventListener('click', () => {
  ipcRenderer.send('maximize-window');
});

document.getElementById('close-btn').addEventListener('click', () => {
  ipcRenderer.send('close-window');
});

// Handle close request
ipcRenderer.on('request-close', () => {
  ipcRenderer.send('confirm-close');
});

// Home button
document.getElementById('home-btn').addEventListener('click', () => {
  ipcRenderer.send('load-page', 'home.html');
});

// Theme switching
const themeCards = document.querySelectorAll('.theme-card');
const saveIndicator = document.getElementById('save-indicator');
let currentTheme = localStorage.getItem('theme') || 'dark';

// Set active theme on load (ensure single selection)
themeCards.forEach(c => c.classList.remove('active'));
themeCards.forEach(card => {
  if (card.dataset.theme === currentTheme) {
    card.classList.add('active');
  }
});

// Theme card click handlers
themeCards.forEach(card => {
  card.addEventListener('click', async () => {
    const theme = card.dataset.theme;
    
    // Update active state
    themeCards.forEach(c => c.classList.remove('active'));
    card.classList.add('active');
    
    // Save theme
    localStorage.setItem('theme', theme);
    currentTheme = theme;
    
    // Apply theme
    applyTheme(theme);
    
    // Show save indicator
    saveIndicator.classList.add('show');
    setTimeout(() => {
      saveIndicator.classList.remove('show');
    }, 2000);
    
    // Save to settings
    const settings = await ipcRenderer.invoke('load-settings');
    settings.theme = theme;
    await ipcRenderer.invoke('save-settings', settings);
  });
});

// Apply theme function
function applyTheme(theme) {
  // Remove existing theme links
  const existingTheme = document.querySelector('link[data-theme]');
  if (existingTheme) {
    existingTheme.remove();
  }
  
  // Add new theme link
  const themeLink = document.createElement('link');
  themeLink.rel = 'stylesheet';
  themeLink.href = `../themes/${theme}.css`;
  themeLink.dataset.theme = theme;
  document.head.appendChild(themeLink);
}

// Apply current theme on load
applyTheme(currentTheme);

// Load current language and bind change to save
(async function initLanguage() {
  try {
    const settings = await ipcRenderer.invoke('load-settings');
    const langSelect = document.getElementById('language-select');
    const langIndicator = document.getElementById('lang-save-indicator');
    if (settings && settings.language) {
      langSelect.value = settings.language;
    }
    langSelect.addEventListener('change', async () => {
      const updated = await ipcRenderer.invoke('load-settings');
      updated.language = langSelect.value;
      await ipcRenderer.invoke('save-settings', updated);
      langIndicator.classList.add('show');
      setTimeout(() => langIndicator.classList.remove('show'), 2000);
      if (window.i18n) i18n.setLanguage(langSelect.value);
    });
    
    // Initialize translations after language select is set up
    if (window.i18n) i18n.init().catch(e => console.warn('i18n init failed:', e));
  } catch (e) {
    console.error('Failed to initialize language setting', e);
  }
})();

// Initialize RPC toggle
(async function initRpcToggle() {
  try {
    const settings = await ipcRenderer.invoke('load-settings');
    const rpcToggle = document.getElementById('rpc-toggle');
    const rpcIndicator = document.getElementById('rpc-save-indicator');
    const enabled = settings && Object.prototype.hasOwnProperty.call(settings, 'rpcEnabled') ? settings.rpcEnabled : true;
    rpcToggle.checked = !!enabled;
    rpcToggle.addEventListener('change', async () => {
      const updated = await ipcRenderer.invoke('load-settings');
      updated.rpcEnabled = rpcToggle.checked;
      await ipcRenderer.invoke('save-settings', updated);
      rpcIndicator.classList.add('show');
      setTimeout(() => rpcIndicator.classList.remove('show'), 2000);
    });
  } catch (e) {
    console.error('Failed to initialize RPC toggle', e);
  }
})();

// Initialize Git toggle
(async function initGitToggle() {
  try {
    const settings = await ipcRenderer.invoke('load-settings');
    const gitToggle = document.getElementById('git-toggle');
    const gitIndicator = document.getElementById('git-save-indicator');
    const enabled = settings && Object.prototype.hasOwnProperty.call(settings, 'gitEnabled') ? settings.gitEnabled : false;
    gitToggle.checked = !!enabled;
    gitToggle.addEventListener('change', async () => {
      const updated = await ipcRenderer.invoke('load-settings');
      updated.gitEnabled = gitToggle.checked;
      await ipcRenderer.invoke('save-settings', updated);
      gitIndicator.classList.add('show');
      setTimeout(() => gitIndicator.classList.remove('show'), 2000);
    });
  } catch (e) {
    console.error('Failed to initialize Git toggle', e);
  }
})();

// Danger zone: double-confirm reset
document.getElementById('danger-reset-btn').addEventListener('click', async () => {
  const first = await dialog.confirm('Reset App', 'Are you sure you want to reset all app settings?');
  if (first.action !== 'ok') return;
  const second = await dialog.confirm('Confirm Reset', 'This will reset all settings and restart onboarding. Are you really sure?');
  if (second.action === 'ok') {
    const defaults = { username: '', language: 'en', theme: 'dark' };
    await ipcRenderer.invoke('save-settings', defaults);
    ipcRenderer.send('load-page', 'onboarding.html');
  }
});

// Danger zone: clear ALL data (files + cache)
document.getElementById('danger-clear-data-btn').addEventListener('click', async () => {
  const first = await dialog.confirm('Delete ALL Data', 'This will permanently delete ALL saved files, drafts, images and cache. Continue?');
  if (first.action !== 'ok') return;
  const second = await dialog.confirm('Confirm Full Deletion', 'This cannot be undone. Type OK to proceed.');
  if (second.action !== 'ok') return;
  const res = await ipcRenderer.invoke('clear-all-data');
  if (res && res.success) {
    try { localStorage.removeItem('currentFileId'); } catch {}
    await dialog.alert('Deletion Complete', 'All local data cleared. App will return to Home.');
    ipcRenderer.send('load-page', 'home.html');
  } else {
    await dialog.alert('Deletion Failed', res?.error || 'Unknown error');
  }
});

// Vertical tabs navigation
const tabs = document.querySelectorAll('.settings-tab');
const contents = document.querySelectorAll('.settings-content');

tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    const tabName = tab.dataset.tab;
    
    // Handle special "back" tab
    if (tabName === 'back') {
      let target = null;
      try { target = JSON.parse(localStorage.getItem('returnTo') || 'null'); } catch {}
      try { localStorage.removeItem('returnTo'); } catch {}
      
      if (target && target.page === 'editor') {
        if (target.fileId) {
          try { localStorage.setItem('currentFileId', String(target.fileId)); } catch {}
        }
        ipcRenderer.send('load-page', 'editor.html');
      } else {
        ipcRenderer.send('load-page', 'home.html');
      }
      return;
    }
    
    // Switch active tab
    tabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    
    // Switch active content
    contents.forEach(c => c.classList.remove('active'));
    const targetContent = document.getElementById(`${tabName}-content`);
    if (targetContent) {
      targetContent.classList.add('active');
    }
  });
});

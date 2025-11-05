const { marked } = require('marked');
const { ipcRenderer } = require('electron');

// Configure marked options
marked.setOptions({
  breaks: false, // Don't convert single line breaks to <br>
  gfm: true,
  headerIds: true,
  mangle: false,
  pedantic: false
});

// Global variables
let currentFileId = localStorage.getItem('currentFileId');
let autoSaveTimer = null;
let currentFileData = null;
let hasUnsavedChanges = false;
let lastSavedContent = '';
let isEmptyFile = true;

// DOM Elements
let markdownInput;
let previewOutput;
let fileTitleInput;

// Initialize all event listeners
function initializeNavbar() {
  // Window controls
  const minimizeBtn = document.getElementById('minimize-btn');
  const maximizeBtn = document.getElementById('maximize-btn');
  const closeBtn = document.getElementById('close-btn');

  if (minimizeBtn) {
    minimizeBtn.addEventListener('click', () => {
      ipcRenderer.send('minimize-window');
    });
  }

  if (maximizeBtn) {
    maximizeBtn.addEventListener('click', () => {
      ipcRenderer.send('maximize-window');
    });
  }

  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      ipcRenderer.send('close-window');
    });
  }

  // Burger opens settings directly
  const menuBtn = document.getElementById('menu-btn');
  if (menuBtn) {
    menuBtn.addEventListener('click', async () => {
      if (hasUnsavedChanges && !isFileEmpty()) {
        const result = await window.dialog.confirmSave('You have unsaved changes. Do you want to save before leaving?');
        if (result.action === 'save') {
          await autoSave();
          hasUnsavedChanges = false;
          // Mark return target so Settings can navigate back to editor
          try { localStorage.setItem('returnTo', JSON.stringify({ page: 'editor', fileId: currentFileId })); } catch {}
          ipcRenderer.send('load-page', 'settings.html');
        } else if (result.action === 'dont-save') {
          hasUnsavedChanges = false;
          try { localStorage.setItem('returnTo', JSON.stringify({ page: 'editor', fileId: currentFileId })); } catch {}
          ipcRenderer.send('load-page', 'settings.html');
        }
      } else {
        try { localStorage.setItem('returnTo', JSON.stringify({ page: 'editor', fileId: currentFileId })); } catch {}
        ipcRenderer.send('load-page', 'settings.html');
      }
    });
  }

  // Home button
  const homeBtn = document.getElementById('home-btn');
  if (homeBtn) {
    homeBtn.addEventListener('click', async () => {
      if (hasUnsavedChanges && !isFileEmpty()) {
        const result = await window.dialog.confirmSave('You have unsaved changes. Do you want to save before leaving?');
        if (result.action === 'save') {
          await autoSave();
          hasUnsavedChanges = false;
          ipcRenderer.send('load-page', 'home.html');
        } else if (result.action === 'dont-save') {
          hasUnsavedChanges = false;
          ipcRenderer.send('load-page', 'home.html');
        }
      } else {
        ipcRenderer.send('load-page', 'home.html');
      }
    });
  }

  // Export button
  const exportBtn = document.getElementById('export-btn');
  if (exportBtn) {
    exportBtn.addEventListener('click', async () => {
      const result = await ipcRenderer.invoke('export-file', markdownInput.value, fileTitleInput.value);
      if (result.success) {
        dialog.alert('Export Success', `File exported successfully to:\n${result.path}`);
      } else if (!result.cancelled) {
        dialog.alert('Export Failed', `Export failed: ${result.error || 'Unknown error'}`);
      }
    });
  }

  // Add Image button
  const imageBtn = document.getElementById('image-btn');
  if (imageBtn) {
    imageBtn.addEventListener('click', async () => {
      if (!currentFileId) {
        await window.dialog.alert('No File', 'Please create or open a file first.');
        return;
      }
      
      const result = await ipcRenderer.invoke('add-image', currentFileId);
      if (result.success) {
        // Insert markdown image syntax at cursor position
        const imageName = result.fileName || 'image';
        const imageMarkdown = `![${imageName}](${result.path})`;
        
        const start = markdownInput.selectionStart;
        const end = markdownInput.selectionEnd;
        const value = markdownInput.value;
        
        markdownInput.value = value.substring(0, start) + imageMarkdown + value.substring(end);
        markdownInput.selectionStart = markdownInput.selectionEnd = start + imageMarkdown.length;
        
        // Trigger preview update
        updatePreview();
        hasUnsavedChanges = true;
        
        await window.dialog.alert('Image Added', `Image added successfully!\n\nMarkdown: ${imageMarkdown}`);
      } else if (!result.cancelled) {
        await window.dialog.alert('Error', `Failed to add image: ${result.error || 'Unknown error'}`);
      }
    });
  }

  // (Removed dropdown and download/reset; hamburger now navigates to Settings)
}

// Initialize editor elements
function initializeEditor() {
  markdownInput = document.getElementById('markdown-input');
  previewOutput = document.getElementById('preview-output');
  fileTitleInput = document.getElementById('file-title');
}

// Function to check if file is essentially empty
function isFileEmpty() {
  if (!fileTitleInput || !markdownInput) return true;
  const title = fileTitleInput.value.trim();
  const content = markdownInput.value.trim();
  return (title === '' || title === 'Untitled') && content === '';
}

// Main initialization function
function initializeApp() {
  initializeNavbar();
  initializeEditor();
  
  if (!markdownInput || !previewOutput || !fileTitleInput) {
    console.error('Required DOM elements not found');
    return;
  }
  
  // Update preview and trigger auto-save on input with debouncing
  let previewDebounceTimer = null;
  markdownInput.addEventListener('input', () => {
    // Debounce preview updates for better performance
    if (previewDebounceTimer) {
      clearTimeout(previewDebounceTimer);
    }
    previewDebounceTimer = setTimeout(() => {
      updatePreview();
    }, 150); // 150ms debounce
  
    // Check if content has changed
    if (markdownInput.value !== lastSavedContent) {
      hasUnsavedChanges = true;
    }

    // Auto-save every 60 seconds (1 minute)
    if (autoSaveTimer) {
      clearTimeout(autoSaveTimer);
    }
  
    autoSaveTimer = setTimeout(autoSave, 60000); // 60 seconds
  });

  // Save title when changed
  fileTitleInput.addEventListener('blur', async () => {
    if (!currentFileId || !currentFileData) return;
  
    currentFileData.title = fileTitleInput.value || 'Untitled';
    await ipcRenderer.invoke('save-file', currentFileData);
    ipcRenderer.send('rpc-set-editing', currentFileData.title);
  });

  // Clear placeholder on focus for easier editing
  fileTitleInput.addEventListener('focus', (e) => {
    if (e.target.value === 'Untitled') {
      e.target.select();
    }
  });

  // Handle tab key in textarea
  markdownInput.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = markdownInput.selectionStart;
      const end = markdownInput.selectionEnd;
      const value = markdownInput.value;
    
      // Insert tab character
      markdownInput.value = value.substring(0, start) + '  ' + value.substring(end);
    
      // Move cursor
      markdownInput.selectionStart = markdownInput.selectionEnd = start + 2;
    
      // Update preview
      updatePreview();
    }
  });

  // Resizable divider functionality
  const divider = document.getElementById('divider');
  const editorPane = document.getElementById('editor-pane');
  const previewPane = document.getElementById('preview-pane');
  const editorMain = document.querySelector('.editor-main');

  let isDragging = false;

  divider.addEventListener('mousedown', (e) => {
    isDragging = true;
    divider.classList.add('dragging');
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  });

  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;

    const containerRect = editorMain.getBoundingClientRect();
    const containerWidth = containerRect.width;
    const mouseX = e.clientX - containerRect.left;
  
    // Calculate percentage (between 20% and 80%)
    let percentage = (mouseX / containerWidth) * 100;
    percentage = Math.max(20, Math.min(80, percentage));
  
    editorPane.style.flex = `0 0 ${percentage}%`;
  });

  document.addEventListener('mouseup', () => {
    if (isDragging) {
      isDragging = false;
      divider.classList.remove('dragging');
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }
  });

  // Synchronize scrolling
  let isEditorScrolling = false;
  let isPreviewScrolling = false;

  markdownInput.addEventListener('scroll', () => {
    if (!isPreviewScrolling) {
      isEditorScrolling = true;
      const scrollPercentage = markdownInput.scrollTop / (markdownInput.scrollHeight - markdownInput.clientHeight);
      previewOutput.scrollTop = scrollPercentage * (previewOutput.scrollHeight - previewOutput.clientHeight);
      setTimeout(() => isEditorScrolling = false, 100);
    }
  });

  previewOutput.addEventListener('scroll', () => {
    if (!isEditorScrolling) {
      isPreviewScrolling = true;
      const scrollPercentage = previewOutput.scrollTop / (previewOutput.scrollHeight - previewOutput.clientHeight);
      markdownInput.scrollTop = scrollPercentage * (markdownInput.scrollHeight - markdownInput.clientHeight);
      setTimeout(() => isPreviewScrolling = false, 100);
    }
  });

  // Warn before closing window if there are unsaved changes
  window.addEventListener('beforeunload', (e) => {
    if (hasUnsavedChanges) {
      e.returnValue = true;
    }
  });
  
  // Initialize clock display
  updateClock();
  updateDigitalClock();
  
  // Load the current file
  loadFile();
}

// Load current file
async function loadFile() {
  if (!currentFileId) {
    console.error('No file ID found');
    return;
  }

  currentFileData = await ipcRenderer.invoke('load-file', currentFileId);
  
  if (currentFileData) {
    fileTitleInput.value = currentFileData.title || 'Untitled';
    markdownInput.value = currentFileData.content || '';
    lastSavedContent = currentFileData.content || '';
    updatePreview();
    // Update RPC presence with file title
    ipcRenderer.send('rpc-set-editing', fileTitleInput.value || 'Untitled');
  }
}

// Convert markdown to HTML and update preview
function updatePreview() {
  if (!markdownInput || !previewOutput) return;
  try {
    const md = markdownInput.value || '';
    const html = marked.parse(md);
    previewOutput.innerHTML = html;
  } catch (err) {
    console.error('Error updating preview:', err);
  }
}

// Auto-save current document content and title
async function autoSave() {
  if (!currentFileId) return;
  
  const autosaveIndicator = document.getElementById('autosave-indicator');
  const autosaveText = autosaveIndicator?.querySelector('.autosave-text');
  const autosaveIcon = autosaveIndicator?.querySelector('i');
  
  try {
    // Show saving state
    if (autosaveIndicator) {
      autosaveIndicator.classList.remove('saved');
      autosaveIndicator.classList.add('saving', 'show');
      if (autosaveText) autosaveText.textContent = 'Saving...';
      if (autosaveIcon) {
        autosaveIcon.className = 'fas fa-circle-notch fa-spin';
      }
    }
    
    const title = (fileTitleInput && fileTitleInput.value) ? fileTitleInput.value : 'Untitled';
    const content = (markdownInput && markdownInput.value) ? markdownInput.value : '';
    lastSavedContent = content;
    hasUnsavedChanges = false;
    await ipcRenderer.invoke('auto-save', currentFileId, content);
    
    // Show saved state
    if (autosaveIndicator) {
      autosaveIndicator.classList.remove('saving');
      autosaveIndicator.classList.add('saved');
      if (autosaveText) autosaveText.textContent = 'Saved';
      if (autosaveIcon) {
        autosaveIcon.className = 'fas fa-check-circle';
      }
      
      // Hide after 3 seconds
      setTimeout(() => {
        autosaveIndicator.classList.remove('show');
      }, 3000);
    }
  } catch (err) {
    console.error('Auto-save failed:', err);
    
    // Show error state
    if (autosaveIndicator) {
      autosaveIndicator.classList.remove('saving', 'saved');
      if (autosaveText) autosaveText.textContent = 'Save failed';
      if (autosaveIcon) {
        autosaveIcon.className = 'fas fa-exclamation-circle';
        autosaveIcon.style.color = '#f48771';
      }
      
      // Hide after 3 seconds
      setTimeout(() => {
        autosaveIndicator.classList.remove('show');
      }, 3000);
    }
  }
}

// ==================== TIME WIDGET ====================
let timeMode = 'clock'; // clock, timer, countdown
let timerInterval = null;
let timerSeconds = 0;
let countdownInterval = null;
let countdownSeconds = 0;
let countdownInitialSeconds = 0;

const timeWidget = document.getElementById('time-widget');
const timeDisplay = document.getElementById('time-display');
const timeModal = document.getElementById('time-modal');

// Toggle time modal
timeWidget.addEventListener('click', (e) => {
  e.stopPropagation();
  timeModal.classList.toggle('show');
  
  // Sync UI with current mode when opening modal
  if (timeModal.classList.contains('show')) {
    syncTimeModeUI();
  }
});

// Function to sync UI with current time mode
function syncTimeModeUI() {
  // Update active button
  document.querySelectorAll('.time-mode-btn').forEach(btn => {
    if (btn.getAttribute('data-mode') === timeMode) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
  
  // Show/hide sections
  document.getElementById('clock-section').style.display = timeMode === 'clock' ? 'block' : 'none';
  document.getElementById('timer-section').style.display = timeMode === 'timer' ? 'block' : 'none';
  document.getElementById('countdown-section').style.display = timeMode === 'countdown' ? 'block' : 'none';
  
  // Update digital clock if in clock mode
  if (timeMode === 'clock') {
    updateDigitalClock();
  }
}

// Close modal when clicking outside
document.addEventListener('click', (e) => {
  if (!timeModal.contains(e.target) && !timeWidget.contains(e.target)) {
    timeModal.classList.remove('show');
  }
});

// Time mode selector
document.querySelectorAll('.time-mode-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.time-mode-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    
    const mode = btn.getAttribute('data-mode');
    timeMode = mode;
    
    // Show/hide sections
    document.getElementById('clock-section').style.display = mode === 'clock' ? 'block' : 'none';
    document.getElementById('timer-section').style.display = mode === 'timer' ? 'block' : 'none';
    document.getElementById('countdown-section').style.display = mode === 'countdown' ? 'block' : 'none';
    
    // Only update displays if there's no active timer/countdown running
    if (mode === 'clock') {
      // Only update widget clock if no timer/countdown is running
      if (!timerInterval && !countdownInterval) {
        updateClock();
      }
      updateDigitalClock();
    } else if (mode === 'timer') {
      if (!timerInterval) timerSeconds = 0;
      updateTimerDisplay();
    } else if (mode === 'countdown') {
      if (!countdownInterval) {
        countdownSeconds = countdownInitialSeconds;
        updateCountdownDisplay();
      }
    }
  });
});

// Clock function
function updateClock() {
  if (timeMode === 'clock') {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    timeDisplay.textContent = `${hours}:${minutes}`;
  }
}

// Digital clock function for modal
function updateDigitalClock() {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  
  const digitalTime = document.getElementById('digital-time');
  const digitalDate = document.getElementById('digital-date');
  
  if (digitalTime) {
    digitalTime.textContent = `${hours}:${minutes}:${seconds}`;
  }
  
  if (digitalDate) {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const dayName = days[now.getDay()];
    const monthName = months[now.getMonth()];
    const date = now.getDate();
    const year = now.getFullYear();
    digitalDate.textContent = `${dayName}, ${monthName} ${date}, ${year}`;
  }
}

// Timer functions
function updateTimerDisplay() {
  const hours = Math.floor(timerSeconds / 3600);
  const minutes = Math.floor((timerSeconds % 3600) / 60);
  const seconds = timerSeconds % 60;
  timeDisplay.textContent = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

document.getElementById('timer-start').addEventListener('click', function() {
  if (timerInterval) {
    // Pause
    clearInterval(timerInterval);
    timerInterval = null;
    this.textContent = (window.i18n ? i18n.t('start') : 'Start');
    this.classList.add('start');
  } else {
    // Start
    timerInterval = setInterval(() => {
      timerSeconds++;
      updateTimerDisplay();
    }, 1000);
    this.textContent = (window.i18n ? i18n.t('pause') : 'Pause');
    this.classList.remove('start');
  }
});

document.getElementById('timer-reset').addEventListener('click', () => {
  clearInterval(timerInterval);
  timerInterval = null;
  timerSeconds = 0;
  updateTimerDisplay();
  document.getElementById('timer-start').textContent = (window.i18n ? i18n.t('start') : 'Start');
  document.getElementById('timer-start').classList.add('start');
});

// Countdown functions
function updateCountdownDisplay() {
  const hours = Math.floor(countdownSeconds / 3600);
  const minutes = Math.floor((countdownSeconds % 3600) / 60);
  const seconds = countdownSeconds % 60;
  timeDisplay.textContent = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

document.getElementById('countdown-start').addEventListener('click', function() {
  if (countdownInterval) {
    // Pause
    clearInterval(countdownInterval);
    countdownInterval = null;
    this.textContent = (window.i18n ? i18n.t('start') : 'Start');
    this.classList.add('start');
  } else {
    // Start - get initial time if not set
    if (countdownSeconds === 0 || countdownSeconds === countdownInitialSeconds) {
      const hours = parseInt(document.getElementById('countdown-hours').value) || 0;
      const minutes = parseInt(document.getElementById('countdown-minutes').value) || 0;
      const seconds = parseInt(document.getElementById('countdown-seconds').value) || 0;
      countdownInitialSeconds = hours * 3600 + minutes * 60 + seconds;
      countdownSeconds = countdownInitialSeconds;
    }
    
    if (countdownSeconds > 0) {
      countdownInterval = setInterval(() => {
        countdownSeconds--;
        updateCountdownDisplay();
        
        if (countdownSeconds <= 0) {
          clearInterval(countdownInterval);
          countdownInterval = null;
          document.getElementById('countdown-start').textContent = (window.i18n ? i18n.t('start') : 'Start');
          document.getElementById('countdown-start').classList.add('start');
          // Play alarm sound and show notification
          playAlarmSound();
          new Notification((window.i18n ? i18n.t('countdown_done_title') : 'Countdown Finished!'), { body: (window.i18n ? i18n.t('countdown_done_body') : 'Your countdown has reached zero.') });
        }
      }, 1000);
      this.textContent = (window.i18n ? i18n.t('pause') : 'Pause');
      this.classList.remove('start');
    }
  }
});

document.getElementById('countdown-reset').addEventListener('click', () => {
  clearInterval(countdownInterval);
  countdownInterval = null;
  const hours = parseInt(document.getElementById('countdown-hours').value) || 0;
  const minutes = parseInt(document.getElementById('countdown-minutes').value) || 0;
  const seconds = parseInt(document.getElementById('countdown-seconds').value) || 0;
  countdownInitialSeconds = hours * 3600 + minutes * 60 + seconds;
  countdownSeconds = countdownInitialSeconds;
  updateCountdownDisplay();
  document.getElementById('countdown-start').textContent = (window.i18n ? i18n.t('start') : 'Start');
  document.getElementById('countdown-start').classList.add('start');
});

// Update clock every second
setInterval(() => {
  if (timeMode === 'clock') {
    // Only update widget clock if no timer/countdown is running
    if (!timerInterval && !countdownInterval) {
      updateClock();
    }
    updateDigitalClock();
  }
}, 1000);

// Alarm sound function
function playAlarmSound() {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  
  // Play two beeps
  const playBeep = (startTime) => {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800; // Hz
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, startTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.2);
    
    oscillator.start(startTime);
    oscillator.stop(startTime + 0.2);
  };
  
  const now = audioContext.currentTime;
  playBeep(now);           // First beep
  playBeep(now + 0.3);     // Second beep
}

// Handle close window request
ipcRenderer.on('request-close', async () => {
  if (hasUnsavedChanges) {
    const result = await window.dialog.show({
      title: 'Unsaved Changes',
      message: 'You have unsaved changes. Do you want to save before closing?',
      buttons: [
        { text: 'Save and Close', value: 'save', className: 'dialog-btn-primary' },
        { text: 'Close Without Saving', value: 'close', className: 'dialog-btn-danger' },
        { text: 'Cancel', value: 'cancel', className: 'dialog-btn-secondary' }
      ]
    });
    
    if (result.action === 'save') {
      await autoSave();
      ipcRenderer.send('confirm-close');
    } else if (result.action === 'close') {
      ipcRenderer.send('confirm-close');
    }
    // If 'cancel', do nothing
  } else {
    ipcRenderer.send('confirm-close');
  }
});

// Git Integration
let currentRepoUrl = '';
let connectedFiles = [];
let gitEnabled = false;

// Check if Git integration is enabled in settings
async function initGitIntegration() {
  try {
    const settings = await ipcRenderer.invoke('load-settings');
    gitEnabled = settings && settings.gitEnabled ? true : false;
    
    const gitPanel = document.getElementById('git-panel');
    if (gitPanel) {
      gitPanel.style.display = gitEnabled ? 'block' : 'none';
    }
  } catch (e) {
    console.error('Failed to load Git settings:', e);
  }
}

// Toggle Git Panel
const gitToggle = document.getElementById('git-toggle');
const gitContent = document.getElementById('git-content');
const gitHeader = document.querySelector('.git-header');

if (gitHeader && gitToggle && gitContent) {
  gitHeader.addEventListener('click', (e) => {
    gitContent.classList.toggle('collapsed');
    gitToggle.classList.toggle('collapsed');
  });
}

// Connect to Git Repository
const gitConnectBtn = document.getElementById('git-connect-btn');
const gitRepoUrl = document.getElementById('git-repo-url');
const gitFileSection = document.getElementById('git-file-section');
const gitRepoSection = document.getElementById('git-repo-section');
const gitConnectedRepo = document.getElementById('git-connected-repo');
const gitDisconnectBtn = document.getElementById('git-disconnect-btn');

if (gitConnectBtn && gitRepoUrl) {
  gitConnectBtn.addEventListener('click', async () => {
    const repoUrl = gitRepoUrl.value.trim();
    if (!repoUrl) {
      await window.dialog.alert('Missing URL', 'Please enter a repository URL');
      return;
    }

    gitConnectBtn.disabled = true;
    gitConnectBtn.textContent = 'Connecting...';
    
    const result = await ipcRenderer.invoke('git-connect', repoUrl);
    
    if (result.success) {
      currentRepoUrl = repoUrl;
      connectedFiles = result.files || [];
      
      // Hide repo section, show file section
      if (gitRepoSection) gitRepoSection.style.display = 'none';
      if (gitFileSection) gitFileSection.style.display = 'flex';
      if (gitConnectedRepo) {
        const shortUrl = repoUrl.replace('https://github.com/', '').replace('.git', '');
        gitConnectedRepo.textContent = shortUrl;
      }
      
      await window.dialog.alert('Connected', result.message);
    } else {
      await window.dialog.alert('Connection Failed', `Error: ${result.error}`);
    }
    
    gitConnectBtn.disabled = false;
    gitConnectBtn.textContent = 'Connect';
  });
}

// Disconnect from repository
if (gitDisconnectBtn) {
  gitDisconnectBtn.addEventListener('click', () => {
    currentRepoUrl = '';
    connectedFiles = [];
    if (gitRepoSection) gitRepoSection.style.display = 'grid';
    if (gitFileSection) gitFileSection.style.display = 'none';
    if (gitRepoUrl) gitRepoUrl.value = '';
  });
}

// Push to GitHub
const gitPushBtn = document.getElementById('git-push-btn');
const gitFilename = document.getElementById('git-filename');
const gitCommitMsg = document.getElementById('git-commit-msg');

if (gitPushBtn && gitFilename && gitCommitMsg) {
  gitPushBtn.addEventListener('click', async () => {
    if (!currentRepoUrl) {
      await window.dialog.alert('Not Connected', 'Please connect to a repository first');
      return;
    }

    const filename = gitFilename.value.trim();
    const commitMsg = gitCommitMsg.value.trim();

    if (!filename) {
      await window.dialog.alert('Missing Filename', 'Please enter a filename');
      return;
    }

    if (!markdownInput) {
      await window.dialog.alert('No Content', 'No content to push');
      return;
    }

    gitPushBtn.disabled = true;
    gitPushBtn.textContent = 'Pushing...';
    
    const result = await ipcRenderer.invoke('git-push', {
      repoUrl: currentRepoUrl,
      filename: filename.endsWith('.md') ? filename : `${filename}.md`,
      content: markdownInput.value,
      commitMsg: commitMsg || 'Update from Markedit'
    });
    
    if (result.success) {
      await window.dialog.alert('Success', result.message);
      // Clear commit message after successful push
      gitCommitMsg.value = '';
    } else {
      await window.dialog.alert('Push Failed', `Error: ${result.error}`);
    }
    
    gitPushBtn.disabled = false;
    gitPushBtn.textContent = 'Push to GitHub';
  });
}

// Run initialization when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => { 
    initializeApp();
    initGitIntegration();
    if (window.i18n) i18n.init().catch(e => console.warn('i18n init failed:', e)); 
  });
} else {
  initializeApp();
  initGitIntegration();
  if (window.i18n) i18n.init().catch(e => console.warn('i18n init failed:', e));
}


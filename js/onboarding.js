const { ipcRenderer } = require('electron');

    let selectedTheme = localStorage.getItem('theme') || 'dark';
    let selectedLanguage = 'en';
    let username = '';

    // Apply theme preview function
    function applyThemePreview(theme) {
      // Remove existing theme link
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
      
      // Store in localStorage for preview
      localStorage.setItem('theme', theme);
    }

    // Load initial theme
    applyThemePreview(selectedTheme);

    // Initialize translations
    if (window.i18n) i18n.init().catch(e => console.warn('i18n init failed:', e));

    // Language selector - update UI immediately when changed
    document.getElementById('language').addEventListener('change', (e) => {
      selectedLanguage = e.target.value;
      if (window.i18n) {
        i18n.setLanguage(selectedLanguage);
      }
    });

    // Step 1: Name & Language
    document.getElementById('step1-form').addEventListener('submit', (e) => {
      e.preventDefault();
      
      username = document.getElementById('username').value.trim();
      selectedLanguage = document.getElementById('language').value;

      if (!username) {
        alert('Please enter your name');
        return;
      }

      // Move to step 2
      document.getElementById('step1').classList.remove('active');
      document.getElementById('step2').classList.add('active');
    });

    // Back to step 1
    document.getElementById('back-to-step1').addEventListener('click', () => {
      document.getElementById('step2').classList.remove('active');
      document.getElementById('step1').classList.add('active');
    });

    // Theme selection
    document.querySelectorAll('.theme-card').forEach(card => {
      card.addEventListener('click', () => {
        document.querySelectorAll('.theme-card').forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        selectedTheme = card.dataset.theme;
        
        // Apply theme preview immediately
        applyThemePreview(selectedTheme);
      });
    });

    // Finish button
    document.getElementById('finish-btn').addEventListener('click', async () => {
      // Save settings
      await ipcRenderer.invoke('save-settings', {
        username,
        language: selectedLanguage,
        theme: selectedTheme
      });

      // Navigate to home
      ipcRenderer.send('load-page', 'home.html');
    });
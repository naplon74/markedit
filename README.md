# Markedit

<div align="center">

![Markedit Logo](icon.ico)

**A modern, feature-rich markdown editor with live preview and Discord Rich Presence**

[![Version](https://img.shields.io/github/v/release/naplon74/markedit)](https://github.com/naplon74/markedit/releases)
[![License](https://img.shields.io/badge/license-ISC-blue.svg)](LICENSE)
[![Downloads](https://img.shields.io/github/downloads/naplon74/markedit/total)](https://github.com/naplon74/markedit/releases)

[Download Latest Release](https://github.com/naplon74/markedit/releases/latest) • [Report Bug](https://github.com/naplon74/markedit/issues) • [Request Feature](https://github.com/naplon74/markedit/issues)

</div>

---

## ✨ Features

### 📝 **Powerful Markdown Editing**
- Real-time live preview as you type
- Syntax highlighting for code blocks
- Support for GitHub Flavored Markdown (GFM)
- Resizable editor and preview panes
- Auto-save every 60 seconds with visual indicator

### 🎨 **Customizable Themes**
- **6 Beautiful Themes**: Dark, Light, Green Forest, Deep Ocean, Sunset, Cyberpunk
- Live theme switching
- Persistent theme selection across sessions

### 🌍 **Multi-Language Support**
- **4 Languages**: English, French, Spanish, German
- Seamless language switching
- Localized UI elements and messages

### 📁 **File Management**
- Create, import, and export markdown files
- Recent files quick access
- File rename and delete with confirmation
- Export to multiple formats: `.md`, `.txt`, `.html`, `.pdf`

### 🎮 **Discord Rich Presence**
- Show what you're working on in Discord
- Display current file being edited
- Toggle on/off in settings
- Custom presence messages

### 🔄 **Automatic Updates**
- Auto-check for updates on startup
- Background download with progress indicator
- One-click install when ready
- Seamless update experience

### ⏱️ **Built-in Time Tools**
- **Clock**: Digital time display
- **Timer**: Count up timer with start/stop/reset
- **Countdown**: Set custom countdown timers
- Alarm notifications when countdown completes

### 🎯 **Modern UI/UX**
- Frameless custom window design
- Smooth animations and transitions
- Intuitive onboarding experience
- Custom dialog system
- Responsive layout

---

## 🚀 Getting Started

### Installation

1. **Download the latest installer** from the [Releases page](https://github.com/naplon74/markedit/releases/latest)
2. **Run** `Markedit-x.x.x-Setup.exe`
3. **Follow** the onboarding wizard to set your name, language, and theme
4. **Start writing!**

### First Launch

On first launch, Markedit will guide you through a quick setup:

1. **Enter your name** for personalized greetings
2. **Choose your preferred language** (English, Français, Español, Deutsch)
3. **Pick a theme** that suits your style
4. You're ready to go! 🎉

---

## 📖 Usage

### Creating a New File
- Click the **"New File"** button on the home screen
- Start typing in the editor pane
- Your file auto-saves every minute

### Importing Existing Files
- Click **"Import File"** on the home screen
- Select a `.md` or `.txt` file
- The file opens in the editor

### Exporting Files
- Click the **export icon** in the editor toolbar
- Choose your format: Markdown, Text, HTML, or PDF
- Select save location

### Keyboard Shortcuts
- **Tab** in editor: Insert 2 spaces (for indentation)
- **Ctrl+S**: Manual save (though auto-save has you covered!)

### Customizing Your Experience

#### Change Theme
1. Click the **hamburger menu** (☰)
2. Select a theme from the 6 available options
3. Theme applies instantly

#### Change Language
1. Open **Settings** via the hamburger menu
2. Select your preferred language
3. UI updates immediately

#### Discord Rich Presence
1. Open **Settings**
2. Toggle **"Enable Discord RPC"**
3. Your Discord status will show what you're editing

---

## 🛠️ Development

### Prerequisites
- Node.js 18+ and npm
- Git

### Setup

```bash
# Clone the repository
git clone https://github.com/naplon74/markedit.git
cd markedit

# Install dependencies
npm install

# Run in development mode
npm start
```

### Building

```bash
# Build Windows installer and latest.yml
npm run dist

# Build unpacked directory (for testing)
npm run pack
```

### Project Structure

```
markedit/
├── index.js              # Main Electron process
├── storage.js            # File storage and settings management
├── home.html             # Home screen with recent files
├── editor.html           # Markdown editor interface
├── settings.html         # Settings and preferences
├── onboarding.html       # First-launch wizard
├── js/
│   ├── editor.js         # Editor logic and markdown rendering
│   ├── dialog.js         # Custom dialog system
│   └── i18n.js           # Internationalization
├── themes/               # Theme CSS files
│   ├── dark.css
│   ├── light.css
│   ├── flowify.css
│   ├── deep-ocean.css
│   ├── sunset.css
│   └── cyberpunk.css
└── package.json          # Dependencies and build config
```

---

## 🎨 Themes Preview

| Dark | Light | Green Forest |
|------|-------|--------------|
| ![Dark Theme](https://via.placeholder.com/200x120/1e1e1e/007acc?text=Dark) | ![Light Theme](https://via.placeholder.com/200x120/ffffff/0078d4?text=Light) | ![Green Forest](https://via.placeholder.com/200x120/0d3d2e/2d8659?text=Green+Forest) |

| Deep Ocean | Sunset | Cyberpunk |
|------------|--------|-----------|
| ![Deep Ocean](https://via.placeholder.com/200x120/0a1f44/00c8ff?text=Deep+Ocean) | ![Sunset](https://via.placeholder.com/200x120/7a2f2a/ff7a59?text=Sunset) | ![Cyberpunk](https://via.placeholder.com/200x120/0b0b14/ff00aa?text=Cyberpunk) |

---

## 🌐 Supported Languages

- 🇬🇧 **English**
- 🇫🇷 **Français** (French)
- 🇪🇸 **Español** (Spanish)
- 🇩🇪 **Deutsch** (German)

---

## 📦 Technologies Used

- **Electron** - Desktop application framework
- **Marked.js** - Markdown parser and renderer
- **Discord RPC** - Rich presence integration
- **electron-builder** - Build and packaging
- **electron-updater** - Automatic updates

---

## 🔄 Auto-Updates

Markedit automatically checks for updates when you launch the app. When a new version is available:

1. A notification appears on the home screen
2. The update downloads in the background
3. Progress is shown with a visual indicator
4. Click **"Restart Now"** to install, or **"Later"** to postpone
5. Updates install on next app quit if you choose "Later"

---

## 🐛 Known Issues

- PDF export requires internet connection for proper rendering
- Discord RPC may take a few seconds to connect on first launch

---

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

---

## 📝 License

This project is licensed under the **ISC License**.

---

## 👨‍💻 Author

**naplon_**

- GitHub: [@naplon74](https://github.com/naplon74)
- Repository: [markedit](https://github.com/naplon74/markedit)

---

## ⭐ Show Your Support

If you like Markedit, give it a ⭐️ on GitHub!

---

## 📸 Screenshots

### Home Screen
*Clean interface with recent files and quick actions*

### Editor View
*Split-pane markdown editor with live preview*

### Settings
*Customize themes, language, and preferences*

### Onboarding
*Smooth first-launch experience with theme selection*

---

## 🔮 Roadmap

- [ ] macOS and Linux support
- [ ] Cloud sync integration
- [ ] Collaborative editing
- [ ] More export formats (DOCX, etc.)
- [ ] Custom keyboard shortcuts
- [ ] Plugin system
- [ ] Vim mode
- [ ] Git integration

---

## 💬 Support

Having issues? Here's how to get help:

- 📖 [Check the documentation](https://github.com/naplon74/markedit/wiki)
- 🐛 [Report a bug](https://github.com/naplon74/markedit/issues/new?labels=bug)
- 💡 [Request a feature](https://github.com/naplon74/markedit/issues/new?labels=enhancement)
- 💬 [Start a discussion](https://github.com/naplon74/markedit/discussions)

---

<div align="center">

**Made with ❤️ by naplon_**

*Happy Writing! ✍️*

</div>

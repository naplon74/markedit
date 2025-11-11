# Markedit

<div align="center">

![Markedit Logo](icon.ico)

**A modern, feature-rich markdown editor with live preview, Git integration, image caching, and Discord Rich Presence**

[![Version](https://img.shields.io/github/v/release/naplon74/markedit)](https://github.com/naplon74/markedit/releases)
[![License](https://img.shields.io/badge/license-ISC-blue.svg)](package.json)

[Download Latest Release](https://github.com/naplon74/markedit/releases/latest) • [Report Bug](https://github.com/naplon74/markedit/issues)

</div>

---

> [!IMPORTANT]
> Linux version comming soon.

---

## 🆕 Recent Updates

### Latest Features (November 2025)
- ⚡ **Command Palette** (Ctrl+Shift+P) with word wrap, timestamps, and task list utilities
- 🎨 **Revamped Settings** with organized sections and comprehensive changelog
- 📁 **Drag & Drop Import** - Drop .md files anywhere on the home screen
- 🗑️ **Auto-Delete Empty Files** - No more clutter from untitled files
- 📝 **Better Markdown Rendering** - Single-line breaks now work correctly
- ✨ **Smart Editor** - Auto-exit lists, image spacing, and more
- 🔍 **File Deduplication** - Won't import the same external file twice

---



## ✨ Features

### 📝 **Powerful Markdown Editing**
- Real-time live preview (150ms debounced for smooth typing)
- GitHub Flavored Markdown (GFM)
- Single-line breaks render correctly (no more double-Enter needed)
- Optional raw HTML support in preview (disabled sanitization)
- Resizable editor and preview panes
- Auto-save with visual indicator
- Smart block spacing for lists and images

### 🎨 **Customizable Themes**
- Multiple built‑in themes (Dark, Light, Green Forest, Deep Ocean, Sunset, Cyberpunk)
- Live theme switching with persistence
- Word wrap toggle (persisted per session)

### 🌍 **Multi-Language Support**
- English, French, Spanish, German
- Seamless language switching with localized UI

### 📁 **File Management**
- Create, import, and export markdown files
- Recent files quick access
- File rename and delete with confirmation
- Export to `.md`, `.txt`, and `.html` (PDF via system print dialog)
- **Drag & drop** .md files onto home screen to import
- Auto-delete empty untitled files (no clutter)
- External file deduplication (won't import the same file twice)
- Smart file caching with metadata tracking

### 🎮 **Discord Rich Presence**
- Show what you're working on in Discord
- Displays the current file being edited
- Toggle on/off in settings

### 🔄 **Automatic Updates**
- Checks automatically a few seconds after startup
- Background download with progress indicator
- When ready, you’ll see only two options: Restart Now or Later (no dismiss)
- Restart Now installs and relaunches the app automatically

### 🖼️ **Offline Images & Icons**
- Add images via the toolbar button; files are cached per document inside the app’s data folder
- Images render via a secure custom protocol: `app-images://...`
- Font Awesome is bundled locally for reliable offline icons

### 🔧 **Git Integration (optional)**
- Toggle Git features in Settings
- Connect a repository, enter commit message, and push directly from the editor footer
- Smart UI: hide repo connect fields after successful connection; quick commit/push for the open file

### 🎯 **Modern UI/UX**
- Frameless custom window design
- Smooth animations and transitions
- Intuitive onboarding experience
- Custom dialog system
- Responsive layout
- Streamlined settings with organized sections

### ⚡ **Command Palette** (Ctrl+Shift+P)
- **Toggle Word Wrap** - Soft wrap long lines (persisted)
- **Insert Timestamp** - Insert current date/time (YYYY-MM-DD HH:mm)
- **Convert to Task List** - Transform selected lines to `- [ ]` format
- **Toggle Task Checkbox** - Switch between `[ ]` and `[x]`
- Quick access to all editor commands

### ✨ **Smart Editor Features**
- Auto-exit lists with blank line (Enter on empty list item)
- Images automatically wrapped with newlines for clean spacing
- Smart paste detects image URLs and auto-formats them
- Enhanced error reporting for file operations

---

## 🚀 Getting Started

### Installation (Windows)

1. **Download the latest installer** from the [Releases page](https://github.com/naplon74/markedit/releases/latest)
2. **Run** `Markedit-x.y.z-Setup.exe`
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
- Empty untitled files are automatically deleted when you navigate away

### Importing Existing Files
- **Drag & drop** any `.md` file onto the home screen
- Or click **"Import File"** to browse for a file
- Duplicate imports are automatically detected and prevented
- Files are cached locally with metadata tracking

### Exporting Files
- Click the **export icon** in the editor toolbar
- Choose your format: Markdown, Text, or HTML
- For PDF, use your system's Print to PDF from the browser dialog

### Command Palette (Ctrl+Shift+P)
- **Toggle Word Wrap**: Enable/disable soft wrapping for long lines
- **Insert Timestamp**: Add current date/time at cursor position
- **Convert to Task List**: Transform selected lines into checkboxes
- **Toggle Task Checkbox**: Switch checkboxes between checked/unchecked

### Keyboard Shortcuts
- **Ctrl+Shift+P**: Open command palette
- **Ctrl+S**: Manual save
- **Tab** in editor: Insert 2 spaces
- **Enter** on empty list item: Exit list with clean spacing

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

#### Enable/Disable Git Integration
1. Open **Settings**
2. Toggle **"Enable Git Integration"**
3. When enabled, a Git panel appears at the bottom of the editor

#### Add Images
1. Click the **image button** in the toolbar
2. Select a local image; it will be copied into the app cache per file
3. The editor inserts a markdown reference using `app-images://...`
4. Images are automatically wrapped with newlines for proper spacing

### Settings & Customization

#### Organized Settings Sections
- **Appearance**: Theme selection with live preview
- **Language & Localization**: Choose your preferred language
- **Integrations**: Discord RPC and Git toggle
- **Changelog**: View all recent features and improvements
- **Danger Zone**: Reset app or delete all cached data

#### Danger Zone
- **Reset Application**: Clear settings and return to onboarding (files preserved)
- **Delete ALL Data**: Nuclear option - removes all cached files, drafts, images, and git repos

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

### Building (Windows)

```powershell
# Build Windows NSIS installer (x64) and update artifacts (latest.yml, blockmap)
npm run dist

# Build unpacked directory (for testing only)
npm run pack
```

Output will be placed in the `dist/` folder as a single installer:
- `Markedit-x.y.z-Setup.exe`
- Alongside update metadata: `latest.yml` and `.blockmap`

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

## 🌐 Supported Languages

- 🇬🇧 **English**
- 🇫🇷 **Français** (French)
- 🇪🇸 **Español** (Spanish)
- 🇩🇪 **Deutsch** (German)

---

## 📦 Technologies Used

- **Electron** - Desktop application framework
- **Marked** - Markdown parser and renderer
- **Font Awesome (bundled)** - Offline icons
- **simple-git** - Git operations
- **electron-builder** - Build and packaging
- **electron-updater** - Automatic updates

---

## 🔄 Auto-Updates

Markedit checks for updates a few seconds after startup and downloads them automatically. When the download completes, you’ll get:

1. An update banner with progress during download
2. Two choices once ready: **Restart Now** or **Later** (no dismiss)
3. Restart Now installs and relaunches the app automatically
4. Later will install on the next quit

For maintainers: releases are published to GitHub; ensure your CI or local environment provides `GH_TOKEN` when running `npm run dist` to upload artifacts.

---

## 🐛 Known Issues & Troubleshooting

- Discord RPC may take a few seconds to connect on first launch
- Drag-dropped files create new entries each time (no path-based deduplication due to browser security)
- DevTools are currently enabled for debugging (will be toggled off in production builds)
- If you previously saw duplicate installers/artifacts, the build now targets only NSIS x64 to produce a single `.exe` and its `.blockmap`
- If the app didn't relaunch after update in older versions, this has been improved; use the latest version for a smoother restart

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

### Completed ✅
- [x] Command palette with productivity utilities
- [x] Word wrap toggle with persistence
- [x] Auto-delete empty files
- [x] Drag & drop file import
- [x] Single-line break rendering
- [x] Smart block spacing
- [x] Task list utilities
- [x] External file deduplication
- [x] Organized settings sections
- [x] Comprehensive changelog

### Upcoming 🚀
- [ ] More export formats (DOCX, PDF native)
- [ ] Custom keyboard shortcuts
- [ ] Table generator dialog
- [ ] Plugin system
- [ ] Vim mode
- [ ] Content-based file deduplication
- [ ] Performance optimization for large files

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

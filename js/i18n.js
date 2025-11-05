// Minimal i18n helper
// Note: Assumes ipcRenderer is available globally from the parent page

const translations = {
  en: {
    settings_title: 'Settings',
    settings_subtitle: 'Customize your markdown editor experience',
    theme_section: 'Theme',
    theme_saved: 'Theme saved!',
    language_section: 'Language',
    app_language_label: 'App language',
    app_language_desc: 'Choose the language used across the app (requires restart for full effect).',
    language_saved: 'Language saved!',
    rpc_section: 'Discord Rich Presence',
    rpc_enable_label: 'Enable Discord RPC',
    rpc_desc: "Show what you're doing in Markedit on your Discord profile.",
    rpc_saved: 'Discord RPC setting saved!',
    git_section: 'Git Integration',
    git_enable_label: 'Enable Git Integration',
    git_enable_desc: 'Show Git panel in the editor to push your markdown files to GitHub repositories.',
    git_saved: 'Git integration setting saved!',
    danger_section: 'Danger zone',
    reset_app_label: 'Reset application',
    reset_app_desc: 'Clears all settings and returns to onboarding. Your files are not deleted.',
    reset_app_button: 'Reset app',
    back_to_home: 'Back to Home',

    home_welcome: 'Welcome back!',
    home_subtitle: 'Continue where you left off or start something new',
    new_file: 'New File',
    import_file: 'Import File',
    recent_files: 'Recent Files',
    empty_state: 'No files yet. Create your first markdown file!',
    rename: 'Rename',
    delete: 'Delete',

    editor_title: 'Editor',
    preview_title: 'Preview',
    placeholder_md: '# Start writing your markdown here...',
    go_home: 'Go to Home',
    export_file: 'Export File',
    add_image: 'Add Image',

    git_integration: 'Git Integration',
    git_repo_url: 'Repository URL',
    git_connect: 'Connect',
    git_disconnect: 'Disconnect',
    git_filename: 'Filename in repo',
    git_commit_msg: 'Commit message',
    git_push: 'Push to GitHub',

    clock: 'Clock',
    timer: 'Timer',
    countdown: 'Countdown',
    hours: 'Hours',
    minutes: 'Minutes',
    seconds: 'Seconds',
    start: 'Start',
    pause: 'Pause',
    reset: 'Reset',
    countdown_done_title: 'Countdown Finished!',
    countdown_done_body: 'Your countdown has reached zero.',
    
    onboarding_title: 'Welcome!',
    onboarding_subtitle: "Let's set up your Markdown Editor",
    onboarding_name_label: "What's your name?",
    onboarding_name_placeholder: 'Enter your name',
    onboarding_language_label: 'Preferred Language',
    onboarding_next: 'Next',
    onboarding_theme_title: 'Choose Your Theme',
    onboarding_theme_subtitle: 'Pick a theme that suits your style',
    onboarding_back: 'Back',
    onboarding_finish: 'Finish',
    theme_dark: 'Dark',
    theme_light: 'Light',
    theme_green_forest: 'Green forest',
    theme_deep_ocean: 'Deep ocean',
    theme_sunset: 'Sunset',
    theme_cyberpunk: 'Cyberpunk'
  },
  fr: {
    settings_title: 'Paramètres',
    settings_subtitle: "Personnalisez votre expérience d'éditeur Markdown",
    theme_section: 'Thème',
    theme_saved: 'Thème enregistré !',
    language_section: 'Langue',
    app_language_label: "Langue de l'application",
    app_language_desc: "Choisissez la langue utilisée dans l'application (redémarrage requis pour un effet complet).",
    language_saved: 'Langue enregistrée !',
    rpc_section: 'Présence Discord',
    rpc_enable_label: 'Activer Discord RPC',
    rpc_desc: 'Affiche votre activité Markedit sur votre profil Discord.',
    rpc_saved: 'Paramètre Discord RPC enregistré !',
    git_section: 'Intégration Git',
    git_enable_label: "Activer l'intégration Git",
    git_enable_desc: "Affiche le panneau Git dans l'éditeur pour pousser vos fichiers markdown vers des dépôts GitHub.",
    git_saved: "Paramètre d'intégration Git enregistré !",
    danger_section: 'Zone de danger',
    reset_app_label: "Réinitialiser l'application",
    reset_app_desc: "Réinitialise tous les paramètres et revient à l'onboarding. Vos fichiers ne sont pas supprimés.",
    reset_app_button: 'Réinitialiser',
    back_to_home: "Retour à l'accueil",

    home_welcome: 'Bon retour !',
    home_subtitle: 'Reprenez où vous vous êtes arrêté ou commencez quelque chose de nouveau',
    new_file: 'Nouveau fichier',
    import_file: 'Importer un fichier',
    recent_files: 'Fichiers récents',
    empty_state: 'Aucun fichier. Créez votre premier fichier Markdown !',
    rename: 'Renommer',
    delete: 'Supprimer',

    editor_title: 'Éditeur',
    preview_title: 'Aperçu',
    placeholder_md: '# Commencez à écrire votre markdown ici...',
    go_home: "Aller à l'accueil",
    export_file: 'Exporter le fichier',
    add_image: 'Ajouter une image',

    git_integration: 'Intégration Git',
    git_repo_url: 'URL du dépôt',
    git_connect: 'Connecter',
    git_disconnect: 'Déconnecter',
    git_filename: 'Nom du fichier dans le dépôt',
    git_commit_msg: 'Message de commit',
    git_push: 'Pousser vers GitHub',

    clock: 'Horloge',
    timer: 'Minuteur',
    countdown: 'Compte à rebours',
    hours: 'Heures',
    minutes: 'Minutes',
    seconds: 'Secondes',
    start: 'Démarrer',
    pause: 'Pause',
    reset: 'Réinitialiser',
    countdown_done_title: 'Compte à rebours terminé !',
    countdown_done_body: 'Votre compte à rebours est terminé.',
    
    onboarding_title: 'Bienvenue !',
    onboarding_subtitle: 'Configurons votre éditeur Markdown',
    onboarding_name_label: 'Comment vous appelez-vous ?',
    onboarding_name_placeholder: 'Entrez votre nom',
    onboarding_language_label: 'Langue préférée',
    onboarding_next: 'Suivant',
    onboarding_theme_title: 'Choisissez votre thème',
    onboarding_theme_subtitle: 'Choisissez un thème qui vous convient',
    onboarding_back: 'Retour',
    onboarding_finish: 'Terminer',
    theme_dark: 'Sombre',
    theme_light: 'Clair',
    theme_green_forest: 'Forêt verte',
    theme_deep_ocean: 'Océan profond',
    theme_sunset: 'Coucher de soleil',
    theme_cyberpunk: 'Cyberpunk'
  },
  es: {
    settings_title: 'Configuración',
    settings_subtitle: 'Personaliza tu experiencia con el editor Markdown',
    theme_section: 'Tema',
    theme_saved: '¡Tema guardado!',
    language_section: 'Idioma',
    app_language_label: 'Idioma de la aplicación',
    app_language_desc: 'Elige el idioma usado en la aplicación (requiere reinicio para efecto completo).',
    language_saved: '¡Idioma guardado!',
    rpc_section: 'Presencia de Discord',
    rpc_enable_label: 'Habilitar Discord RPC',
    rpc_desc: 'Muestra tu actividad en Markedit en tu perfil de Discord.',
    rpc_saved: '¡Ajuste de Discord RPC guardado!',
    git_section: 'Integración Git',
    git_enable_label: 'Habilitar integración Git',
    git_enable_desc: 'Muestra el panel Git en el editor para subir tus archivos markdown a repositorios de GitHub.',
    git_saved: '¡Ajuste de integración Git guardado!',
    danger_section: 'Zona de peligro',
    reset_app_label: 'Restablecer aplicación',
    reset_app_desc: 'Borra todos los ajustes y vuelve a la introducción. Tus archivos no se eliminan.',
    reset_app_button: 'Restablecer',
    back_to_home: 'Volver al inicio',

    home_welcome: '¡Bienvenido de nuevo!',
    home_subtitle: 'Continúa donde lo dejaste o empieza algo nuevo',
    new_file: 'Nuevo archivo',
    import_file: 'Importar archivo',
    recent_files: 'Archivos recientes',
    empty_state: 'Aún no hay archivos. ¡Crea tu primer archivo Markdown!',
    rename: 'Renombrar',
    delete: 'Eliminar',

    editor_title: 'Editor',
    preview_title: 'Vista previa',
    placeholder_md: '# Empieza a escribir tu markdown aquí...',
    go_home: 'Ir al inicio',
    export_file: 'Exportar archivo',
    add_image: 'Añadir imagen',

    git_integration: 'Integración Git',
    git_repo_url: 'URL del repositorio',
    git_connect: 'Conectar',
    git_disconnect: 'Desconectar',
    git_filename: 'Nombre del archivo en el repo',
    git_commit_msg: 'Mensaje de commit',
    git_push: 'Subir a GitHub',

    clock: 'Reloj',
    timer: 'Temporizador',
    countdown: 'Cuenta regresiva',
    hours: 'Horas',
    minutes: 'Minutos',
    seconds: 'Segundos',
    start: 'Iniciar',
    pause: 'Pausa',
    reset: 'Restablecer',
    countdown_done_title: '¡Cuenta regresiva terminada!',
    countdown_done_body: 'Tu cuenta regresiva ha llegado a cero.',
    
    onboarding_title: '¡Bienvenido!',
    onboarding_subtitle: 'Configuremos tu editor Markdown',
    onboarding_name_label: '¿Cómo te llamas?',
    onboarding_name_placeholder: 'Ingresa tu nombre',
    onboarding_language_label: 'Idioma preferido',
    onboarding_next: 'Siguiente',
    onboarding_theme_title: 'Elige tu tema',
    onboarding_theme_subtitle: 'Elige un tema que se adapte a tu estilo',
    onboarding_back: 'Atrás',
    onboarding_finish: 'Finalizar',
    theme_dark: 'Oscuro',
    theme_light: 'Claro',
    theme_green_forest: 'Bosque verde',
    theme_deep_ocean: 'Océano profundo',
    theme_sunset: 'Atardecer',
    theme_cyberpunk: 'Cyberpunk'
  },
  de: {
    settings_title: 'Einstellungen',
    settings_subtitle: 'Passe dein Markdown-Editor-Erlebnis an',
    theme_section: 'Design',
    theme_saved: 'Design gespeichert!',
    language_section: 'Sprache',
    app_language_label: 'App-Sprache',
    app_language_desc: 'Wähle die im gesamten Programm verwendete Sprache (Neustart ggf. erforderlich).',
    language_saved: 'Sprache gespeichert!',
    rpc_section: 'Discord Rich Presence',
    rpc_enable_label: 'Discord RPC aktivieren',
    rpc_desc: 'Zeigt deine Markedit-Aktivität in deinem Discord-Profil.',
    rpc_saved: 'Discord RPC-Einstellung gespeichert!',
    git_section: 'Git Integration',
    git_enable_label: 'Git Integration aktivieren',
    git_enable_desc: 'Zeigt Git-Panel im Editor, um deine Markdown-Dateien in GitHub-Repos zu pushen.',
    git_saved: 'Git-Integrationseinstellung gespeichert!',
    danger_section: 'Gefahrenbereich',
    reset_app_label: 'App zurücksetzen',
    reset_app_desc: 'Löscht alle Einstellungen und kehrt zur Einführung zurück. Deine Dateien werden nicht gelöscht.',
    reset_app_button: 'Zurücksetzen',
    back_to_home: 'Zur Startseite',

    home_welcome: 'Willkommen zurück!',
    home_subtitle: 'Mach dort weiter, wo du aufgehört hast, oder starte etwas Neues',
    new_file: 'Neue Datei',
    import_file: 'Datei importieren',
    recent_files: 'Zuletzt verwendet',
    empty_state: 'Noch keine Dateien. Erstelle deine erste Markdown-Datei!',
    rename: 'Umbenennen',
    delete: 'Löschen',

    editor_title: 'Editor',
    preview_title: 'Vorschau',
    placeholder_md: '# Schreibe hier dein Markdown...',
    go_home: 'Zur Startseite',
    export_file: 'Datei exportieren',
    add_image: 'Bild hinzufügen',

    git_integration: 'Git Integration',
    git_repo_url: 'Repository URL',
    git_connect: 'Verbinden',
    git_disconnect: 'Trennen',
    git_filename: 'Dateiname im Repo',
    git_commit_msg: 'Commit-Nachricht',
    git_push: 'Zu GitHub pushen',

    clock: 'Uhr',
    timer: 'Timer',
    countdown: 'Countdown',
    hours: 'Stunden',
    minutes: 'Minuten',
    seconds: 'Sekunden',
    start: 'Start',
    pause: 'Pause',
    reset: 'Zurücksetzen',
    countdown_done_title: 'Countdown beendet!',
    countdown_done_body: 'Dein Countdown ist abgelaufen.',
    
    onboarding_title: 'Willkommen!',
    onboarding_subtitle: 'Lass uns deinen Markdown-Editor einrichten',
    onboarding_name_label: 'Wie heißt du?',
    onboarding_name_placeholder: 'Gib deinen Namen ein',
    onboarding_language_label: 'Bevorzugte Sprache',
    onboarding_next: 'Weiter',
    onboarding_theme_title: 'Wähle dein Design',
    onboarding_theme_subtitle: 'Wähle ein Design, das zu dir passt',
    onboarding_back: 'Zurück',
    onboarding_finish: 'Fertig',
    theme_dark: 'Dunkel',
    theme_light: 'Hell',
    theme_green_forest: 'Grüner Wald',
    theme_deep_ocean: 'Tiefer Ozean',
    theme_sunset: 'Sonnenuntergang',
    theme_cyberpunk: 'Cyberpunk'
  }
};

let currentLang = 'en';

function t(key) {
  const table = translations[currentLang] || translations.en;
  return table[key] || translations.en[key] || key;
}

function applyTranslations(root = document) {
  const elements = root.querySelectorAll('[data-i18n]');
  elements.forEach(el => {
    const key = el.dataset.i18n;
    const attr = el.dataset.i18nAttr || 'text';
    const value = t(key);
    if (attr === 'html') el.innerHTML = value;
    else if (attr === 'placeholder' || attr === 'title' || attr === 'value') el.setAttribute(attr, value);
    else el.textContent = value;
  });
}

async function init() {
  try {
    // Use global ipcRenderer from electron (loaded by parent page)
    const { ipcRenderer } = require('electron');
    const settings = await ipcRenderer.invoke('load-settings');
    if (settings && settings.language) currentLang = settings.language;
  } catch (e) {
    console.warn('i18n: Could not load language setting:', e);
  }
  applyTranslations();
}

function setLanguage(lang) {
  if (translations[lang]) {
    currentLang = lang;
    applyTranslations();
  }
}

// Auto-initialize when loaded (non-blocking)
if (typeof window !== 'undefined') {
  window.i18n = { t, init, setLanguage, applyTranslations };
  // Don't auto-init here, let pages call it when ready
}

/**
 * ThemeManager - Handles theme switching and customization
 * Manages light/dark themes and user preferences
 */

export class ThemeManager {
  constructor() {
    this.currentTheme = 'dark';
    this.themes = {
      dark: {
        '--primary-bg': '#0a0a0a',
        '--secondary-bg': '#1a1a1a',
        '--accent-bg': '#2a2a2a',
        '--primary-text': '#ffffff',
        '--secondary-text': '#b0b0b0',
        '--muted-text': '#666666'
      },
      light: {
        '--primary-bg': '#ffffff',
        '--secondary-bg': '#f8f9fa',
        '--accent-bg': '#e9ecef',
        '--primary-text': '#212529',
        '--secondary-text': '#495057',
        '--muted-text': '#6c757d'
      },
      highContrast: {
        '--primary-bg': '#000000',
        '--secondary-bg': '#1a1a1a',
        '--accent-bg': '#333333',
        '--primary-text': '#ffffff',
        '--secondary-text': '#ffffff',
        '--muted-text': '#cccccc'
      }
    };

    this.init();
  }

  init() {
    // Load saved theme from localStorage
    const savedTheme = localStorage.getItem('tappmcp-theme');
    if (savedTheme && this.themes[savedTheme]) {
      this.currentTheme = savedTheme;
    }

    this.applyTheme(this.currentTheme);
    this.setupEventListeners();
  }

  setupEventListeners() {
    // Listen for system theme changes
    if (window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      mediaQuery.addEventListener('change', (e) => {
        if (!localStorage.getItem('tappmcp-theme')) {
          this.setTheme(e.matches ? 'dark' : 'light');
        }
      });
    }
  }

  setTheme(themeName) {
    if (!this.themes[themeName]) {
      console.warn(`Theme '${themeName}' not found`);
      return;
    }

    this.currentTheme = themeName;
    this.applyTheme(themeName);
    localStorage.setItem('tappmcp-theme', themeName);

    // Dispatch theme change event
    window.dispatchEvent(new CustomEvent('themeChanged', {
      detail: { theme: themeName }
    }));
  }

  applyTheme(themeName) {
    const theme = this.themes[themeName];
    const root = document.documentElement;

    Object.entries(theme).forEach(([property, value]) => {
      root.style.setProperty(property, value);
    });

    // Update theme indicator if it exists
    const themeIndicator = document.getElementById('themeIndicator');
    if (themeIndicator) {
      themeIndicator.textContent = themeName;
    }
  }

  getCurrentTheme() {
    return this.currentTheme;
  }

  getAvailableThemes() {
    return Object.keys(this.themes);
  }

  toggleTheme() {
    const themes = this.getAvailableThemes();
    const currentIndex = themes.indexOf(this.currentTheme);
    const nextIndex = (currentIndex + 1) % themes.length;
    this.setTheme(themes[nextIndex]);
  }

  // Custom theme support
  setCustomTheme(themeName, themeProperties) {
    this.themes[themeName] = themeProperties;
    this.setTheme(themeName);
  }

  // Reset to default theme
  resetTheme() {
    localStorage.removeItem('tappmcp-theme');
    this.setTheme('dark');
  }
}

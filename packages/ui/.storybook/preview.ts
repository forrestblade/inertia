import type { Preview } from '@storybook/web-components'
import { themeManager, ThemeMode } from '../src/tokens/theme-manager.js'
import { lightTokenSheet, darkTokenSheet } from '../src/tokens/token-sheets.js'

// Inject token sheets into the document for use in stories.
// Components adopt sheets via themeManager; we also inject into document
// adoptedStyleSheets so host-level styles pick up tokens.
const injectDocumentTokens = (resolved: 'light' | 'dark'): void => {
  const sheet = resolved === 'dark' ? darkTokenSheet : lightTokenSheet
  document.adoptedStyleSheets = [sheet]
}

const preview: Preview = {
  globalTypes: {
    theme: {
      description: 'Global theme for components',
      toolbar: {
        title: 'Theme',
        icon: 'circlehollow',
        items: [
          { value: 'light', icon: 'sun', title: 'Light' },
          { value: 'dark', icon: 'moon', title: 'Dark' },
          { value: 'system', icon: 'browser', title: 'System' }
        ],
        dynamicTitle: true
      }
    }
  },
  initialGlobals: {
    theme: 'light'
  },
  decorators: [
    (story, context) => {
      const themeValue = (context.globals['theme'] as string | undefined) ?? 'light'
      const modeMap: Record<string, ThemeMode> = {
        light: ThemeMode.Light,
        dark: ThemeMode.Dark,
        system: ThemeMode.System
      }
      const mode: ThemeMode = modeMap[themeValue] ?? ThemeMode.Light
      themeManager.setTheme(mode)
      const resolved = themeManager.resolveTheme()
      injectDocumentTokens(resolved)
      // Set background to match theme
      document.body.style.background = resolved === 'dark'
        ? 'var(--val-color-bg, #0f1117)'
        : 'var(--val-color-bg, #f9fafb)'
      return story()
    }
  ],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i
      }
    }
  }
}

export default preview
